import { IBackupService } from '../interfaces/IBackupService';
import { config } from '../../config';
import { readdir, remove, ensureDir } from 'fs-extra';
import path from 'path';

export class BackupManager {
    constructor(private backupService: IBackupService) { }

    async runBackup() {
        await ensureDir(config.backupDir);

        await this.backupService.performBackup();

        const files = (await readdir(config.backupDir)).sort();
        if (files.length >= config.maxBackups) {
            const oldest = files[0];
            await remove(path.join(config.backupDir, oldest));
            console.log(`🗑️ Rimosso backup vecchio: ${oldest}`);
        }
    }
}
