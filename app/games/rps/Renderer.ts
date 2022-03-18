import { Game } from "./Game";
import { Loader } from "./Loader";
import { Camera } from "./Camera";
import { Map } from "./Map";

export interface RenderContext {
    game: Game;
    map: Map;
    camera: Camera;
    playerIsAlive: boolean;
    connectionState: string;
    players: any;
    tick: number;
}

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private loader: Loader;

    private tileAtlas: HTMLImageElement;
    private playerImage: HTMLImageElement;

    private fullScreenMessage: string;
    private gameRoot: HTMLElement;
    private spectator: boolean;

    constructor(gameRoot: HTMLElement, spectator: boolean = false) {
        this.loader = new Loader();
        this.gameRoot = gameRoot;
        this.spectator = spectator;
        this.resetElements();
    }

    private resetElements() {
        const canvas = document.createElement('canvas');
        canvas.id = "game";
        canvas.width = this.spectator ? 1280 : 512;
        canvas.height = this.spectator ? 1280 : 512;

        this.gameRoot.innerHTML = "";
        this.gameRoot.appendChild(canvas);

        this.ctx = canvas.getContext('2d');
    }

    public async init() {
        this.resetElements();
        await this.loader.loadImage('tiles', '/games/rps/assets/tiles.png');
        await this.loader.loadImage('player', '/games/rps/assets/character.png');
        this.tileAtlas = this.loader.getImage('tiles');
        this.playerImage = this.loader.getImage('player');
    }

    public render(renderContext: RenderContext) {
        const { playerIsAlive, connectionState } = renderContext;

        this.clear();
        this.drawLayer(renderContext);

        if (connectionState == "connected") {
            this.renderPlayers(renderContext);
        }

        if (!playerIsAlive) {
            this.writeText("You died! You'll respawn soon...");
        }

        if (this.fullScreenMessage) {
            this.writeText(this.fullScreenMessage);
        }
    }

    public clear() {
        this.ctx.clearRect(0, 0, 512, 512);
    }

    public drawLayer(renderContext: RenderContext) {
        const { camera, map } = renderContext;

        let startCol = Math.floor(camera.x / map.tileSize);
        let endCol = startCol + (camera.width / map.tileSize);
        let startRow = Math.floor(camera.y / map.tileSize);
        let endRow = startRow + (camera.height / map.tileSize);
        let offsetX = -camera.x + startCol * map.tileSize;
        let offsetY = -camera.y + startRow * map.tileSize;

        for (let c = startCol; c <= endCol; c++) {
            for (let r = startRow; r <= endRow; r++) {
                let tile = map.getTile(c, r);
                let x = (c - startCol) * map.tileSize + offsetX;
                let y = (r - startRow) * map.tileSize + offsetY;
                if (tile.type !== 0) { // 0 => empty tile
                    this.ctx.drawImage(
                        this.tileAtlas, // image
                        (tile.type - 1) * map.tileSize, // source x
                        0, // source y
                        map.tileSize, // source width
                        map.tileSize, // source height
                        Math.round(x),  // target x
                        Math.round(y), // target y
                        map.tileSize, // target width
                        map.tileSize // target height
                    );
                }
            }
        }
    }

    public writeText(message: string) {
        this.ctx.font = '20px serif';
        this.ctx.fillText(message, 100, 100);
    }

    public async display(message: string, duration: number) {
        this.fullScreenMessage = message;
        await wait(duration);
        this.fullScreenMessage = null;
    }

    public async renderPlayers(renderContext: RenderContext) {
        const { game, players } = renderContext;

        for (const player of players) {
            if (player.data == undefined) {
                continue;
            }

            if (!player.data.alive && game.waitingForDeath.has(player.data.id)) {
                game.waitingForDeath.delete(player.data.id);
            }
            this.drawPlayer(renderContext, player.data);
        }
    }

    public drawPlayer(renderContext: RenderContext, player) {
        const { camera, map } = renderContext;

        if (!player.alive || player.spectator) {
            return;
        }

        let x = player.x - camera.x;
        let y = player.y - camera.y;

        // this.ctx.fillRect(x, y, map.tileSize, map.tileSize);

        this.ctx.drawImage(
            this.playerImage, // image
            player.color * player.width, // source x
            Math.floor(renderContext.tick / 2 % 2) * map.tileSize,  // source y
            player.width, // source width
            player.height, // source height
            x,
            y,
            player.width,
            player.height
        );

        this.ctx.font = '12px serif';
        this.ctx.fillText(player.name, x, y - 15);
    }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
