import { IBackupService } from '../interfaces/IBackupService';
import { config } from '../../config';
import { readdir, remove, ensureDir, stat } from 'fs-extra';
import path from 'path';

export class BackupManager {
    constructor(private backupService: IBackupService) { }

    async validateService(): Promise<void> {
        await this.backupService.validate();
    }

    async runBackup(): Promise<void> {
        try {
            await ensureDir(config.backupDir);
            console.log(`📁 Backup directory ensured: ${config.backupDir}`);

            await this.backupService.performBackup();

            await this.cleanupOldBackups();

            console.log('✅ Backup process completed successfully');
        } catch (error) {
            console.error('❌ Backup process failed:', error);
            throw error;
        }
    }

    private async cleanupOldBackups(): Promise<void> {
        try {
            const files = await readdir(config.backupDir);

            const backupFiles = await Promise.all(
                files
                    .filter(file => file.startsWith('backup-'))
                    .map(async (file) => {
                        const filePath = path.join(config.backupDir, file);
                        const stats = await stat(filePath);
                        return {
                            name: file,
                            path: filePath,
                            createdAt: stats.birthtime
                        };
                    })
            );

            backupFiles.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

            const filesToRemove = backupFiles.slice(0, Math.max(0, backupFiles.length - config.maxBackups));

            for (const file of filesToRemove) {
                await remove(file.path);
                console.log(`🗑️  Old backup removed: ${file.name} (created: ${file.createdAt.toISOString()})`);
            }

            if (filesToRemove.length === 0) {
                console.log(`📊 Current backups: ${backupFiles.length}/${config.maxBackups}`);
            }
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
            throw error;
        }
    }

    async getBackupStats(): Promise<{
        totalBackups: number;
        oldestBackup: Date | null;
        newestBackup: Date | null;
        totalSize: number;
    }> {
        try {
            const files = await readdir(config.backupDir);
            const backupFiles = files.filter(file => file.startsWith('backup-'));

            if (backupFiles.length === 0) {
                return { totalBackups: 0, oldestBackup: null, newestBackup: null, totalSize: 0 };
            }

            let totalSize = 0;
            let oldestDate = new Date();
            let newestDate = new Date(0);

            for (const file of backupFiles) {
                const filePath = path.join(config.backupDir, file);
                const stats = await stat(filePath);
                totalSize += stats.size;

                if (stats.birthtime < oldestDate) oldestDate = stats.birthtime;
                if (stats.birthtime > newestDate) newestDate = stats.birthtime;
            }

            return {
                totalBackups: backupFiles.length,
                oldestBackup: oldestDate,
                newestBackup: newestDate,
                totalSize
            };
        } catch (error) {
            console.error('❌ Error getting backup stats:', error);
            throw error;
        }
    }
}
