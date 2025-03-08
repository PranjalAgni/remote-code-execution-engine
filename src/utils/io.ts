import fs from "fs/promises";

export async function createFile(name: string, path: string, content: string) {
    const exists = await fileExists(path);
    if (!exists) {
        await fs.writeFile(path, content);
    }    
}

export async function deleteFile(path: string) {
    const exists = await fileExists(path);
    if (exists) {
        await fs.unlink(path);
    }
    
}

export async function fileExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}