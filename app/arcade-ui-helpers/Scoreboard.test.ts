import { Scoreboard } from "./Scoreboard";

describe("Scoreboard", () => {

    let sut: Scoreboard;

    beforeEach(() => {
        sut = new Scoreboard();
    });

    it("can initilise with a set of scores", () => {
        sut = new Scoreboard([
            { name: "a", score: 1 }, 
            { name: "b", score: 1 }
        ]);

        expect(sut.scores.length).toBe(2);
        expect(sut.scores[0].name).toBe("a");
        expect(sut.scores[1].name).toBe("b");
    })

    it("can initilise with a set of scores and a cap", () => {
        sut = new Scoreboard([
            { name: "a", score: 1 }, 
            { name: "b", score: 1 },
            { name: "c", score: 1 },
            { name: "d", score: 1 },
        ], 3);

        expect(sut.scores.length).toBe(3);
        expect(sut.scores[0].name).toBe("a");
        expect(sut.scores[1].name).toBe("b");
        expect(sut.scores[2].name).toBe("c");
    })

    it("addRange, adds supplied scores", () => {
        sut.addRange([
            { name: "a", score: 1 }, 
            { name: "b", score: 1 }
        ]);

        expect(sut.scores.length).toBe(2);
        expect(sut.scores[0].name).toBe("a");
        expect(sut.scores[1].name).toBe("b");
    });

    it("addRange, sorts supplied scores", () => {
        sut.addRange([
            { name: "a", score: 1 }, 
            { name: "b", score: 20 }
        ]);

        expect(sut.scores.length).toBe(2);
        expect(sut.scores[0].name).toBe("b")
        expect(sut.scores[1].name).toBe("a");
    });

    it("addRange, applies cap after new items added", () => {
        sut = new Scoreboard([
            { name: "a", score: 10 }, 
            { name: "b", score: 9 },
            { name: "c", score: 5 },
        ], 3);

        sut.addRange([
            { name: "d", score: 6 },
            { name: "e", score: 2 },
        ]);

        expect(sut.scores.length).toBe(3);
        expect(sut.scores[0].name).toBe("a")
        expect(sut.scores[1].name).toBe("b");
        expect(sut.scores[2].name).toBe("d");
    });
});