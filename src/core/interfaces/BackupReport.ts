export interface BackupReport {
    timestamp: string;
    success: boolean;
    durationSeconds: number;
    error?: string;
    stats?: {
        totalBackups: number;
        totalSize: number;
        oldestBackup: string | null;
        newestBackup: string | null;
    };
}
