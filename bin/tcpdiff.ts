// CLI hook for `tcpdiff`

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { LatestFileIndex } from "../definitions.js";
import { diffIdxFiles } from "../diff.js";
import { updateIdx } from "../versionChange.js";

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
		"\x1b[31mYou need to provide files to diff! (old file, new file)\x1b[0m"
	);
	process.exit();
}

const oldFilePath = resolve(process.cwd(), args[0]);
const newFilePath = resolve(process.cwd(), args[1]);

const oldFileData = await readFile(oldFilePath, "utf8");
const newFileData = await readFile(newFilePath, "utf8");

const oldIndex: LatestFileIndex = updateIdx(JSON.parse(oldFileData));
const newIndex: LatestFileIndex = updateIdx(JSON.parse(newFileData));

const diff = diffIdxFiles(oldIndex, newIndex);
console.debug(JSON.stringify(diff, null, 4));
