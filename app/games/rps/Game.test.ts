import { Keyboard } from "../Keyboard";
import { Game } from "./Game";
import { wait } from "../TestSupport";

describe("Game", () => {

    let sut: Game;
    let rootElement: HTMLElement;
    let mockRenderer: any;
    let mockAbly: any;

    beforeEach(() => {
        mockRenderer = {
            initCalled: false,
            init: async function () { this.initCalled = true; },
            render: async function () { },
        } as any;

        mockAbly = {
            connectCalled: false,
            stateUpdate: {},
            updateStateCalled: false,
            connect: async function () { this.connectCalled = true; },
            updateState: async function (x: any) {
                this.updateStateCalled = true;
                this.stateUpdate = x;
            },
            playerMetadata: async function () { return []; },
        } as any;

        rootElement = document.createElement('div');
        sut = new Game("ably-channel-id", rootElement, false);
        sut["renderer"] = mockRenderer;
        sut["ablyHandler"] = mockAbly;
    });

    it("constructor can create map and renderer", () => {
        expect(sut).toBeDefined();
        expect(sut["map"]).toBeDefined();
    });

    it("preStart sets up playername and initilises renderer", async () => {
        await sut.preStart("player-name");

        expect(mockRenderer.initCalled).toBe(true);
        expect(sut.playerName).toBe("player-name");
    });

    it("preStart defaults playername to 'Unknown'", async () => {
        await sut.preStart();
        expect(sut.playerName).toBe("Unknown");
    });

    it("start, connects to ably channel", () => {
        sut.start();
        expect(mockAbly.connectCalled).toBe(true);
    });

    it("start, can correctly initilise spectators", () => {
        sut = new Game("ably-channel-id", rootElement, true);
        sut["renderer"] = mockRenderer;
        sut["ablyHandler"] = mockAbly;

        sut.start();

        expect(sut.myPlayer.spectator).toBe(true);
        expect(sut.myPlayer.name).toBe("Spectator");
    });

    it("update, processes keyboard state to trigger movement", async () => {
        const keyboard = new Keyboard();
        keyboard.simulateKeyPress(Keyboard.LEFT, 0);
        sut.start();
        await wait(10);

        await sut.update({
            tick: 1,
            elapsed: 100,
            keyboardState: keyboard
        });

        expect(mockAbly.updateStateCalled).toBe(true);
    });

    it("update, changes colour after timeout", async () => {
        sut.colorChangeInterval = 5;
        sut.start();
        sut.myPlayer.color = -1;

        await wait(20);

        await sut.update({
            tick: 1,
            elapsed: 100,
            keyboardState: new Keyboard()
        });

        expect(sut.myPlayer.color).not.toBe(-1);
    });
});
