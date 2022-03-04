export class Loader {
    public images: any;

    constructor() {
        this.images = {};
    }

    public async loadImage(key: string, src: string) {
        let img = new Image();
    
        let d = new Promise(function (resolve, reject) {
            img.onload = function () {
                this.images[key] = img;
                resolve(img);
            }.bind(this);
    
            img.onerror = function () {
                reject('Could not load image: ' + src);
            };
        }.bind(this));
    
        img.src = src;
        return d;
    }

    public getImage(key: string): HTMLImageElement {
        return (key in this.images) ? this.images[key] : null;
    }
}
