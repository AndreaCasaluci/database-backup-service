import { INotificationService } from '../interfaces/INotificationService';
import { BackupReport } from '../interfaces/BackupReport';
import { config } from '../../config';
import axios from 'axios';

export class DiscordNotifier implements INotificationService {
    private webhookUrl = config.discordWebhookUrl;

    private async sendEmbed(embed: any) {
        if (!this.webhookUrl) return;
        await axios.post(this.webhookUrl, { embeds: [embed] });
    }

    async sendSuccess(_message: string, report?: BackupReport) {
        const stats = report?.stats;
        await this.sendEmbed({
            title: "✅ Backup Successful",
            color: 0x2ecc71,
            fields: [
                { name: "Duration", value: `${report?.durationSeconds ?? 'N/A'}s`, inline: true },
                { name: "Total Backups", value: `${stats?.totalBackups ?? 'N/A'}`, inline: true },
                { name: "Total Size", value: `${stats?.totalSize ? stats?.totalSize + " Bytes" : 'N/A'}`, inline: true },
                { name: "Oldest Backup", value: `${stats?.oldestBackup || 'N/A'}`, inline: false },
                { name: "Newest Backup", value: `${stats?.newestBackup || 'N/A'}`, inline: false },
                { name: "Date", value: new Date(report?.timestamp || Date.now()).toLocaleString(), inline: false }
            ],
            footer: { text: "Database Backup Service" },
            timestamp: report?.timestamp || new Date().toISOString(),
        });
    }


    async sendFailure(_message: string, error?: unknown, report?: BackupReport) {
        const stats = report?.stats;
        await this.sendEmbed({
            title: "❌ Backup Failed",
            color: 0xe74c3c,
            fields: [
                { name: "Error", value: error instanceof Error ? error.message : String(error), inline: false },
                { name: "Duration", value: `${report?.durationSeconds ?? 'N/A'}s`, inline: true },
                { name: "Total Backups", value: `${stats?.totalBackups ?? 'N/A'}`, inline: true },
                { name: "Total Size", value: `${stats?.totalSize ? stats?.totalSize + " Bytes" : 'N/A'}`, inline: true },
                { name: "Oldest Backup", value: `${stats?.oldestBackup || 'N/A'}`, inline: false },
                { name: "Newest Backup", value: `${stats?.newestBackup || 'N/A'}`, inline: false },
                { name: "Date", value: new Date(report?.timestamp || Date.now()).toLocaleString(), inline: false }
            ],
            footer: { text: "Database Backup Service" },
            timestamp: report?.timestamp || new Date().toISOString(),
        });
    }

}
