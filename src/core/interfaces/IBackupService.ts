export interface IBackupService {
    performBackup(): Promise<void>;
    validate(): Promise<void>;
}