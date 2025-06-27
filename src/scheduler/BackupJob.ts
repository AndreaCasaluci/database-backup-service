import cron from 'node-cron';
import { config } from '../config';
import { MongoBackupService } from '../databases/mongo/MongoBackupService';
import { BackupManager } from '../core/manager/BackupManager';

export function scheduleBackup() {
    const mongoService = new MongoBackupService();
    const manager = new BackupManager(mongoService);

    cron.schedule(config.cronSchedule, async () => {
        console.log(`[${new Date().toISOString()}] Starting Backup...`);
        await manager.runBackup();
    });
}
