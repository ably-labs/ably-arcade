
import { IAssetSource } from "../IAssetSource";

export class DiskAssetSource implements IAssetSource {
    getAssets() {
        const map = new Map<string, string>();
        map.set("tiles", "./games/rps/assets/tiles.png");
        map.set("player", "./games/rps/assets/character.png");
        return map;
    }
}
