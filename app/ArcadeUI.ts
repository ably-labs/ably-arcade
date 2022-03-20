import { GameRunner } from "./games/GameRunner";
import { ArcadeContestHandler } from "./arcade-ui-helpers/ArcadeContestHandler";

export class ArcadeUI {
  public arcadeInstanceId: string;
  public buttons: Element[];
  public playerName: string;
  private spectator: boolean;

  public gameRoot: HTMLElement;
  private arcade: HTMLElement;

  public spectateButton: HTMLElement;
  private spectatorControls: HTMLElement;

  private contestHandler: ArcadeContestHandler;

  constructor(arcadeInstanceId: string) {
    this.arcadeInstanceId = arcadeInstanceId;
    this.playerName = `Anonymous ${Math.floor(Math.random() * 100)}`;

    this.arcade = document.getElementById("arcade") as HTMLElement;
    this.buttons = [...document.querySelectorAll("[data-keycode]")] as Element[];
    this.gameRoot = document.getElementById("game-root") as HTMLElement;

    this.spectateButton = document.getElementById("spectate") as HTMLElement;
    this.spectatorControls = document.getElementById("spectatorControls") as HTMLElement;
    const spectatorStart = document.getElementById("spectatorControlsStartContest");

    spectatorStart.addEventListener("click", () => {
      this.startContest();
    });

    this.contestHandler = new ArcadeContestHandler(this.arcadeInstanceId, () => {
      this.onEndContest();
    });
  }

  public setPlayerName(name: string) {
    this.playerName = name;
  }

  public showGame(spectator: boolean = false) {
    this.spectator = spectator;
    this.showGameWorld();

    if (this.spectator) {
      this.spectatorControls.style.display = "block";
    }
  }

  public clearDisplay() {
    this.gameRoot.innerHTML = "";
    this.showGameWorld();
  }

  private showGameWorld() {
    this.arcade.style.display = "block";
    this.gameRoot.style.display = "block";
  }

  private startContest() {
    this.spectatorControls.style.display = "none";
    this.contestHandler.startContest();
  }

  private onEndContest() {
    if (this.spectator) {
      this.spectatorControls.style.display = "block";
    }
  }

  public bind(runner: GameRunner): void {
    this.contestHandler.runner = runner;

    this.buttons.forEach(button => {
      const keycode = button.getAttribute("data-keycode");
      const keyCodeNumber = parseInt(keycode);

      button.addEventListener("click", () => {
        runner.keyboard.simulateKeyPress(keyCodeNumber)
      });
    });

    const canvas = document.getElementById("game") as HTMLCanvasElement;

    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      runner.keyboard.touchLocation = touchEventsToCoords(e);
    });

    canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      runner.keyboard.touchLocation = { x: 0, y: 0 };
    });

    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      runner.keyboard.touchLocation = touchEventsToCoords(e);
    });
  }
}

function touchEventsToCoords(e) { 
  const rect = e.target as HTMLCanvasElement;
    const targetRect = rect.getBoundingClientRect();
    const x = e.touches[0].pageX - targetRect.left;
    const y = e.touches[0].pageY - targetRect.top;
    return { x: x, y: y };
}
