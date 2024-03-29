import { Keyboard } from "../Keyboard";
import { Camera } from "./Camera";
import { Map as GameMap } from "./Map";
import { Player } from "./Player";
import { AblyHandler } from "./AblyHandler";
import { Renderer } from "./Renderer";
import { IGame, GameEndSummary, TickContext, Scoreboard } from "../IGame";
import Level from "./Levels";
import { IAssetSource } from "./IAssetSource";

export type MovementDelta = { x: number, y: number };

export class Game implements IGame {
    public gameId: string;
    public tickRate: number;
    public myPlayer: Player;
    public scoreboard: Scoreboard[];
    public gameEnded: (summary: GameEndSummary) => void = () => { };
    public playerName: string;
    public colorChangeInterval: number;
    public spectator: boolean;

    private keybindings: Map<Number, (delta: MovementDelta) => void>;

    public waitingForDeath: Set<string>;

    private camera: Camera;
    private renderer: Renderer;
    private ablyHandler: AblyHandler;
    private map: GameMap;

    private sqrt2: number;

    private shouldChangeColor: boolean;

    private gameState: any;

    public constructor(gameId: string, gameRoot: HTMLElement, spectator: boolean = false, assetSource: IAssetSource = null) {
        this.gameId = gameId;
        this.spectator = spectator;
        this.ablyHandler = new AblyHandler();

        this.renderer = new Renderer(gameRoot, spectator, assetSource);
        this.tickRate = 10;

        this.sqrt2 = Math.sqrt(1 / 2);

        this.keybindings = new Map<Number, (delta: MovementDelta) => void>();
        this.keybindings.set(Keyboard.LEFT, (d) => { d.x = -1 });
        this.keybindings.set(Keyboard.RIGHT, (d) => { d.x = 1 });
        this.keybindings.set(Keyboard.UP, (d) => { d.y = -1 });
        this.keybindings.set(Keyboard.DOWN, (d) => { d.y = 1 });

        this.colorChangeInterval = 5_000;
    }
    
    public async loadMap() {
        const seed = await this.ablyHandler.getMap(this.gameId);
        const mapSelection = Math.floor(seed % (Level.length - 1));
        this.map = new GameMap(Level[mapSelection]);
    }

    public async preStart(playerName: string = null) {
        await this.renderer.init();
        this.playerName = playerName || "Unknown";
    }

    public start() {
        if (this.spectator) {
            this.myPlayer = Player.spectator(this.map);
            this.camera = Camera.spectatorCamera(this.map);
        } else {
            this.myPlayer = Player.spawnPlayerInSafeLocation(this.map, this.playerName);
            this.camera = Camera.followingCamera(this.map, this.myPlayer);
        }

        this.waitingForDeath = new Set();

        setInterval(() => {
            this.shouldChangeColor = true;
        }, this.colorChangeInterval);

        this.ablyHandler.connect(this.myPlayer, this.gameId);
    }

    public startContest(duration: number, seed: number) {
        const mapSelection = Math.floor(seed % (Level.length - 1));
        const level = Level[mapSelection];

        this.map.setLevel(level);
        this.myPlayer.map = this.map;

        this.myPlayer.score = 0;
        this.myPlayer.respawn();
        this.ablyHandler.updateState(this.myPlayer);
    }

    public stop(forced: boolean = false) {
        if (forced) {
            this.endGame();
        }

        this.ablyHandler.disconnect();
    }

    public async render(ctx: TickContext) {
        const players = await this.ablyHandler.playerMetadata();

        const renderContext = {
            game: this,
            map: this.map,
            camera: this.camera,
            playerIsAlive: this.myPlayer.alive,
            connectionState: this.ablyHandler.connectionState,
            players: players,
            tick: ctx.tick,
        };

        this.renderer.render(renderContext);
    }

    public async update(ctx: TickContext) {
        const { keyboardState } = ctx;

        if (this.myPlayer.respawned) {
            this.myPlayer.respawned = false;
            this.ablyHandler.updateState(this.myPlayer);
        }

        const movementDelta = this.computeMovement(keyboardState);

        this.myPlayer.move(movementDelta, this.map);

        if (this.myPlayer.moved) {
            this.myPlayer.moved = false;
            this.ablyHandler.updateState(this.myPlayer);
        }

        if (this.shouldChangeColor) {
            this.shouldChangeColor = false;
            this.myPlayer.newColor();
            this.ablyHandler.updateState(this.myPlayer);
        }

        this.gameState = await this.ablyHandler.playerMetadata();
        this.scoreboard = this.generateScores(this.gameState);

        this.checkIfPlayerDied();
        this.camera.update();
    }

    private computeMovement(keyboardState: Keyboard) {
        const movementDelta = { x: 0, y: 0 };

        // Keys
        this.keybindings.forEach((adjustFn, keyCode) => {
            if (keyboardState.isPressed(keyCode)) {
                adjustFn(movementDelta);
            }
        });

        this.computeTouchMovement(keyboardState, movementDelta);

        let sum = Math.abs(movementDelta.x) + Math.abs(movementDelta.y);
        if (sum == 2) {
            movementDelta.x *= this.sqrt2;
            movementDelta.y *= this.sqrt2;
        }

        return movementDelta;
    }

    private computeTouchMovement(keyboardState: Keyboard, movementDelta: MovementDelta) {
        const worldLoc = {
            x: this.myPlayer.x - this.camera.x + (this.myPlayer.width / this.camera.scale),
            y: this.myPlayer.y - this.camera.y + (this.myPlayer.height / this.camera.scale),
        };

        if (keyboardState.touchLocation?.x !== -1 || keyboardState.touchLocation?.y !== -1) {
            const touchLoc = {
                x: keyboardState.touchLocation.x,
                y: keyboardState.touchLocation.y
            };

            const targetRect = this.renderer.canvas.getBoundingClientRect();
            const widthPercentage = (targetRect.width / this.renderer.canvas.width);
            const heightPercentage = (targetRect.height / this.renderer.canvas.height);

            const scaledWorldX = worldLoc.x * widthPercentage;
            const scaledWorldY = worldLoc.y * heightPercentage;

            var dx = touchLoc.x - scaledWorldX;
            var dy = touchLoc.y - scaledWorldY;
            var angle = Math.atan2(dy, dx);
            var magnitude = 1.0;
            var velX = Math.cos(angle) * magnitude;
            var velY = Math.sin(angle) * magnitude;

            movementDelta.x = velX;
            movementDelta.y = velY;
        }
    }

    private async checkIfPlayerDied() {
        for (const player of this.gameState) {
            if (player.data == undefined || !player.data.alive) {
                continue;
            }

            if (player.data.spectator) {
                continue;
            }

            if (this.myPlayer.id != player.data.id
                && this.myPlayer.alive
                && this.myPlayerWins(this.myPlayer, player.data)
                && this.playersAreTouching(this.myPlayer, player.data)) {

                this.waitingForDeath.add(player.data.id);
                this.ablyHandler.killPlayer(player.data.id);
                this.myPlayer.score++;
            }
        }
    }

    private myPlayerLoses(player1, player2) {
        return ((player1.color + 1) % 3) == player2.color;
    }

    private myPlayerWins(player1, player2) {
        return ((player1.color + 1) % 3) == player2.color && !this.waitingForDeath.has(player2.id);
    }

    private playersAreTouching(player1, player2) {
        if (player1.x >= (player2.x + player2.width) || player2.x >= (player1.x + player1.width)) return false;

        // no vertical overlap
        if (player1.y >= (player2.y + player2.height) || player2.y >= (player1.y + player1.height)) return false;

        return true;
    }

    private async endGame() {
        this.gameEnded({
            scores: this.scoreboard,
        });
    }

    private generateScores(players) {
        const scores = [];

        const playersExceptSpectators = players.filter(player => !player.data.spectator);

        for (const player of playersExceptSpectators) {
            scores.push({ 'name': player.data.name, 'score': player.data.score });
        }

        scores.sort((a, b) => b.score - a.score);
        return scores;
    }
}
