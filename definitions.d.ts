export interface ConstellationFileIndexv1 {
	directories: string[];
	files: Record<string, string | { type: "string" | "binary"; data: string }>;
}

interface File {
	contents: string;

	created: Date;
	modified: Date;

	size: number;
}
export interface ConstellationFileIndexv2 {
	directories: string[];
	files: Record<string, File>;
	version: 2;
}

export type LatestFileIndex = ConstellationFileIndexv2;
export type FileIndex = ConstellationFileIndexv1 | ConstellationFileIndexv2;

export interface ConstellationApplicationInstaller {
	name: string;
	icon: string;
	version: number;
	technicalName: string;
	index: LatestFileIndex;
}

export interface FileIndexDiff {
	newDirectories: string[];
	removedDirectories: string[];
	files: Record<
		string,
		{ type: "modification"; contents: string } | { type: "deletion" }
	>;
}

interface ConstellationFilesystemStats {
	atime: Date;
	birthtime: Date;
	blocks: number;
	ctime: Date;
	dev: number;
	gid: number;
	ino: number;
	mode: number;
	mtime: Date;
	nlink: number;
	rdev: number;
	size: number;
	uid: number;

	isBlockDevice(): boolean;
	isCharacterDevice(): boolean;
	isDirectory(): boolean;
	isFIFO(): boolean;
	isFile(): boolean;
	isSocket(): boolean;
	isSymbolicLink(): boolean;
}

export interface ConstellationSystemFilesystemInterface {
	writeFile(directory: string, content: string): Promise<void>;
	readFile(directory: string): Promise<string | undefined>;
	readdir(directory: string): Promise<string[]>;
	rename(oldPath: string, newPath: string): Promise<void>;
	cp(oldPath: string, newPath: string): Promise<void>;
	resolve(base: string, ...targets: string[]): string;
	relative(from: string, to: string): string;
	stat(directory: string): Promise<ConstellationFilesystemStats | undefined>;
	mkdir(directory: string): Promise<void>;
	rmdir(directory: string): Promise<any>;
	unlink(directory: string): Promise<any>;
}
