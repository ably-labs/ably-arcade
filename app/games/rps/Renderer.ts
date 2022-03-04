import { Game } from "./Game";
import { Loader } from "./Loader";

export class Renderer {

    private ctx: any;
    private game: Game;
    private loader: Loader;
    
    private tileAtlas: any;
    private playerImage: any;

    constructor(game: Game, canvasTarget: HTMLCanvasElement) {
        this.ctx = canvasTarget.getContext('2d');
        this.game = game;    
        this.loader = new Loader();
    }

    public async init() {        
        await this.loader.loadImage('tiles', './games/rps/assets/tiles.png');
        await this.loader.loadImage('player', './games/rps/assets/character.gif');
        this.tileAtlas = this.loader.getImage('tiles');        
        this.playerImage = this.loader.getImage('player');
    }
    
    public drawGrid = function () {
        let width = this.game.map.cols * this.game.map.tileSize;
        let height = this.game.map.rows * this.game.map.tileSize;
        
        let x, y;
        
        for (let r = 0; r < this.game.map.rows; r++) {
            x = - this.game.camera.x;
            y = r * this.game.map.tileSize - this.game.camera.y;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }

        for (let c = 0; c < this.game.map.cols; c++) {
            x = c * this.game.map.tileSize - this.game.camera.x;
            y = - this.game.camera.y;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
    }

    public clear() {    
        this.ctx.clearRect(0, 0, 512, 512);
    }

    public drawLayer(layer: number) {
        let startCol = Math.floor(this.game.camera.x / this.game.map.tileSize);
        let endCol = startCol + (this.game.camera.width / this.game.map.tileSize);
        let startRow = Math.floor(this.game.camera.y / this.game.map.tileSize);
        let endRow = startRow + (this.game.camera.height / this.game.map.tileSize);
        let offsetX = -this.game.camera.x + startCol * this.game.map.tileSize;
        let offsetY = -this.game.camera.y + startRow * this.game.map.tileSize;
    
        for (let c = startCol; c <= endCol; c++) {
            for (let r = startRow; r <= endRow; r++) {
                let tile = this.game.map.getTile(c, r);
                let x = (c - startCol) * this.game.map.tileSize + offsetX;
                let y = (r - startRow) * this.game.map.tileSize + offsetY;
                if (tile !== 0) { // 0 => empty tile
                    this.ctx.drawImage(
                        this.tileAtlas, // image
                        (tile - 1) * this.game.map.tileSize, // source x
                        0, // source y
                        this.game.map.tileSize, // source width
                        this.game.map.tileSize, // source height
                        Math.round(x),  // target x
                        Math.round(y), // target y
                        this.game.map.tileSize, // target width
                        this.game.map.tileSize // target height
                    );
                }
            }
        }
    }

    public writeText(message: string) {
        this.ctx.font = '20px serif';
        this.ctx.fillText(message, 100, 100);
    }

    public async renderPlayers() {
        // draw all enemies
        const players = await this.game.ablyHandler.playerPositions();
    
        const scores = [];
    
        for (const player of players) {
            if (player.data == undefined) {
                continue;
            }
            scores.push({ 'name': player.data.name, 'score': player.data.score});
    
            if (!player.data.alive && this.game.waitingForDeath.has(player.data.id)) {
                this.game.waitingForDeath.delete(player.data.id);
                this.game.myPlayer.score++;
            }
            this.drawPlayer(player.data);
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

    public drawPlayer(player) {
        if (!player.alive) {
            return;
        }
    
        let x = player.x - this.game.camera.x;
        let y = player.y - this.game.camera.y;
    
        this.ctx.drawImage(
            this.playerImage, // image
            player.color * player.width, // source x
            Math.floor(this.game.frame / 2 % 2) * this.game.map.tileSize,  // source y
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
    
    public clearScoreboard(){
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
