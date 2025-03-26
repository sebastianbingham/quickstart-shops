export async function showWelcomeOrUpdateMessage(moduleId, isFirstInstall, isUpdate) {
    if (!isFirstInstall && !isUpdate) return;

    if (isFirstInstall) {
        console.log("QSS | Showing welcome message");
        const entry = await fromUuid("Compendium.quickstart-shops.qss-core.JournalEntry.qssGetStarted001");
        if (!entry) {
            ui.notifications.error("Quickstart Shops: Getting Started entry not found.");
            return;
        }

        const uuidLink = `@UUID[Compendium.quickstart-shops.qss-core.JournalEntry.qssGetStarted001]{Open the Getting Started Journal}`;
        const enriched = await TextEditor.enrichHTML(uuidLink, { async: true });

        ChatMessage.create({
            speaker: {
                alias: "Quickstart Shops"
            },
            whisper: [game.user.id],
            content: `
    <p>Thanks for installing <strong>Quickstart Shops</strong>!</p>
    <p>${enriched}</p>
    <p>This message will only show this one time. You can always access it from the compendium later.</p>
  `
        });
    }

    if (isUpdate) {
        console.log("QSS | Showing update message");
        ChatMessage.create({
            speaker: {
                alias: "Quickstart Shops"
            },
            whisper: [game.user.id],
            content: `
        <p><strong>Quickstart Shops</strong> has been updated!</p>
        <p>View the latest release notes: 
        <a href="https://github.com/sebastianbingham/quickstart-shops/releases/latest" target="_blank">
        GitHub Releases</a></p>`
        });
    }
}
