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

    constructor(canvasTarget: HTMLCanvasElement) {
        this.ctx = canvasTarget.getContext('2d');
        this.loader = new Loader();
    }

    public async init() {        
        await this.loader.loadImage('tiles', './games/rps/assets/tiles.png');
        await this.loader.loadImage('player', './games/rps/assets/character.gif');
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
    
        this.drawGrid(renderContext);
    
        if (!playerIsAlive) {
            this.writeText("You died! You'll respawn soon...");
        }
    }
    
    public drawGrid(renderContext: RenderContext) {
        const { camera, map } = renderContext;

        let width = map.cols * map.tileSize;
        let height = map.rows * map.tileSize;
        
        let x: number, y: number;
        
        for (let r = 0; r < map.rows; r++) {
            x = - camera.x;
            y = r * map.tileSize - camera.y;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }

        for (let c = 0; c < map.cols; c++) {
            x = c * map.tileSize - camera.x;
            y = - camera.y;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
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
                if (tile !== 0) { // 0 => empty tile
                    this.ctx.drawImage(
                        this.tileAtlas, // image
                        (tile - 1) * map.tileSize, // source x
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

    public async renderPlayers(renderContext: RenderContext) {
        const { game, players } = renderContext;
            
        const scores = [];
    
        for (const player of players) {
            if (player.data == undefined) {
                continue;
            }
            scores.push({ 'name': player.data.name, 'score': player.data.score});
    
            if (!player.data.alive && game.waitingForDeath.has(player.data.id)) {
                game.waitingForDeath.delete(player.data.id);
            }
            this.drawPlayer(renderContext, player.data);
        }

        this.clearScoreboard();

        const compare = (a, b) => {
            if (a.score < b.score){
              return -1;
            }
            if (a.score > b.score){
              return 1;
            }
            return 0;
        };

        scores.sort(compare);

        this.updateList(scores);
    }

    public drawPlayer(renderContext: RenderContext, player) {
        const { camera, map } = renderContext;

        if (!player.alive) {
            return;
        }
    
        let x = player.x - camera.x;
        let y = player.y - camera.y;
    
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
    
    public clearScoreboard() {
        // document.getElementById("scoreboard").innerHTML = ""; // um!
    }

    public updateList(ranks) {
        /*let ul = document.getElementById("scoreboard"); 
        for (let i=0; i < ranks.length; i++) {
            let li = document.createElement("li");
            let span = document.createElement("span");
            span.appendChild(document.createTextNode(ranks[i].score));
            li.appendChild(document.createTextNode(ranks[i].name));
            li.appendChild(span);
            ul.appendChild(li);
        }*/
    }
    
}
