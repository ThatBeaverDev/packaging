import { FileIndexDiff, LatestFileIndex } from "./definitions.d";

export function diffIdxFiles(
	oldIndex: LatestFileIndex,
	newIndex: LatestFileIndex
): FileIndexDiff {
	const diff: FileIndexDiff = {
		removedDirectories: [],
		newDirectories: [],
		files: {}
	};

	/* -------------------- Directory removals -------------------- */
	for (const name of oldIndex.directories) {
		if (newIndex.directories.includes(name)) {
			// fine
		} else {
			// it's been removed.
			diff.removedDirectories.push(name);
		}
	}

	/* -------------------- Directory additions -------------------- */
	for (const name of newIndex.directories) {
		if (oldIndex.directories.includes(name)) {
			// fine
		} else {
			// it's been added.
			diff.newDirectories.push(name);
		}
	}

	/* -------------------- File Deletions and modifications -------------------- */
	for (const name in oldIndex.files) {
		const oldFile = oldIndex.files[name];
		const newFile = newIndex.files[name];

		if (!newFile) diff.files[name] = { type: "deletion" };

		if (oldFile.contents !== newFile.contents) {
			// changed contents
			diff.files[name] = {
				type: "modification",
				contents: newFile.contents
			};
		}
	}

	/* -------------------- File creations -------------------- */
	for (const name in newIndex.files) {
		const oldFile = oldIndex.files[name];
		const newFile = newIndex.files[name];

		if (oldFile) continue;

		// the file is new
		diff.files[name] = {
			type: "modification",
			contents: newFile.contents
		};
	}

	return diff;
}
