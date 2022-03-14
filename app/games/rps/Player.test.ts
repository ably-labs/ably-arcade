import { Player } from './Player';
import { Map as GameMap } from './Map';

describe("Player", () => {

    let sut: Player;
    beforeEach(() => {
        const map = new GameMap([
            "####",
            "#  #",
            "#  #",
            "####"
        ]);

        sut = new Player(map, "player-name", 64, 64, false);
    });

    it("constructor can create player", () => {
        expect(sut).toBeDefined();
    });

    it("move can move player to valid square", () => {
        sut.move({ x: 1, y: 0 }, sut.map);
        expect(sut.moved).toBe(true);
    });

    it("move won't allow dead player movement", () => {
        sut.alive = false;
        sut.move({ x: 1, y: 0 }, sut.map);
        expect(sut.moved).toBe(false);
    });

    it("move won't allow player movement to same location (zero-move delta)", () => {
        sut.move({ x: 0, y: 0 }, sut.map);
        expect(sut.moved).toBe(false);
    });

    it("move won't allow player movement to invalid location (horizontal)", () => {
        sut.move({ x: -1, y: 0 }, sut.map);
        expect(sut.moved).toBe(false);
    });

    it("move won't allow player movement to invalid location (vertical)", () => {
        sut.move({ x: 0, y: -1 }, sut.map);
        expect(sut.moved).toBe(false);
    });

    it("respawn moves player to a safe spot", () => {
        sut.x = -100;
        sut.y = -100;

        sut.respawn();

        expect(sut.alive).toBe(true);
        expect(sut.respawned).toBe(true);
        expect(sut.x).not.toBe(-100);
        expect(sut.y).not.toBe(-100);
    });
});