import { Game } from "./games/rps/Game";
import { IGame } from "./games/IGame";
import { GameRunner } from "./games/GameRunner";
import { ArcadeUI } from "./ArcadeUI";

console.log("Oh hai! 🖤");

const arcadeUi = new ArcadeUI();
const game = new Game("my-game-id", arcadeUi.canvas);
const runner = new GameRunner(game);

arcadeUi.bind(runner);
runner.run();

export {};
