import { relative, resolve } from "node:path/posix";
import { ConstellationSystemFilesystemInterface } from "./definitions.d";
import {
	cp,
	mkdir,
	readdir,
	readFile,
	rename,
	rmdir,
	stat,
	unlink,
	writeFile
} from "node:fs/promises";

export function wrapNodeFilesystem(): ConstellationSystemFilesystemInterface {
	return {
		async writeFile(directory: string, content: string): Promise<void> {
			return await writeFile(directory, content);
		},
		async readFile(directory: string): Promise<string | undefined> {
			return await readFile(directory, "utf8");
		},

		async readdir(directory: string): Promise<string[]> {
			return await readdir(directory);
		},
		async rename(oldPath: string, newPath: string): Promise<void> {
			await rename(oldPath, newPath);
		},
		async cp(oldPath: string, newPath: string): Promise<void> {
			await cp(oldPath, newPath);
		},

		resolve(base: string, ...targets: string[]): string {
			return resolve(base, ...targets);
		},
		relative(from: string, to: string): string {
			return relative(from, to);
		},

		async stat(directory: string) {
			return await stat(directory);
		},

		async mkdir(directory: string): Promise<void> {
			await mkdir(directory);
		},
		async rmdir(directory: string): Promise<any> {
			await rmdir(directory);
		},

		async unlink(directory: string): Promise<any> {
			await unlink(directory);
		}
	};
}
