import { Game } from "./Game";
import { Loader } from "./Loader";
import { Camera } from "./Camera";
import { Map } from "./Map";
import { IAssetSource } from "./IAssetSource";

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
    private assetSource: IAssetSource;

    public canvas: HTMLCanvasElement;

    constructor(gameRoot: HTMLElement, spectator: boolean = false, assetSource: IAssetSource = null) {
        this.loader = new Loader();
        this.gameRoot = gameRoot;
        this.spectator = spectator;
        this.assetSource = assetSource;
        this.resetElements();
    }

    private resetElements() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = "game";
        this.canvas.width = this.spectator ? 1280 : 512;
        this.canvas.height = this.spectator ? 1280 : 512;

        this.gameRoot.innerHTML = "";
        this.gameRoot.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
    }

    public async init() {
        if (!this.assetSource) {
            const { ViteAssetSource } = await import('./assets/ViteAssetSource');
            this.assetSource = new ViteAssetSource();
        }

        this.resetElements();
        const assetPaths = this.assetSource.getAssets();
        await this.loader.loadImage('tiles', assetPaths.get('tiles'));
        await this.loader.loadImage('player', assetPaths.get('player'));
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
        this.ctx.font = 'bold 20px sans-serif';
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

        let offset = -5;

        this.ctx.font = 'bold 15px sans-serif';
        this.ctx.fillStyle = "rgb(0,0,0)";
        this.ctx.fillText(player.name, x - 1 + offset, y - 1 + offset);
        this.ctx.fillText(player.name, x + 1 + offset, y - 1 + offset);
        this.ctx.fillText(player.name, x - 1 + offset, y + offset);
        this.ctx.fillText(player.name, x + 1 + offset, y + offset);
        this.ctx.fillText(player.name, x - 1 + offset, y + 1 + offset);
        this.ctx.fillText(player.name, x + 1 + offset, y + 1 + offset);

        this.ctx.fillStyle = "rgb(255,255,255)";


        this.ctx.fillText(player.name, x + offset, y + offset);
    }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
