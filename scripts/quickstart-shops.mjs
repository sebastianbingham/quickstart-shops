Hooks.once("init", () => {
    game.settings.register("quickstart-shops", "lastVersion", {
        scope: "world",
        config: false,
        type: String,
        default: "1.0.0"
    });
});

Hooks.once("ready", async () => {
    const currentVersion = game.modules.get("quickstart-shops").version;
    const lastVersion = game.settings.get("quickstart-shops", "lastVersion");

    if (foundry.utils.isNewerVersion(currentVersion, lastVersion)) {
        const pack = game.packs.get("quickstart-shops.quickstart-shops");
        await pack.getDocuments();
        const journal = await fromUuid("Compendium.quickstart-shops.quickstart-shops.JournalEntry.2R1U8zZG7ZRRL870");

        if (journal) {
            const page = journal.pages.at(-1);
            journal.sheet.render(true, { pageId: page?.id });
        } else {
            console.warn("QSS: Journal entry not found!");
        }

        game.settings.set("quickstart-shops", "lastVersion", currentVersion);
    }
});