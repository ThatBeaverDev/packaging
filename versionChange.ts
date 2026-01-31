import {
	ConstellationFileIndexv1,
	ConstellationFileIndexv2,
	FileIndex
} from "./definitions";

export function indexV1ToIndexV2(
	oldIndex: ConstellationFileIndexv1
): ConstellationFileIndexv2 {
	const index: ConstellationFileIndexv2 = {
		directories: oldIndex.directories,
		version: 2,
		files: {}
	};

	for (const name in oldIndex.files) {
		const file = oldIndex.files[name];

		if (typeof file == "string") {
			index.files[name] = {
				contents: file,

				created: new Date(),
				modified: new Date(),

				size: file.length * 8
			};
		} else {
			index.files[name] = {
				contents: file.data,

				created: new Date(),
				modified: new Date(),

				size: file.data.length * 8
			};
		}
	}

	return index;
}

export function updateIdx(index: FileIndex) {
	if (!("version" in index)) {
		return indexV1ToIndexV2(index);
	}

	switch (index.version) {
		case 2:
			return index;
		default:
			throw new Error("Unknown index version:", index.version);
	}
}
