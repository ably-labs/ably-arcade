import { Keyboard } from "./Keyboard";

export interface TickContext {
    tick: number;
    keyboardState: Keyboard;
    elapsed: number;
}

export interface Scoreboard {
    name: string;
    score: number;
}

export interface GameEndSummary {
    playerId: string;
    playerName: string;
    score: number;
    scores: Scoreboard[];
}

export interface IGame {
    tickRate: number;
    gameEnded: (summary: GameEndSummary) => void;

    preStart(playerName: string): Promise<void>;
    start();
    startContest();
    update(ctx: TickContext);
    render(ctx: TickContext);
}
