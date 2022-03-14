import { GameRunner } from "./GameRunner";
import { GameEndSummary, IGame, Scoreboard, TickContext } from "./IGame";
import { wait } from "./TestSupport";

describe("GameRunner", () => {

    let game: TestGame;
    let sut: GameRunner;
    let playerName: string;

    beforeEach(() => {
        playerName = "player1";
        game = new TestGame();
        sut = new GameRunner(game);
    });

    it("can create GameRunner", () => {
        expect(sut).toBeDefined();
    });

    it("state defaults to not-started", () => {
        expect(sut.state).toBe("not-started");
    });

    it("run, sets state to running", async () => {
        await sut.run(playerName);
        expect(sut.state).toBe("running");
    });

    it("run, calls preStart on game to cache assets etc", async () => {
        await sut.run(playerName);
        expect(game.preStartCalled).toBe(true);
    });

    it("run, calls game start", async () => {
        await sut.run(playerName);
        expect(game.startCalled).toBe(true);
    });

    it("run, ticks the game at the game specified tick rate", async () => {
        sut = new GameRunner(new TestGame(1));

        await sut.run(playerName);
        await wait(1_100);

        expect(sut.tick).toBe(1);
    });

    it("run, listens for keyboard keypresses and passes keyboard state in tick context", async () => {
        await sut.run(playerName);
        await wait(50);

        expect(sut.keyboard).toBeDefined();
        expect(game.lastTickContext.keyboardState).toBeDefined();
    });

    it("stop, stops the game, setting the state to completed", async () => {
        await sut.run(playerName);

        sut.stop();

        expect(sut.state).toBe("completed");
        expect(game.stopCalled).toBe(true);
    });

    it("run, on a stopped game, doesn't tick upwards", async () => {
        sut = new GameRunner(new TestGame(60));
        await sut.run(playerName);
        await wait(50);

        sut.stop();
        const stoppedTick = sut.tick;

        await wait(50);
        expect(sut.tick).toBe(stoppedTick);
    });

});

class TestGame implements IGame {

    public tickRate: number;
    public gameEnded: (summary: GameEndSummary) => void;
    public scoreboard: Scoreboard[];
    public spectator: boolean = false;

    public lastTickContext: TickContext;
    public preStartCalled: boolean;
    public startCalled: boolean;
    public stopCalled: boolean;

    constructor(tickRate: number = 60) {
        this.tickRate = tickRate;
    }

    public preStart(playerName: string): Promise<void> {
        this.preStartCalled = true;
        return Promise.resolve();
    }

    public start() {
        this.startCalled = true;
    }

    public startContest(duration: number, seed: number) {
    }

    public stop(forced: boolean) {
        this.stopCalled = true;
    }

    public update(ctx: TickContext) {
        this.lastTickContext = ctx;
    }

    public render(ctx: TickContext) {
        this.lastTickContext = ctx;
    }

}
