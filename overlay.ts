import { FileIndex, LatestFileIndex } from "./definitions.d";
import { updateIdx } from "./versionChange.js";

export function overlayIdx(
	baseFile: FileIndex,
	overlayFile: FileIndex
): LatestFileIndex {
	const base = updateIdx(baseFile);
	const overlayer = updateIdx(overlayFile);

	overlayer.directories.forEach((item) => {
		if (!base.directories.includes(item)) {
			base.directories.push(item);
		}
	});

	for (const path in overlayer.files) {
		if (base.files[path]) {
			throw new Error(`Collision for files at ${path}`);
		}

		base.files[path] = overlayer.files[path];
	}

	return base;
}
