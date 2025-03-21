const MODULE_ID = "quickstart-shops"; // your module's ID

Hooks.once("init", async () => {
    if (!game.user?.isGM) return;

    // Register the install flag setting (does nothing visible to users)
    game.settings.register(MODULE_ID, "qss_install_reported", {
        scope: "world",      // saved in the world DB
        config: false,       // hidden from settings UI
        type: Boolean,
        default: false
    });

    // Check if we've already reported this install
    const alreadyReported = game.settings.get(MODULE_ID, "qss_install_reported");
    if (alreadyReported) return;

    const mod = game.modules.get(MODULE_ID);

    // Send install ping
    fetch("https://app.posthog.com/e", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            api_key: "phc_IchtoxmtVnmYhyDXPYWspH9qLVbcdu059UUkzJE5t6l", // your PostHog project key
            event: "qss_world_install",
            properties: {
                module: "Quickstart Shops",
                version: mod?.version ?? "unknown",
                world: game.world.id,
                worldName: game.world.title,
                foundryVersion: game.version,
                system: game.system.id,
                systemVersion: game.system.version
            }
        })
    }).catch(() => {
    });

    // Mark as reported
    await game.settings.set(MODULE_ID, "qss_install_reported", true);
});