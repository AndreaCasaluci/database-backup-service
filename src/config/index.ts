import dotenv from 'dotenv';
dotenv.config();

export const config = {
    mongoUri: process.env.MONGODB_URI!,
    backupDir: process.env.BACKUP_DIR || './backups',
    maxBackups: parseInt(process.env.MAX_BACKUPS || '7', 10),
    cronSchedule: process.env.CRON_SCHEDULE || '0 0 * * *',
    cronTimezone: process.env.CRON_TIMEZONE,
    backupTimeout: parseInt(process.env.BACKUP_TIMEOUT || '1800000'),
    enableCompression: process.env.ENABLE_COMPRESSION === 'true',
    emailNotificationsEnabled: process.env.ENABLE_EMAIL_NOTIFICATIONS,
    notificationEmails: process.env.NOTIFICATION_EMAILS,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    discordNotificationsEnabled: process.env.ENABLE_DISCORD_NOTIFICATIONS === 'true',
    discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
    stringsToFilter: process.env.STRINGS_TO_FILTER ? process.env.STRINGS_TO_FILTER.split(",") : []
};
