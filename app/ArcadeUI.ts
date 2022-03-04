import { GameRunner } from "./games/GameRunner";
import { GameEndSummary } from "./games/IGame";

export class ArcadeUI {
    public buttons: Element[];
    public gameRoot: HTMLElement;

    constructor() {
      this.buttons = [...document.querySelectorAll("[data-keycode]")];
      this.gameRoot = document.getElementById("game-root");
    }

    public clearDisplay() {
      this.gameRoot.innerHTML = "";
    }

    public showScoreboard(summary: GameEndSummary) {
      const tableTemplate = document.getElementById("scoreboard-template") as HTMLTemplateElement;
      const rowTemplate = document.getElementById("scoreboard-row-template") as HTMLTemplateElement;
      
      const scoreboard = tableTemplate.content.cloneNode(true) as HTMLElement;
      const scoreboardTable = scoreboard.querySelector("table") as HTMLTableElement;
      
      for(const { name, score } of summary.scores) {      
        const tableRow = rowTemplate.content.cloneNode(true) as HTMLElement;
        tableRow.querySelector("[data-name]").innerHTML = name;
        tableRow.querySelector("[data-score]").innerHTML = score.toString(); 
        scoreboardTable.appendChild(tableRow);
      }

      this.gameRoot.appendChild(scoreboard);
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
