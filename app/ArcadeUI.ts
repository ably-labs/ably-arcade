import { GameRunner } from "./games/GameRunner";
import { GameEndSummary, Scoreboard } from "./games/IGame";
import { Realtime, Types } from 'ably';

type ControlMessage = "StartMessage";

export interface ArcadeControlMessage {
  type: ControlMessage;
}

export interface StartMessage extends ArcadeControlMessage {
  duration?: number;
  leadTime?: number;
  seed: number;
}

export class ArcadeUI {
  private arcade: HTMLElement;
  public buttons: Element[];
  public playerName: string;

  public gameRoot: HTMLElement;
  private scoreboard: HTMLTableElement;
  private globalScoreboard: HTMLTableElement;
  private rowTemplate: HTMLTemplateElement;
  private messages: HTMLElement;

  public spectateButton: HTMLElement;
  private spectatorControls: HTMLElement;

  private connection: Types.RealtimePromise;
  private channel: Types.RealtimeChannelPromise;
  private scoreChannel: Types.RealtimeChannelPromise;

  private runner: GameRunner;
  private spectator: boolean;

  constructor(arcadeInstanceId: string) {
    this.playerName = `Anonymous ${Math.floor(Math.random() * 100)}`;

    this.arcade = document.getElementById("arcade") as HTMLElement;
    this.buttons = [...document.querySelectorAll("[data-keycode]")] as Element[];
    this.gameRoot = document.getElementById("game-root") as HTMLElement;

    this.scoreboard = document.getElementById("scoreboard") as HTMLTableElement;
    this.globalScoreboard = document.getElementById("global-scoreboard") as HTMLTableElement;
    this.rowTemplate = document.getElementById("scoreboard-row-template") as HTMLTemplateElement;    
    
    this.messages = document.getElementById("player-messages") as HTMLElement;
    this.spectateButton = document.getElementById("spectate") as HTMLElement;
    this.spectatorControls = document.getElementById("spectatorControls") as HTMLElement;
    const spectatorStart = document.getElementById("spectatorControlsStartContest");

    this.connection = new Realtime.Promise({ authUrl: '/api/ably-token-request' });
    this.channel = this.connection.channels.get('control-messages:' + arcadeInstanceId);
    this.scoreChannel = this.connection.channels.get('[?rewind=1]high-scores:' + arcadeInstanceId);

    spectatorStart.addEventListener("click", () => {
      this.startContest();
    });

    this.channel.subscribe("control-message", (msg: Types.Message) => {
      this.onControlMessage(msg.data);
    });

    this.scoreChannel.subscribe("high-scores", (msg: Types.Message) => { 
      this.showGlobalLeaderboard(msg.data); 
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

  private showStartGameButton() {
    this.spectatorControls.style.display = "block";
  }

  private startContest() {
    this.spectatorControls.style.display = "none";

    const randomNumber = Math.floor(Math.random() * 100);

    const messageBody: StartMessage = {
      type: "StartMessage",
      duration: 30_000,
      leadTime: 1000 * 3,
      seed: randomNumber
    };

    this.channel.publish("control-message", messageBody);
  }

  private async onControlMessage(msg: ArcadeControlMessage) {
    if (msg.type === "StartMessage") {
      this.showGameWorld();

      await this.displayMessage("Game about to start!", 1000);
      await this.displayMessage("3...", 1000);
      await this.displayMessage("2...", 1000);
      await this.displayMessage("1...", 1000);
      await this.displayMessage("Go!", 500);

      const startMessage = msg as StartMessage;
      this.runner.game.startContest(startMessage.duration, startMessage.seed);

      let gameTime = startMessage.duration;
      let timerUi = document.getElementById("timer") as HTMLElement;

      const statusTick = setInterval(() => {
        this.showScoreboard({ scores: this.runner.game.scoreboard });

        gameTime -= 1000;
        timerUi.innerHTML = `${Math.floor(gameTime / 1000)}`;

      }, 1000);

      setTimeout(async () => {
        clearInterval(statusTick);
        this.showScoreboard({ scores: this.runner.game.scoreboard });

        if (this.runner.game.spectator) {
          this.updateGlobalLeaderboard();
          this.showStartGameButton();
        }

        await this.displayMessage("Game over!", 5000);

      }, startMessage.duration);
    }
  }

  private async displayMessage(message: string, duration: number) {
    this.messages.innerHTML = message;
    await wait(duration);
    this.messages.innerHTML = "";
  }

  private async updateGlobalLeaderboard() {
    const history = await this.scoreChannel.history();
    const lastMessage = history.items[0]?.data;

    let lastScoreboard: GameEndSummary = lastMessage || { scores: [] };
    lastScoreboard.scores.push(...this.runner.game.scoreboard);
    lastScoreboard.scores.sort((a, b) => b.score - a.score);
    lastScoreboard.scores = lastScoreboard.scores.slice(0, 10);

    this.scoreChannel.publish("high-scores", lastScoreboard);
  }

  public showGlobalLeaderboard(summary: GameEndSummary) {
    this.tabulateScores(this.globalScoreboard, summary);
  }

  public showScoreboard(summary: GameEndSummary) {
    this.tabulateScores(this.scoreboard, summary);
  }

  private tabulateScores(scoreboardTable: HTMLTableElement, summary: GameEndSummary) {
    scoreboardTable.tBodies[0].innerHTML = "";
    
    for (const { name, score } of summary.scores) {
      const tableRow = this.rowTemplate.content.cloneNode(true) as HTMLElement;
      tableRow.querySelector("[data-name]").innerHTML = name;
      tableRow.querySelector("[data-score]").innerHTML = score.toString();
      scoreboardTable.tBodies[0].appendChild(tableRow);
    }
    return scoreboardTable;
  }

  public bind(runner: GameRunner): void {
    this.runner = runner;

    this.buttons.forEach(button => {
      const keycode = button.getAttribute("data-keycode");
      const keyCodeNumber = parseInt(keycode);

      button.addEventListener("click", () => {
        runner.keyboard.simulateKeyPress(keyCodeNumber)
      });
    });
  }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
