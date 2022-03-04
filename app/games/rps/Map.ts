export class Map {    
    public cols: number;
    public rows: number;
    public tileSize: number;
    public tiles: number[];

    constructor(width: number, height: number) {
        this.cols = 20;
        this.rows = 20;
        this.tileSize = 64;
        this.tiles = new Array(height * width).fill(1);

        // Add tree border
        for (let z = 0; z < width * height; z++) {
            if (Math.floor(z / width) === 0 ||
                z % width === 0 ||
                z % height == height - 1 ||
                Math.floor(z / width) == height - 1) {

                this.tiles[z] = 3;
            }
        }
    } 
    
    public getTile(col: number, row: number) {
        return this.tiles[row * this.cols + col];
    }
}
