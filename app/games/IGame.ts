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
    scores: Scoreboard[];
}

export interface IGame {
    tickRate: number;
    gameEnded: (summary: GameEndSummary) => void;
    scoreboard: Scoreboard[];    
    spectator: boolean;

    preStart(playerName: string): Promise<void>;
    start();
    startContest(duration: number, seed: number);
    stop(forced: boolean);
    update(ctx: TickContext);
    render(ctx: TickContext);
}
