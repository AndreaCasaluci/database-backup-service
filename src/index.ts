import { scheduleBackup } from "./core/scheduler/BackupJob";

async function startService() {
    console.log('Database Backup Service starting...');

    try {
        await scheduleBackup();
        console.log('Database Backup Service started successfully!');
    } catch (error) {
        console.error('Failed to start Database Backup Service:', error);
        process.exit(1);
    }
}

startService();