import fs from "node:fs/promises";
import path from "node:path";

import { tcpkg } from "../package.js";
import { wrapNodeFilesystem } from "../wrapNodeFs.js";

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

if (args.length == 0) {
	console.log("\x1b[31mYou need to provide a directory to package!\x1b[0m");
	process.exit();
}

const input = path.resolve(process.cwd(), args[0]);
const output = path.resolve(process.cwd(), args[1] || "./app.idx");

async function checkOutput() {
	let content;
	try {
		content = await fs.readFile(output, { encoding: "utf8" });
	} catch (e) {}

	if (content !== undefined) {
		console.error(
			`\x1b[31mOutput directory isn't empty! (Packaging ${output})\x1b[0m`
		);
		process.exit();
	}
}

if (Boolean(params.override) !== true) {
	// insure we don't override a pre-existing file
	await checkOutput();
}

const pkg = await tcpkg(wrapNodeFilesystem(), input, {
	prefix: params.prefix ? params.prefix + "/" : undefined
});

// stringify it
const result = JSON.stringify(pkg, null, 8);

await fs.writeFile(output, result);
console.log("App packaged to '\x1b[32m" + output + "\x1b[0m' successfully!");
