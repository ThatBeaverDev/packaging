// CLI hook for `tcpdiff`

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { LatestFileIndex } from "../definitions.js";
import { updateIdx } from "../versionChange.js";
import { overlayIdx } from "../overlay.js";

const params: Partial<Record<string, string>> = {};
const args = process.argv
	.splice(2, Infinity)
	.map((item) => {
		if (item[0] == "-") {
			// it's a parameter
			const name = item.substring(1, Infinity).split("=")[0];
			const value = item.substring(item.indexOf("=") + 1, Infinity);

			params[name] = value;

			return undefined;
		}

		return item;
	})
	.filter((item) => item !== undefined);

if (args.length < 2) {
	console.log(
		"\x1b[31mYou need to provide files to overlay! (base file, overlay file)\x1b[0m"
	);
	process.exit();
}

const baseFilePath = resolve(process.cwd(), args[0]);
const overlayFilePath = resolve(process.cwd(), args[1]);
const output = resolve(process.cwd(), args[2] || "./overlayed.idx");

const baseFileData = await readFile(baseFilePath, "utf8");
const overlayFileData = await readFile(overlayFilePath, "utf8");

const baseIndex: LatestFileIndex = updateIdx(JSON.parse(baseFileData));
const overlayIndex: LatestFileIndex = updateIdx(JSON.parse(overlayFileData));

const overlayed = overlayIdx(baseIndex, overlayIndex);

// stringify it
const result = JSON.stringify(overlayed, null, 8);

await writeFile(output, result);
console.log("Idx overlayed to '\x1b[32m" + output + "\x1b[0m' successfully!");
