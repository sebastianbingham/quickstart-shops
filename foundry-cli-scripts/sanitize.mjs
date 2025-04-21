import fs from "fs/promises";
import path from "path";

const inputDir = "./src/packs";

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
    if (typeof data._id === "string" && data._id.length !== 16) {
        issues.push(`⚠️ Root _id is ${data._id.length} chars: "${data._id}"`);
    }
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

async function processJsonFile(filePath) {
    const content = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(content);
    let modified = false;

    checkIdLengths(data, filePath);

    if (data.ownership) {
        const cleaned = sanitizeOwnership(data.ownership);
        if (JSON.stringify(data.ownership) !== JSON.stringify(cleaned)) {
            data.ownership = cleaned;
            modified = true;
        }
    }

    if (data._stats) {
        const cleaned = cleanStats(data._stats);
        if (JSON.stringify(data._stats) !== JSON.stringify(cleaned)) {
            data._stats = cleaned;
            modified = true;
        }
    }

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
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
        console.log(`✅ Sanitized: ${filePath}`);
    }
}

async function walkDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await walkDir(fullPath);
        } else if (entry.name.endsWith(".json")) {
            await processJsonFile(fullPath);
        }
    }
}

await walkDir(inputDir);
console.log("🎉 JSON sanitation complete.");
