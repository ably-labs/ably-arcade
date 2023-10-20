import { MovementDelta } from "./Game";
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

    public spectator: boolean;

    public map: Map;

    constructor(map: Map, name: string, x: number, y: number, spectator: boolean = false) {
        this.id = uuidv4();
        this.x = x;
        this.y = y;
        this.spectator = spectator;

        this.map = map;
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

    public move(movementDelta: MovementDelta, map: Map) {
        if (!this.alive) {
            return;
        }

        let targetX = this.x + (movementDelta.x * Player.SPEED);
        let targetY = this.y + (movementDelta.y * Player.SPEED);

        const movementRequest = {
            x: targetX,
            y: targetY,
            originalX: this.x,
            originalY: this.y,
            movementDelta
        };

        const collisionReport = this.checkEnvironmentCollision(movementRequest, map);
        this.x = collisionReport.x;
        this.y = collisionReport.y;

        // clamp values
        let maxX = (this.mapCols - 1) * this.width;
        let maxY = (this.mapRows - 1) * this.height;
        this.x = Math.max(this.width, Math.min(this.x, maxX - this.width));
        this.y = Math.max(this.height, Math.min(this.y, maxY - this.height));

        if (this.x != movementRequest.originalX || this.y != movementRequest.originalY) {
            this.moved = true;
        }
    }

    private checkEnvironmentCollision(movementRequest, map: Map) {
        const { x, y } = movementRequest;

        const getBoxCorners = this.cornerLocations(x, y);
        const result = { canTraverse: true, x: x, y: y };

        for (const corner of getBoxCorners) {
            const tileDetails = map.toTileDetails(corner);
            if (!map.canTraverse(tileDetails.col, tileDetails.row)) {
                this.capMovement(movementRequest, result);
            }
        }

        return result;
    }

    private capMovement(movementRequest, result) {
        if (movementRequest.movementDelta.x !== 0) {
            result.x = movementRequest.originalX;
        }
        if (movementRequest.movementDelta.y !== 0) {
            result.y = movementRequest.originalY;
        }
    }

    private cornerLocations(x: number, y: number) {
        // We're going to use a phyisically smaller collision box
        // than the rendered tile to give the game a better game-feel

        const quarterWidth = this.width / 4;
        const quarterHeight = this.height / 4;

        const left = x + quarterWidth;
        const top = y + quarterHeight;
        const right = x + this.width - quarterWidth;
        const bottom = y + this.height - quarterHeight;

        return [
            { x: left, y: top },
            { x: right, y: top },
            { x: left, y: bottom },
            { x: right, y: bottom }
        ];
    }

    public respawn() {
        this.alive = true;
        this.respawned = true;

        const safeSpawn = this.map.pickSpawnPoint();
        this.x = safeSpawn.left;
        this.y = safeSpawn.top;
    }

    public static spectator(map: Map) {
        return new Player(map, "Spectator", -10, -10, true);
    }

    public static spawnPlayerInSafeLocation(map: Map, name: string) {
        const startLocation = map.pickSpawnPoint();
        return new Player(map, name, startLocation.left, startLocation.top);
    }
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
