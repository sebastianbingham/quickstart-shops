export async function showWelcomeOrUpdateMessage(moduleId, isFirstInstall, isUpdate) {
    if (!isFirstInstall && !isUpdate) return;

    if (isFirstInstall) {
        console.log("QSS | Showing welcome message");
        const entry = await fromUuid("Compendium.quickstart-shops.qss-core.JournalEntry.qssGetStarted001");
        if (!entry) {
            ui.notifications.error("Quickstart Shops: Getting Started entry not found.");
            return;
        }

        const linkId = "qss-getting-started-link";
        ChatMessage.create({
            user: game.user.id,
            whisper: [game.user.id],
            content: `
                <p>Thanks for installing <strong>Quickstart Shops</strong>!</p>
                <p>
                  <span id="${linkId}" style="color: #1a0dab; cursor: pointer;">
                    <i class="fas fa-book-open"></i> Open the Getting Started Journal
                  </span>
                </p>
                <p>This message will only show this one time. You can always access it from the compendium later.</p>`
        }).then(msg => {
            Hooks.once("renderChatMessage", (message, html) => {
                if (message.id !== msg.id) return;
                html.find(`#${linkId}`).on("click", () => {
                    entry.sheet.render(true);
                });
            });
        });
    }

    if (isUpdate) {
        console.log("QSS | Showing update message");
        ChatMessage.create({
            user: game.user.id,
            whisper: [game.user.id],
            content: `
        <p><strong>Quickstart Shops</strong> has been updated!</p>
        <p>View the latest release notes: 
        <a href="https://github.com/sebastianbingham/quickstart-shops/releases/latest" target="_blank">
        GitHub Releases</a></p>`
        });
    }
}
