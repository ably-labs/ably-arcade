export class Keyboard {    
    public static LEFT = 37;
    public static RIGHT = 39;
    public static UP = 38;
    public static DOWN = 40;

    private _keys = {};

    public listenForEvents (keys) {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    
        keys.forEach(function (key) {
            this._keys[key] = false;
        }.bind(this));
    }

    public simulateKeyPress(keyCode: number, duration: number = 250) {
        this._keys[keyCode] = true;
        setTimeout(() => {
            this._keys[keyCode] = false;
        }, duration);
    }
    
    private onKeyDown(event) {
        var keyCode = event.keyCode;
        if (keyCode in this._keys) {
            event.preventDefault();
            this._keys[keyCode] = true;
        }
    };
    
    private onKeyUp (event) {
        var keyCode = event.keyCode;
        if (keyCode in this._keys) {
            event.preventDefault();
            this._keys[keyCode] = false;
        }
    };
    
    public isPressed (keyCode) {
        /*if (!keyCode in this._keys) {
            throw new Error('Keycode ' + keyCode + ' is not being listened to');
        }*/

        return this._keys[keyCode];
    };
}

