import * as fs from "fs/promises";
import * as path from "path"

export async function createDir(path: string) {
    const exists = await pathExists(path);
    if (!exists) {
        await fs.mkdir(path, { recursive: true });
    }
}

export async function createFile(name: string, dirPath: string, content: string) {
    const exists = await pathExists(dirPath);
    if (exists) {
        const filePath = path.join(dirPath, name);
        await fs.writeFile(filePath, content);
    }    
}

export async function deleteFile(path: string) {
    const exists = await pathExists(path);
    if (exists) {
        await fs.unlink(path);
    }
}

export async function pathExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}
