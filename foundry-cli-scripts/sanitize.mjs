import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";

const inputDir = "./src/packs"; // Update if needed

function sanitizeOwnership(ownership = {}) {
    const sanitized = {};

    if (typeof ownership.default === "number") {
        sanitized.default = ownership.default;
    }

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

function checkIdLengths(data, filePath) {
    const issues = [];

    // Check root _id
    if (typeof data._id === "string" && data._id.length !== 16) {
        issues.push(`⚠️ Root _id is ${data._id.length} chars: "${data._id}"`);
    }

    // Check page _id(s)
    if (Array.isArray(data.pages)) {
        for (const page of data.pages) {
            if (typeof page._id === "string" && page._id.length !== 16) {
                issues.push(`⚠️ Page _id is ${page._id.length} chars: "${page._id}"`);
            }
        }
    }

    if (issues.length > 0) {
        console.warn(`🚨 ID Length Issues in ${filePath}:\n${issues.join("\n")}`);
    }
}

async function processYamlFile(filePath) {
    const content = await fs.readFile(filePath, "utf8");
    const data = yaml.load(content);
    let modified = false;

    // ID length check
    checkIdLengths(data, filePath);

    // Sanitize ownership
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

    // Pages
    if (Array.isArray(data.pages)) {
        for (const page of data.pages) {
            if (page.ownership) {
                const cleaned = sanitizeOwnership(page.ownership);
                if (JSON.stringify(page.ownership) !== JSON.stringify(cleaned)) {
                    page.ownership = cleaned;
                    modified = true;
                }
            }

            if (page._stats) {
                const cleanedStats = cleanStats(page._stats);
                if (JSON.stringify(page._stats) !== JSON.stringify(cleanedStats)) {
                    page._stats = cleanedStats;
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
