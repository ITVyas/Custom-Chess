'use server'
import fs from 'fs/promises';
import path from 'path';


export default async function saveFile(file, publicPathFolders, filename) {
    if (!file) {
        return { error: 'No file provided' };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), 'public', ...publicPathFolders);

        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, buffer);

        return { success: true };
    } catch (error) {
        return { error: 'Failed to save file' };
    }
}