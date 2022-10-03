import { Game } from "./games/rps/Game";
import { GameEndSummary } from "./games/IGame";
import { GameRunner } from "./games/GameRunner";
import { ArcadeUI } from "./ArcadeUI";
import { HubSpotUi } from "./HubSpotUi";

console.log("Oh hai! 🖤");

const requireSignup = true;

const arcadeInstanceId = "non-conf";
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
        const username = form.data.data[0].value;

        arcadeUi.setPlayerName(`${username}`);

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
