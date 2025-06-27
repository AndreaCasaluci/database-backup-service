import { scheduleBackup } from "./scheduler/BackupJob";

console.log('Database Backup Service started...');
scheduleBackup();