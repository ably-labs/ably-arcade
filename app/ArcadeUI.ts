import { GameRunner } from "./games/GameRunner";
import { ArcadeContestHandler } from "./arcade-ui-helpers/ArcadeContestHandler";

export class ArcadeUI {
  public arcadeInstanceId: string;
  public playerName: string;
  private spectator: boolean;

  public gameRoot: HTMLElement;
  private body: HTMLElement;
  private arcade: HTMLElement;

  public spectateButton: HTMLElement;
  private spectatorControls: HTMLElement;

  private contestHandler: ArcadeContestHandler;
  private eventListenerController: AbortController;

  constructor(arcadeInstanceId: string) {
    this.arcadeInstanceId = arcadeInstanceId;
    this.playerName = `Anonymous ${Math.floor(Math.random() * 100)}`;

    this.arcade = document.getElementById("arcade") as HTMLElement;
    this.body = document.getElementById("body") as HTMLElement;
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

    this.eventListenerController = new AbortController();
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
    this.body.classList.add("started");
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

    if (this.eventListenerController) {
      this.eventListenerController.abort();
      this.eventListenerController = new AbortController();
    }

    const cancellationToken = { signal: this.eventListenerController.signal };

    let captureMouse = false;

    this.gameRoot.addEventListener("mousedown", (e) => {
      captureMouse = true;
    }, cancellationToken);

    this.gameRoot.addEventListener("mousemove", (e) => {
      if (captureMouse) {
        runner.keyboard.touchLocation = clickEventsToCoords(e);
      }
    }, cancellationToken);

    this.gameRoot.addEventListener("mouseup", (e) => {
      captureMouse = false;
      runner.keyboard.removeTouch();
    }, cancellationToken);

    this.gameRoot.addEventListener("touchstart", (e) => {
      e.preventDefault();
      runner.keyboard.touchLocation = touchEventsToCoords(e);
    }, cancellationToken);

    this.gameRoot.addEventListener("touchend", (e) => {
      e.preventDefault();
      runner.keyboard.removeTouch();
    }, cancellationToken);

    this.gameRoot.addEventListener("touchmove", (e) => {
      e.preventDefault();
      runner.keyboard.touchLocation = touchEventsToCoords(e);
    }, cancellationToken);  
  }
}

function clickEventsToCoords(e) {
  const rect = e.target as HTMLCanvasElement;
  const targetRect = rect.getBoundingClientRect();
  const x = e.clientX - targetRect.left;
  const y = e.clientY - targetRect.top;
  return { x: x, y: y };
}

function touchEventsToCoords(e) {
  const rect = e.target as HTMLCanvasElement;
  const targetRect = rect.getBoundingClientRect();
  const x = e.touches[0].pageX - targetRect.left;
  const y = e.touches[0].pageY - targetRect.top;
  return { x: x, y: y };
}
