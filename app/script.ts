import { Game } from "./games/rps/Game";

console.log("Oh hai! 🖤");

const canvas = document.getElementById("game") as HTMLCanvasElement;
const rpsInstance = new Game("my-game-id", canvas);

(async () => {
  await rpsInstance.preStart();
  rpsInstance.start();
  rpsInstance.tick();
})();

export {};
