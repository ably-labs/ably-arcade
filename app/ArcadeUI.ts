import { GameRunner } from "./games/GameRunner";
import { GameEndSummary } from "./games/IGame";

export class ArcadeUI {
    private arcade: HTMLElement;
    public buttons: Element[];
    public gameRoot: HTMLElement;
    public spectateButton: HTMLElement;

    public playerName: string;
    public onSpectatorStart: () => void = () => {};

    constructor() {
      this.playerName = `Anonymous ${Math.floor(Math.random() * 100)}`;
      this.arcade = document.getElementById("arcade") as HTMLElement;
      this.buttons = [...document.querySelectorAll("[data-keycode]")];
      this.gameRoot = document.getElementById("game-root");

      this.spectateButton = document.getElementById("spectate");

      const spectatorStart = document.getElementById("start");
      spectatorStart.addEventListener("click", () => {
        this.onSpectatorStart();
      });

    }

    public setPlayerName(name: string) {
      this.playerName = name;
    }

    public show() {
      this.arcade.style.display = "block";
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
        scoreboardTable.tBodies[0].appendChild(tableRow);
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

      this.onSpectatorStart = () => {
        runner.game.startContest();
      };
    }
}
