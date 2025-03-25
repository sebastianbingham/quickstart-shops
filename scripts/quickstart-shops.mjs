const MODULE_ID = "quickstart-shops";

import {ensureInstallId, shouldTrackInstall, reportInstallOrUpdate} from "./helpers/install-tracking.mjs";
import {showWelcomeOrUpdateMessage} from "./helpers/welcome-message.mjs";

console.log("QSS | Script loaded!");

Hooks.once("init", () => {
    console.log("QSS | Init hook called");

    game.settings.register(MODULE_ID, "qss-install-id", {
        scope: "world",
        config: false,
        type: String,
        default: ""
    });

    game.settings.register(MODULE_ID, "qss-install-reported", {
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register(MODULE_ID, "qss-getting-started-shown", {
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register(MODULE_ID, "qss-last-version", {
        scope: "world",
        config: false,
        type: String,
        default: ""
    });
});

Hooks.once("ready", async () => {
    console.log("QSS | Ready hook called");

    if (!game.user?.isGM) {
        console.log("QSS | GM Check: false");
        return;
    }
    console.log("QSS | GM Check: true");

    const mod = game.modules.get(MODULE_ID);
    const currentVersion = mod?.version ?? "unknown";

    const distinctId = await ensureInstallId(MODULE_ID);
    const {isFirstInstall, isUpdate} = await shouldTrackInstall(MODULE_ID, currentVersion);

    await reportInstallOrUpdate(MODULE_ID, distinctId, currentVersion, isFirstInstall, isUpdate);
    await showWelcomeOrUpdateMessage(MODULE_ID, isFirstInstall, isUpdate);

    await game.settings.set(MODULE_ID, "qss-last-version", currentVersion);
});
