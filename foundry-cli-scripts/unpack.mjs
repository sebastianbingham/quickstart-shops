import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";

// Enable YAML output
const useYaml = true;
const moduleRoot = process.cwd();

// Read all compendium files from ./packs/
const packs = await fs.readdir(path.join(moduleRoot, "packs"));

for (const packFile of packs) {
    if (packFile === ".gitattributes") continue;

    const sourcePath = path.join(moduleRoot, "packs", packFile);
    const outputDir = path.join(moduleRoot, "src", "packs", packFile);

    console.log(`📦 Unpacking ${packFile}...`);

    // Clear output directory if it exists
    try {
        const files = await fs.readdir(outputDir);
        for (const file of files) {
            await fs.unlink(path.join(outputDir, file));
        }
    } catch (err) {
        if (err.code === "ENOENT") {
            await fs.mkdir(outputDir, { recursive: true });
            console.log(`📁 Created output directory: ${outputDir}`);
        } else {
            console.error(`❌ Error cleaning output dir for ${packFile}:`, err);
            continue;
        }
    }

    // Unpack the .db file into individual YAML files
    await extractPack(sourcePath, outputDir, {
        yaml: useYaml,
        transformName,
    });

    console.log(`✅ Finished unpacking ${packFile}`);
}

// Rename function for unpacked files
function transformName(doc) {
    const safeName = doc.name?.replace(/[^a-zA-Z0-9А-я]/g, "_") || doc._id;
    const typeKey = doc._key.split("!")[1];
    const prefix = ["actors", "items"].includes(typeKey) ? doc.type : typeKey;

    return `${prefix}_${safeName}_${doc._id}.${useYaml ? "yml" : "json"}`;
}
