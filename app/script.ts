import { Game } from "./games/rps/Game";

console.log("Oh hai! 🖤");

const result = await fetch("/api/ably-token-request");
const data = await result.json();
console.log(data);

document.getElementById("response").innerText = JSON.stringify(data);

const canvas = document.getElementById("game") as HTMLCanvasElement;
const rpsInstance = new Game("my-game-id", canvas);

(async () => {
  await rpsInstance.preStart();
  rpsInstance.start();
  rpsInstance.tick();
})();

export {};
