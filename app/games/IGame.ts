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

    preStart(): Promise<void>;
    start();
    update(ctx: TickContext);
    render(ctx: TickContext);
}
