import { GameRunner } from "./games/GameRunner";

export class ArcadeUI {
    public canvas: HTMLCanvasElement;
    public buttons: Element[];

    constructor() {
        this.buttons = [...document.querySelectorAll("[data-keycode]")];
        this.canvas = document.getElementById("game") as HTMLCanvasElement;
    }

    public bind(runner: GameRunner): void {
        this.buttons.forEach(button => {
          const keycode = button.getAttribute("data-keycode");
          const keyCodeNumber = parseInt(keycode);
         
          button.addEventListener("click", () => {
            runner.keyboard.simulateKeyPress(keyCodeNumber) 
          });    
        });
    }
}
