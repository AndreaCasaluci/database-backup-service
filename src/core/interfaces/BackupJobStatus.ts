export interface BackupJobStatus {
    isRunning: boolean;
    lastRunTime: Date | null;
    lastSuccessTime: Date | null;
    lastErrorTime: Date | null;
    lastError: string | null;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
}