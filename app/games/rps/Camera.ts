export class Camera {
    public x: number;
    public y: number;
    
    public width: any;
    public height: any;
    
    private maxX: number;
    private maxY: number;

    private following: any;

    constructor(map, width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.maxX = map.cols * map.tileSize - width;
        this.maxY = map.rows * map.tileSize - height;
    }
    
    public follow(sprite) {
        this.following = sprite;
    }
    
    public update() {
        const followX = this.following?.x || 0;
        const followY = this.following?.y || 0;

        // make the camera follow the sprite
        this.x = this.x + ((followX - this.width / 2) - this.x) / 10;
        this.y = this.y + ((followY - this.height / 2) - this.y) / 10;
    
        // clamp values
        this.x = Math.max(0, Math.min(this.x, this.maxX));
        this.y = Math.max(0, Math.min(this.y, this.maxY));
    }
}
