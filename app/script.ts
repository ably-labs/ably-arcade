import { Game } from "./games/rps/Game";
import { GameEndSummary } from "./games/IGame";
import { GameRunner } from "./games/GameRunner";
import { ArcadeUI } from "./ArcadeUI";
import { HubSpotUi } from "./HubSpotUi";

console.log("Oh hai! 🖤");

const requireSignup = true;
const arcadeUi = new ArcadeUI();

arcadeUi.spectateButton.addEventListener("click", () => {  
    HubSpotUi.hideForm();
    arcadeUi.show();
    startGame(true);
});

if (requireSignup) {
    HubSpotUi.createForm((form) => {        
        HubSpotUi.hideForm();
                
        // (╯°□°）╯︵ ┻━┻
        const firstName = form.data.data[1].value;
        const lastName = form.data.data[2].value;

        arcadeUi.setPlayerName(`${firstName} ${lastName}`);
        arcadeUi.show();
        startGame();
    });
} else {
    arcadeUi.show();
    startGame();
}

function startGame(spectator: boolean = false) {
    const game = new Game("my-game-id!", arcadeUi.gameRoot, spectator);
    const runner = new GameRunner(game);
    
    arcadeUi.bind(runner);

    runner.run(arcadeUi.playerName, (summary: GameEndSummary) => {
        arcadeUi.clearDisplay();
        arcadeUi.showScoreboard(summary);
    });
}

export {};
