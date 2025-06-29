import { IBackupService } from '../../core/interfaces/IBackupService';
import { config } from '../../config';
import { ensureDir } from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export class MongoBackupService implements IBackupService {
    async performBackup(): Promise<void> {
        await ensureDir(config.backupDir);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(config.backupDir, `backup-${timestamp}`);
        const cmd = `mongodump --uri="${config.mongoUri}" -o="${backupPath}"`;

        try {
            const { stdout, stderr } = await execAsync(cmd);
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
            console.log(`✅ MongoDB Backup completed: ${backupPath}`);
        } catch (err) {
            console.error('❌ An error occurred during MongoDB Backup:', err);
        }
    }
}
