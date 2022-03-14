import { Map as GameMap } from './Map';

describe("Map", () => {

    let map: GameMap;
    beforeEach(() => {
        map = new GameMap([
            "######",
            "#    #",
            "#    #",
            "#    #",
            "#    #",
            "######"
        ]);
    });


    it("constructor can set variables based on provided map", () => {
        expect(map.cols).toBe(6);
        expect(map.rows).toBe(6);
        expect(map.tiles.length).toBe(36);
    });

    it("getTile, returns tile metadata", () => {
        const tile = map.getTile(0, 0);

        expect(tile).toEqual({
            col: 0,
            row: 0,
            top: 0,
            left: 0,
            right: 64,
            bottom: 64,
            type: 3
        });
    });

    it("getTile, returns tile metadata with correctly calculated offsets", () => {
        const tile = map.getTile(1, 1);

        expect(tile).toEqual({
            col: 1,
            row: 1,
            top: 64,
            left: 64,
            right: 128,
            bottom: 128,
            type: 1
        });
    });

    it("canTraverse returns false for solid tile", () => {
        const result = map.canTraverse(0, 0);
        expect(result).toBe(false);
    });

    it("canTraverse returns true for traversable tile", () => {
        const result = map.canTraverse(1, 1);
        expect(result).toBe(true);
    });

    it("should be able to pick a spawn point", () => {
        const map = new GameMap([
            "######",
            "# ####",
            "######"
        ]);

        const spawnPoint = map.pickSpawnPoint();

        expect(spawnPoint).toEqual({
            col: 1,
            row: 1,
            top: 64,
            left: 64,
            right: 128,
            bottom: 128,
            type: 1
        });
    });

    it("will throw an error when no spawn points are available", () => {
        const map = new GameMap([
            "######",
            "######",
            "######"
        ]);

        expect(() => map.pickSpawnPoint()).toThrow();
    });
});