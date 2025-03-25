const MODULE_ID = "quickstart-shops";

const compendiumId = "quickstart-shops.qss-core";
const entryId = "CAnEd3B4HfUMFxRS";

console.log("QSS | Script loaded!");

Hooks.once("init", () => {
    console.log("QSS | Init hook called");

    // Register all settings synchronously
    console.log("QSS | Registering settings");
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
    let distinctId = game.settings.get(MODULE_ID, "qss-install-id");
    if (!distinctId) {
        distinctId = randomID();
        await game.settings.set(MODULE_ID, "qss-install-id", distinctId);
        console.log("QSS | Generated and saved new distinct ID:", distinctId);
    } else {
        console.log("QSS | Existing distinct ID found:", distinctId);
    }

    // Check if we've already reported
    const alreadyReported = game.settings.get(MODULE_ID, "qss-install-reported");
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
            await game.settings.set(MODULE_ID, "qss-install-reported", true);
            console.log("QSS | Install event successfully reported and flag saved.");
        } else {
            console.warn("QSS | Failed to report install. Status:", res.status);
        }
    } catch (err) {
        console.error("QSS | Error reporting install:", err);
    }

    // Check if we've shown the getting started before
    const alreadyShown = game.settings.get(MODULE_ID, "qss-getting-started-shown");
    if (alreadyShown) {
        console.log("QSS | Getting started already shown.");
    } else {
        console.log("QSS | Getting started NOT already shown.");

        // Load the compendium
        const pack = game.packs.get(compendiumId);
        if (!pack) return ui.notifications.error("Quickstart Shops: Compendium not found.");

        pack.getDocument(entryId).then(entry => {
            if (!entry) return ui.notifications.error("Quickstart Shops: Getting Started Guide not found.");

            // Unique HTML ID to target the link after it's in the chat
            const linkId = "qss-getting-started-link";

            // Send the styled message with a span that looks like a link
            ChatMessage.create({
                user: game.user.id,
                whisper: [game.user.id],
                content: `
        <p>Thanks for installing <strong>Quickstart Shops</strong>!</p>
        <p><span id="${linkId}" style="color: #5fa8d3; text-decoration: underline; cursor: pointer;">
        <i class="fas fa-book-open"></i> Open the Getting Started Journal</span></p>
        <p>This message will only show this one time, you can always go into the Quickstart Shops (Core) Compendium pack 
        to open the Getting Started Journal in the future.</p>`
            }).then(msg => {
                Hooks.once("renderChatMessage", (message, html) => {
                    if (message.id !== msg.id) return;
                    html.find(`#${linkId}`).on("click", () => {
                        entry.sheet.render(true);
                    });
                });
            });

        }).catch(err => {
            console.error("Quickstart Shops: Error loading journal entry", err);
            ui.notifications.error("Quickstart Shops: Failed to display the Getting Started Guide.");
        });

        await game.settings.set(MODULE_ID, "qss-getting-started-shown", true);
        console.log("QSS | Install event successfully reported and flag saved.");

    }
});

export {}; // Needed for ES module execution!
