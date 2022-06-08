import { Game } from "./games/rps/Game";
import { GameEndSummary } from "./games/IGame";
import { GameRunner } from "./games/GameRunner";
import { ArcadeUI } from "./ArcadeUI";
import { HubSpotUi } from "./HubSpotUi";

console.log("Oh hai! 🖤");

const requireSignup = true;

const arcadeInstanceId = "elixir-conf";
const arcadeUi = new ArcadeUI(arcadeInstanceId);
let runner: GameRunner = null;

arcadeUi.spectateButton.addEventListener("click", () => {
    HubSpotUi.hideForm();

    startGame(true);
    arcadeUi.showGame(true);
});

if (requireSignup) {
    HubSpotUi.createForm((form) => {
        HubSpotUi.hideForm();

        // (╯°□°）╯︵ ┻━┻
        const firstName = form.data.data[1].value;
        const lastName = form.data.data[2].value;

        arcadeUi.setPlayerName(`${firstName} ${lastName}`);

        startGame();
        arcadeUi.showGame();
    });
} else {
    HubSpotUi.hideForm();
    startGame();
    arcadeUi.showGame();
}

function startGame(spectator: boolean = false) {
    if (runner) {
        runner.stop();
    }

    const game = new Game(arcadeInstanceId, arcadeUi.gameRoot, spectator);
    runner = new GameRunner(game);
    runner.run(arcadeUi.playerName);
    arcadeUi.bind(runner);
}

export { };
