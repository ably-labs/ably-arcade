import { GameRunner } from "../games/GameRunner";
import { Realtime, Types } from 'ably';
import { Scoreboard } from "./Scoreboard";
import { AnnouncementUi } from "./AnnouncementUi";
import { ScoreboardUi } from "./ScoreboardUi";

type ControlMessage = "StartMessage";

export interface ArcadeControlMessage {
  type: ControlMessage;
}

export interface StartMessage extends ArcadeControlMessage {
  duration?: number;
  leadTime?: number;
  seed: number;
}

export class ArcadeContestHandler {
  public runner: GameRunner;

  private messages: AnnouncementUi;
  private scoreboard: ScoreboardUi;
  private globalScoreboard: ScoreboardUi;

  private connection: Types.RealtimePromise;
  private channel: Types.RealtimeChannelPromise;
  private scoreChannel: Types.RealtimeChannelPromise;

  private onContestEndFunc: () => void;

  constructor(arcadeInstanceId: string, onContestEnd: () => void) {
    this.onContestEndFunc = onContestEnd || (() => { });

    this.messages = new AnnouncementUi("player-messages");
    this.scoreboard = new ScoreboardUi("scoreboard", "scoreboard-row-template");
    this.globalScoreboard = new ScoreboardUi("global-scoreboard", "scoreboard-row-template");

    this.connection = new Realtime.Promise({ authUrl: "/api/ably-token-request" });
    this.channel = this.connection.channels.get("control-messages:" + arcadeInstanceId);
    this.scoreChannel = this.connection.channels.get("[?rewind=1]high-scores:" + arcadeInstanceId);

    this.channel.subscribe("control-message", (msg: Types.Message) => {
      this.onStartMessage(msg.data as StartMessage);
    });

    this.scoreChannel.subscribe("high-scores", (msg: Types.Message) => {
      this.globalScoreboard.render(msg.data);
    });

    this.getGlobalHistory();
  }

  public async startContest() {
    const randomNumber = Math.floor(Math.random() * 100);

    const messageBody: StartMessage = {
      type: "StartMessage",
      duration: 120_000,
      leadTime: 1000 * 3,
      seed: randomNumber
    };

    this.channel.publish("control-message", messageBody);
  }

  public async onStartMessage(msg: StartMessage) {
    await this.messages.displayAll(["Ready...", "3...", "2...", "1...", "Go!"], 1000);

    this.runner.game.startContest(msg.duration, msg.seed);

    const statusTick = this.scheduleContestUiUpdates(msg);

    setTimeout(async () => {
      clearInterval(statusTick);
      await this.onContestEnd();
    }, msg.duration);
  }

  private secToTime(seconds: number, separator: string) {
    const hh = seconds / 60 / 60;
    const mm = (seconds / 60) % 60;
    const ss = seconds % 60

    return [parseInt(hh.toString()), parseInt(mm.toString()), parseInt(ss.toString())]
      .join(separator ? separator : ":")
      .replace(/\b(\d)\b/g, "0$1")
      .replace(/^00\:/, "");
  }

  private scheduleContestUiUpdates(msg: StartMessage) {
    let gameTime = msg.duration;
    let timerUi = document.getElementById("timer") as HTMLElement;

    const statusTick = setInterval(() => {
      this.scoreboard.render(this.runner.game.scoreboard);

      gameTime -= 1000;
      timerUi.innerHTML = `${this.secToTime(Math.floor(gameTime / 1000), '')}`;
    }, 1000);

    return statusTick;
  }

  private async onContestEnd() {
    this.scoreboard.render(this.runner.game.scoreboard);

    if (this.runner.game.spectator) {
      this.updateGlobalLeaderboard();
    }

    this.onContestEndFunc();

    await this.messages.display("Game over!", 5000);
  }

  private async updateGlobalLeaderboard() {
    const history = await this.scoreChannel.history();
    const lastMessage = history.items[0]?.data;
    let previousGlobalScoreboard = lastMessage || [];

    const scoreboard = new Scoreboard(previousGlobalScoreboard);
    scoreboard.addRange(this.runner.game.scoreboard);

    this.scoreChannel.publish("high-scores", scoreboard.scores);

    // TODO: Bug here where leaderboard is overwritten right now
  }

  private async getGlobalHistory() {
    const history = await this.scoreChannel.history();
    const lastMessage = history.items[0]?.data;
    let previousGlobalScoreboard = lastMessage || [];

    const scoreboard = new Scoreboard(previousGlobalScoreboard);

    this.globalScoreboard.render(scoreboard.scores);
  }
}
