import { normalizeVersion } from "./version-utils.mjs";

export async function ensureInstallId(moduleId) {
    let id = game.settings.get(moduleId, "qss-install-id");
    if (!id) {
        id = randomID();
        await game.settings.set(moduleId, "qss-install-id", id);
        console.log("QSS | Generated new install ID:", id);
    } else {
        console.log("QSS | Using existing install ID:", id);
    }
    return id;
}

export async function shouldTrackInstall(moduleId, currentVersion) {
    const alreadyReported = game.settings.get(moduleId, "qss-install-reported");
    const previousVersion = game.settings.get(moduleId, "qss-last-version");

    const isFirstInstall = !alreadyReported;
    const isUpdate = !isFirstInstall &&
        normalizeVersion(currentVersion) > normalizeVersion(previousVersion);

    console.log("QSS | Install status:", {
        isFirstInstall,
        isUpdate,
        previousVersion,
        currentVersion
    });

    return { isFirstInstall, isUpdate };
}

export async function reportInstallOrUpdate(moduleId, distinctId, version, isFirstInstall, isUpdate) {
    const event = isFirstInstall
        ? "qss_world_install"
        : isUpdate
            ? "qss_module_update_complete"
            : null;

    if (!event) return;

    const payload = {
        api_key: "phc_IchtoxmtVnmYhyDXPYWspH9qLVbcdu059UUkzJE5t6l",
        event,
        distinct_id: distinctId,
        properties: {
            module: game.modules.get(moduleId)?.title ?? moduleId,
            moduleVersion: version,
            worldName: game.world.title,
            foundryVersion: game.version,
            system: game.system.id,
            systemVersion: game.system.version
        }
    };

    try {
        const res = await fetch("https://app.posthog.com/e", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            console.log(`QSS | PostHog event '${event}' sent successfully.`);
            if (isFirstInstall) {
                await game.settings.set(moduleId, "qss-install-reported", true);
            }
        } else {
            console.warn("QSS | Failed to report install/update. Status:", res.status);
        }
    } catch (err) {
        console.error("QSS | Error reporting to PostHog:", err);
    }
}
