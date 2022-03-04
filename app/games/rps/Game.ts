import { Keyboard } from "./Keyboard";
import { Camera } from "./Camera";
import { Map } from "./Map";
import { Loader } from "./Loader";
import { Player } from "./Player";
import { AblyHandler } from "./AblyHandler";
import { Renderer } from "./Renderer";

const sqrt2 = Math.sqrt(1/2);

const height = 20;
const width = 20;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}  

export class Game {
    
    public gameId: string;

    private now;
    private then;
    private elapsed;
    private _previousElapsed;

    public frame;
    private fpsInterval;
    private fps;

    public myPlayer: Player;
    public ablyHandler;

    private keyboard: Keyboard;
    public camera: Camera;
    public waitingForDeath: Set<string>;

    public map: Map;
    
    private playerName: string;
    private renderer: Renderer;

    public constructor(gameId: string, canvasTarget: HTMLCanvasElement) {
        this.gameId = gameId;
        this.keyboard = new Keyboard();
        this.map = new Map(width, height);
        this.renderer = new Renderer(this, canvasTarget);
        this.fps = 10;
        this.frame = 0;
    }

    public async preStart() {
        this._previousElapsed = 0;    
        this.fpsInterval = 1000 / this.fps;
        this.then = Date.now();

        await this.renderer.init();

        this.playerName = "Player name from somewhere";

        window.requestAnimationFrame(() => { 
            this.tick(); 
        });

        this.start(); // maybe something on the outside should call this?
    }

    public start() {
        this.keyboard.listenForEvents([Keyboard.LEFT, Keyboard.RIGHT, Keyboard.UP, Keyboard.DOWN]);

        const playerStartX = randomInt(64, 64 * (width - 1));
        const playerStartY = randomInt(64, 64 * (height - 1));
    
        this.myPlayer = new Player(this.map, this.playerName, playerStartX, playerStartY);
        this.ablyHandler = new AblyHandler(this.myPlayer, this.gameId);
        
        this.camera = new Camera(this.map, 512, 512);
        this.camera.follow(this.myPlayer);
        
        this.waitingForDeath = new Set();
    
        setInterval(() => { 
            this.ablyHandler.shouldChangeColor = true
        }, 5000);
    }

    public tick() {
        window.requestAnimationFrame(() => { 
            this.tick(); 
        });

        this.now = Date.now();
        this.elapsed = this.now - this.then;
    
        // if enough time has elapsed, draw the next frame
    
        if (this.elapsed > this.fpsInterval) {
            this.then = this.now - (this.elapsed % this.fpsInterval);
    
            this.renderer.clear();
    
            var delta = (this.elapsed - this._previousElapsed) / 1000.0;
            delta = Math.min(delta, 0.25); // maximum delta of 250 ms
            this._previousElapsed = this.elapsed;
    
            this.update(delta);
            this.render();
        }
    }

    public handleInput() {

    }

    public render() {
        this.renderer.drawLayer(0);

        if (this.ablyHandler.connection.connection.state == "connected") {
            this.renderer.renderPlayers();
        }
    
        this.renderer.drawGrid();
    
        if (!this.myPlayer.alive) {
            this.renderer.writeText("You died! You'll respawn soon...");
        }
    }

    private update(delta) {
        if (this.myPlayer.respawned) {
            this.myPlayer.respawned = false;
            this.ablyHandler.updateState(this.myPlayer);
        }

        this.frame++;
        // handle my player's movement with arrow keys
        let dirx = 0;
        let diry = 0;

        if (this.keyboard.isDown(Keyboard.LEFT)) { dirx = -1; }
        else if (this.keyboard.isDown(Keyboard.RIGHT)) { dirx = 1; }
        if (this.keyboard.isDown(Keyboard.UP)) { diry = -1; }
        else if (this.keyboard.isDown(Keyboard.DOWN)) { diry = 1; }

        let sum = Math.abs(dirx) + Math.abs(diry);
        if (sum == 2) {
            dirx *= sqrt2;
            diry *= sqrt2;
        }

        this.myPlayer.move(delta, dirx, diry);

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
    
            if (this.myPlayer.id != player.data.id && this.myPlayer.alive && this.myPlayerWins(this.myPlayer, player.data) && 
                this.playersAreTouching(this.myPlayer, player.data)) {
    
                this.waitingForDeath.add(player.data.id);
                this.ablyHandler.sendMessage(player.data.id, 'kill');
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
