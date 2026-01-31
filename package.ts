import {
	ConstellationSystemFilesystemInterface,
	LatestFileIndex
} from "./definitions.d";
import { getMimeType } from "./mimes.js";

function removeLeadingSlash(text: string): string {
	let workingString = String(text);

	while (workingString[0] == "/") {
		workingString = workingString.substring(1);
	}

	return workingString;
}

export async function tcpkg(
	fs: ConstellationSystemFilesystemInterface,
	packageDirectory: string,
	config?: { prefix?: string }
): Promise<LatestFileIndex> {
	// package info
	const pkg: LatestFileIndex = {
		files: {},
		directories: [],
		version: 2
	};

	if (config?.prefix) {
		let temp = "";
		config.prefix
			.split("/")
			.filter((item) => item.trim() !== "")
			.forEach((item) => {
				temp += "/" + item;
				pkg.directories.push(removeLeadingSlash(temp));
			});
	}

	// walk the folder
	async function walk(directory: string) {
		const contents = await fs.readdir(directory);

		for (const item of contents) {
			// determine the absolute path of the file
			const dir = fs.resolve(directory, item);

			// determine if the path is a directory or not
			const stat = await fs.stat(dir);
			if (stat == undefined)
				throw new Error(
					"Stat is undefined for a file that *should* exist?"
				);

			const isDir = stat.isDirectory();

			// get the *relative* path
			const relative: string = fs.relative(packageDirectory, dir);

			if (isDir) {
				// folders can simply be added to the directories list
				pkg.directories.push(
					removeLeadingSlash((config?.prefix ?? "") + relative)
				);
				await walk(dir);
			} else {
				try {
					// files require MIME-type to determine if they are binary or not, because binary images are managed as DATA-URIs.

					const fileExtension = item.substring(
						item.lastIndexOf(".") + 1
					);
					const mime = getMimeType(fileExtension);
					if (mime == null) {
						console.warn(`Unknown MIME type for file ${dir}`);
					}
					const mimeType = mime ?? "text/plain";

					const isText =
						mimeType.startsWith("text/") ||
						mimeType.includes("xml") ||
						mimeType.includes("javascript") ||
						mimeType.includes("typescript") ||
						mimeType.includes("json");

					const text = await fs.readFile(dir);
					let content: string = text ?? "";
					if (!isText && !content.startsWith("data:")) {
						try {
							const fs = await import("fs/promises");

							const b64 = (await fs.readFile(dir)).toString(
								"base64"
							);

							content = `data:${mimeType};base64,${b64}`;
						} catch (e) {
							throw new Error(
								`Binary files must use data:URI representation in browser. (processing ${dir})`
							);
						}
					}

					const stats = await fs.stat(dir);

					if (!content || !stats)
						throw new Error(
							`"Unexpected undefined when reading/statting file at ${dir}`
						);

					pkg.files[
						removeLeadingSlash((config?.prefix ?? "") + relative)
					] = {
						contents: content,

						created: stats.ctime,
						modified: stats.mtime,

						size: stats.size
					};
				} catch (e) {
					throw new Error(
						`Error ${e} occurred when packaging ${dir}. it has not been included in the index.`
					);
				}
			}
		}
	}

	try {
		await walk(packageDirectory);
	} catch (e) {
		throw e;
	}

	return pkg;
}
