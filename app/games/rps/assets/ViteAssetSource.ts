// @ts-nocheck

import { IAssetSource } from "../IAssetSource";
import tilesPng from "./tiles.png";
import characterPng from "./character.png";

// The above imports only work when executing via Vite.js's pre-processing.
// A DiskAssetSource is provided for tests.

export class ViteAssetSource implements IAssetSource {
    getAssets() {
        const map = new Map<string, string>();
        map.set("tiles", tilesPng);
        map.set("player", characterPng);
        return map;
    }
}
