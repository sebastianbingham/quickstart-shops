import {compilePack} from "@foundryvtt/foundryvtt-cli";
import {promises as fs} from "fs";
import path from "path";

const MODULE_ID = process.cwd();

const packs = await fs.readdir("./src/packs");

for (const pack of packs) {
    if (pack.startsWith(".")) continue; // Skip hidden folders
    console.log(`📦 Packing ${pack}...`);

    const inputDir = path.join(MODULE_ID, "src", "packs", pack);
    const outputFile = path.join(MODULE_ID, "packs", `${pack}`);

    await compilePack(inputDir, outputFile);
}

console.log("✅ All compendiums packed.");
