import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";

const inputDir = "./src/packs"; // Update if needed

function sanitizeOwnership(ownership = {}) {
    const sanitized = {};

    // Only retain 'default' if it exists and is a number
    if (typeof ownership.default === "number") {
        sanitized.default = ownership.default;
    }

    // Add default: 0 if not present
    if (!("default" in sanitized)) {
        sanitized.default = 0;
    }

    return sanitized;
}

function cleanStats(stats = {}) {
    const cleaned = { ...stats };
    delete cleaned.lastModifiedBy;
    delete cleaned.createdTime;
    delete cleaned.modifiedTime;
    return cleaned;
}

async function processYamlFile(filePath) {
    const content = await fs.readFile(filePath, "utf8");
    const data = yaml.load(content);
    let modified = false;

    // Clean top-level ownership
    if (data.ownership) {
        const cleanedOwnership = sanitizeOwnership(data.ownership);
        if (JSON.stringify(data.ownership) !== JSON.stringify(cleanedOwnership)) {
            data.ownership = cleanedOwnership;
            modified = true;
        }
    }

    // Clean top-level _stats
    if (data._stats) {
        const cleanedStats = cleanStats(data._stats);
        if (JSON.stringify(data._stats) !== JSON.stringify(cleanedStats)) {
            data._stats = cleanedStats;
            modified = true;
        }
    }

    // Clean pages
    if (Array.isArray(data.pages)) {
        for (const page of data.pages) {
            // Clean page ownership
            if (page.ownership) {
                const cleanedPageOwnership = sanitizeOwnership(page.ownership);
                if (JSON.stringify(page.ownership) !== JSON.stringify(cleanedPageOwnership)) {
                    page.ownership = cleanedPageOwnership;
                    modified = true;
                }
            }

            // Clean page _stats
            if (page._stats) {
                const cleanedPageStats = cleanStats(page._stats);
                if (JSON.stringify(page._stats) !== JSON.stringify(cleanedPageStats)) {
                    page._stats = cleanedPageStats;
                    modified = true;
                }
            }
        }
    }

    if (modified) {
        const newYaml = yaml.dump(data, { lineWidth: -1 });
        await fs.writeFile(filePath, newYaml, "utf8");
        console.log(`✅ Sanitized: ${filePath}`);
    }
}

async function walkDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await walkDir(fullPath);
        } else if (entry.name.endsWith(".yml") || entry.name.endsWith(".yaml")) {
            await processYamlFile(fullPath);
        }
    }
}

await walkDir(inputDir);
console.log("🎉 YAML sanitation complete.");
