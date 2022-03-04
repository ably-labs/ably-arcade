import { Map } from "./Map";

export class Player {
    
    public id: string;
    public x: any;
    public y: any;
    public width: any;
    public height: any;
    public name: any;
    public moved: boolean;
    public alive: boolean;
    public respawned: boolean;
    public score: number;

    public static SPEED = 20;
    
    public color: number;
    
    private mapCols: number;
    private mapRows: number;
 
    constructor(map: Map, name: string, x: number, y: number) {
        this.id = uuidv4();
        this.x = x;
        this.y = y;
        
        this.width = map.tileSize;
        this.height = map.tileSize;
        this.mapCols = map.cols;
        this.mapRows = map.rows;

        this.name = name;
        this.moved = false;
        this.alive = true;
        this.respawned = false;
        this.score = 0;
    
        this.newColor();
    }
    
    public newColor() {
        this.color = Math.floor(Math.random() * 3);
    }

    public move(delta, dirx, diry) {
        if (!this.alive) {
            return;
        }

        // move my player
        let oldX = this.x;
        let oldY = this.y;
    
        this.x += dirx * Player.SPEED;
        this.y += diry * Player.SPEED;
    
        // clamp values
        let maxX = (this.mapCols - 1) * this.width;
        let maxY = (this.mapRows - 1) * this.height;
        this.x = Math.max(this.width, Math.min(this.x, maxX - this.width));
        this.y = Math.max(this.height, Math.min(this.y, maxY - this.height));
    
        if (this.x != oldX || this.y != oldY) {
            this.moved = true;
        }
    }
    
    public respawn() {
        this.alive = true;
        this.respawned = true;
    
        this.x = randomInt(64, 64 * (this.width - 1));
        this.y = randomInt(64, 64 * (this.height - 1));
    }
}


function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function uuidv4(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
