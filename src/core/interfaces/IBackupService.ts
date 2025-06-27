export interface IBackupService {
    performBackup(): Promise<void>;
}