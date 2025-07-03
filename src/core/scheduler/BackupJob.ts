import cron, { NodeCron, TaskOptions } from 'node-cron';
import { config } from '../../config';
import { MongoBackupService } from '../databases/mongo/MongoBackupService';
import { BackupManager } from '../manager/BackupManager';
import { BackupJobStatus } from '../interfaces/BackupJobStatus';
import { BackupReport } from '../interfaces/BackupReport';
import { notifyFailure, notifySuccess } from '../notification';

class BackupJob {
    private status: BackupJobStatus = {
        isRunning: false,
        lastRunTime: null,
        lastSuccessTime: null,
        lastErrorTime: null,
        lastError: null,
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0
    };

    private manager: BackupManager;
    private cronJob: any = null;

    constructor() {
        const mongoService = new MongoBackupService();
        this.manager = new BackupManager(mongoService);
    }

    async start(): Promise<void> {
        if (this.cronJob) {
            console.log('⚠️ Backup job is already scheduled');
            return;
        }

        try {
            console.log('🔍 Validating backup service...');
            await this.manager.validateService();
            console.log('✅ Validation successful');
        } catch (err) {
            console.error('❌ Backup service validation failed:', err);
            return;
        }

        const cronOptions: TaskOptions = {};

        if (config.cronTimezone) {
            cronOptions.timezone = config.cronTimezone;
        }

        console.log(`📅 Scheduling backup job with cron: ${config.cronSchedule} ${config.cronTimezone ? "Timezone: " + config.cronTimezone : ""}`);

        this.cronJob = cron.schedule(config.cronSchedule, async () => {
            await this.runBackupJob();
        }, cronOptions);

        console.log('✅ Backup job scheduled successfully');

        cron.schedule('0 * * * *', () => {
            this.logStatus();
        });
    }

    stop(): void {
        if (this.cronJob) {
            this.cronJob.destroy();
            this.cronJob = null;
            console.log('🛑 Backup job stopped');
        }
    }

    private async runBackupJob(): Promise<void> {
        if (this.status.isRunning) {
            console.log('⚠️ Previous backup is still running, skipping this execution');
            return;
        }

        const startTime = new Date();
        this.status.isRunning = true;
        this.status.lastRunTime = startTime;
        this.status.totalRuns++;

        const report: BackupReport = {
            timestamp: startTime.toISOString(),
            success: false,
            durationSeconds: 0,
        };

        console.log(`[${startTime.toISOString()}] 🚀 Starting scheduled backup (Run #${this.status.totalRuns})`);

        try {
            await this.manager.runBackup();

            this.status.lastSuccessTime = new Date();
            this.status.successfulRuns++;
            this.status.lastError = null;

            const duration = Date.now() - startTime.getTime();
            report.durationSeconds = Math.round(duration / 1000);
            report.success = true;
            console.log(`✅ Backup completed successfully in ${Math.round(duration / 1000)}s`);

            const stats = await this.manager.getBackupStats();
            report.stats = {
                totalBackups: stats.totalBackups,
                totalSize: stats.totalSize,
                oldestBackup: stats.oldestBackup?.toISOString() ?? null,
                newestBackup: stats.newestBackup?.toISOString() ?? null,
            };
            console.log(`📊 Backup Stats: ${stats.totalBackups} backups, ${this.formatBytes(stats.totalSize)} total size`);

            await notifySuccess(`Backup succeeded at ${report.timestamp}`, report);

        } catch (error) {
            this.status.lastErrorTime = new Date();
            this.status.failedRuns++;
            this.status.lastError = error instanceof Error ? error.message : 'Unknown error';

            const duration = Date.now() - startTime.getTime();
            report.durationSeconds = Math.round(duration / 1000);

            console.error(`❌ Backup failed after ${Math.round(duration / 1000)}s:`, error);

            await notifyFailure(`Backup failed at ${report.timestamp}`, error, report);

            await this.handleBackupFailure(error);

        } finally {
            this.status.isRunning = false;
        }
    }

    private async handleBackupFailure(error: unknown): Promise<void> {
        // TO BE IMPLEMENTED: Implement notification logic
        // For example: send email, post to Discord, write to external monitoring system
        console.error('🚨 Backup failure detected - implement notification logic here');

        // TO BE IMPLEMENTED: Implement retry logic here
        if (this.status.failedRuns >= 3) {
            console.error('🚨 Multiple consecutive failures detected - manual intervention may be required');
        }
    }

    private logStatus(): void {
        const uptime = this.status.lastRunTime ?
            Math.round((Date.now() - this.status.lastRunTime.getTime()) / (1000 * 60)) : 0;

        console.log(`📈 Backup Job Status:
        - Total Runs: ${this.status.totalRuns}
        - Successful: ${this.status.successfulRuns}
        - Failed: ${this.status.failedRuns}
        - Success Rate: ${this.status.totalRuns > 0 ? Math.round((this.status.successfulRuns / this.status.totalRuns) * 100) : 0}%
        - Last Success: ${this.status.lastSuccessTime?.toISOString() || 'Never'}
        - Last Error: ${this.status.lastError || 'None'}
        - Currently Running: ${this.status.isRunning ? 'Yes' : 'No'}`);
    }

    private formatBytes(bytes: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    getStatus(): BackupJobStatus {
        return { ...this.status };
    }
}

const backupJob = new BackupJob();

export async function scheduleBackup(): Promise<void> {
    await backupJob.start();
}

export function stopBackup(): void {
    backupJob.stop();
}

export function getBackupStatus(): BackupJobStatus {
    return backupJob.getStatus();
}