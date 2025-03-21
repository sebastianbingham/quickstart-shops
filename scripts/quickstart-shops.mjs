const MODULE_ID = "quickstart-shops";

console.log("QSS | Script loaded!");

Hooks.once("init", () => {
    console.log("QSS | Init hook called");

    // Register all settings synchronously
    console.log("QSS | Registering settings");
    game.settings.register(MODULE_ID, "install-id", {
        scope: "world",
        config: false,
        type: String,
        default: ""
    });

    game.settings.register(MODULE_ID, "install-reported", {
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });
});

Hooks.once("ready", async () => {
    console.log("QSS | Ready hook called");

    if (!game.user?.isGM) {
        console.log("QSS | GM Check: false");
        return;
    } else {
        console.log("QSS | GM Check: true");
    }

    // Get or generate the distinct install ID
    let distinctId = game.settings.get(MODULE_ID, "install-id");
    if (!distinctId) {
        distinctId = randomID();
        await game.settings.set(MODULE_ID, "install-id", distinctId);
        console.log("QSS | Generated and saved new distinct ID:", distinctId);
    } else {
        console.log("QSS | Existing distinct ID found:", distinctId);
    }

    // Check if we've already reported
    const alreadyReported = game.settings.get(MODULE_ID, "install-reported");
    if (alreadyReported) {
        console.log("QSS | Install already reported for this world.");
        return;
    } else {
        console.log("QSS | Install has not been reported yet. Sending event...");
    }

    // Send the install ping
    const mod = game.modules.get(MODULE_ID);
    const payload = {
        api_key: "phc_IchtoxmtVnmYhyDXPYWspH9qLVbcdu059UUkzJE5t6l",
        event: "qss_world_install",
        distinct_id: distinctId,
        properties: {
            module: mod?.title ?? "Quick Start Shops",
            moduleVersion: mod?.version ?? "unknown",
            worldName: game.world.title,
            foundryVersion: game.version,
            system: game.system.id,
            systemVersion: game.system.version
        }
    };

    try {
        const res = await fetch("https://app.posthog.com/e", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            await game.settings.set(MODULE_ID, "install-reported", true);
            console.log("QSS | Install event successfully reported and flag saved.");
        } else {
            console.warn("QSS | Failed to report install. Status:", res.status);
        }
    } catch (err) {
        console.error("QSS | Error reporting install:", err);
    }
});

export {}; // Needed for ES module execution!
