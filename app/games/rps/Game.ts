import { Keyboard } from "../Keyboard";
import { Camera } from "./Camera";
import { Map } from "./Map";
import { Player } from "./Player";
import { AblyHandler } from "./AblyHandler";
import { Renderer } from "./Renderer";
import { IGame, GameEndSummary, TickContext } from "../IGame";

export class Game implements IGame {
    public gameId: string;
    public tickRate: number;
    public myPlayer: Player;
    public gameEnded: (summary: GameEndSummary) => void;

    public waitingForDeath: Set<string>;
    
    private playerName: string;
    private camera: Camera;
    private renderer: Renderer;
    private ablyHandler: AblyHandler;
    private map: Map;

    private sqrt2: number;

    public constructor(gameId: string, canvasTarget: HTMLCanvasElement) {
        this.gameId = gameId;

        this.map = new Map(20, 20);
        this.renderer = new Renderer(canvasTarget);
        this.tickRate = 10;

        this.sqrt2 = Math.sqrt(1/2);
    }

    public async preStart() {
        await this.renderer.init();
        this.playerName = "Player name from somewhere";
    }

    public start() {
        const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
        const playerStartX = randomInt(64, 64 * (this.map.cols - 1));
        const playerStartY = randomInt(64, 64 * (this.map.rows - 1));
    
        this.myPlayer = new Player(this.map, this.playerName, playerStartX, playerStartY);
        this.ablyHandler = new AblyHandler(this.myPlayer, this.gameId);
        
        this.camera = new Camera(this.map, 512, 512);
        this.camera.follow(this.myPlayer);
        
        this.waitingForDeath = new Set();
    
        setInterval(() => { 
            this.ablyHandler.shouldChangeColor = true
        }, 5000);
    }

    public async render(ctx: TickContext) {
        const players = await this.ablyHandler.playerPositions();

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

    public update(ctx: TickContext) {
        const { keyboardState } = ctx;

        if (this.myPlayer.respawned) {
            this.myPlayer.respawned = false;
            this.ablyHandler.updateState(this.myPlayer);
        }

        // handle my player's movement with arrow keys
        let dirX = 0;
        let dirY = 0;

        if (keyboardState.isPressed(Keyboard.LEFT)) { dirX = -1; }
        else if (keyboardState.isPressed(Keyboard.RIGHT)) { dirX = 1; }
        if (keyboardState.isPressed(Keyboard.UP)) { dirY = -1; }
        else if (keyboardState.isPressed(Keyboard.DOWN)) { dirY = 1; }

        let sum = Math.abs(dirX) + Math.abs(dirY);
        if (sum == 2) {
            dirX *= this.sqrt2;
            dirY *= this.sqrt2;
        }

        this.myPlayer.move(dirX, dirY);

        if (this.myPlayer.moved) {
            this.myPlayer.moved = false;
            this.ablyHandler.updateState(this.myPlayer);
        }

        if (this.ablyHandler.shouldChangeColor) {
            this.ablyHandler.shouldChangeColor = false;
            this.myPlayer.newColor();
            this.ablyHandler.updateState(this.myPlayer);
        }

        this.checkIfPlayerDied();

        this.camera.update();
    }

    private async checkIfPlayerDied() {
        let players = await this.ablyHandler.playerPositions();
    
        for (const player of players) {
            if (player.data == undefined || !player.data.alive) {
                continue;
            }
    
            if (this.myPlayer.id != player.data.id 
                && this.myPlayer.alive 
                && this.myPlayerWins(this.myPlayer, player.data) 
                && this.playersAreTouching(this.myPlayer, player.data)) {
    
                this.waitingForDeath.add(player.data.id);
                this.ablyHandler.sendMessage(player.data.id, 'kill');
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
}
