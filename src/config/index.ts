import dotenv from 'dotenv';
dotenv.config();

export const config = {
    mongoUri: process.env.MONGODB_URI!,
    backupDir: process.env.BACKUP_DIR || './backups',
    maxBackups: parseInt(process.env.MAX_BACKUPS || '7', 10),
    cronSchedule: process.env.CRON_SCHEDULE || '0 0 * * *',
};
