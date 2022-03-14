export interface TileDetails {
    col: number;
    row: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
    type: number;
}

export class Map {
    public cols: number;
    public rows: number;
    public tileSize: number;
    public tiles: number[];

    private spawnPoints: TileDetails[];

    constructor(level: string[]) {
        this.tileSize = 64;

        this.setLevel(level);
    }

    public setLevel(level: string[]) {
        this.cols = level[0].length;
        this.rows = level.length;

        const tileRows = level.map(row => row.split('').map(tile => {
            if (tile === '#') {
                return 3;
            } else if (tile === ' ') {
                return 1;
            }
        }));

        this.tiles = tileRows.reduce((a, b) => a.concat(b), []);
        this.spawnPoints = this.getSafeStartingLocations();
    }

    public getTile(col: number, row: number) {
        const tile = this.tiles[row * this.cols + col];

        const top = row * this.tileSize;
        const left = col * this.tileSize;
        const right = left + this.tileSize;
        const bottom = top + this.tileSize;

        return { col, row, top, left, right, bottom, type: tile };
    }

    public canTraverse(col: number, row: number) {
        const tile = this.getTile(col, row);
        return tile.type === 1;
    }

    public pickSpawnPoint() {
        if (this.spawnPoints.length === 0) {
            throw new Error("No safe spawn points found in map.");
        }

        const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
        const randomNumber = randomInt(0, this.spawnPoints.length - 1);
        return this.spawnPoints[randomNumber];
    }


    public toTileDetails(location: { x: number; y: number; }): TileDetails {
        const { x, y } = location;
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);
        const tile = this.getTile(col, row);
        return tile;
    }

    private getSafeStartingLocations(): TileDetails[] {
        const safeLocations = [];

        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows; row++) {
                if (this.canTraverse(col, row)) {
                    safeLocations.push(this.getTile(col, row));
                }
            }
        }

        return safeLocations;
    }
}
