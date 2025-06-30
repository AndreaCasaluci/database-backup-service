import { BackupReport } from "./BackupReport";

export interface INotificationService {
    sendSuccess(message: string, report?: BackupReport): Promise<void>;
    sendFailure(message: string, error?: unknown, report?: BackupReport): Promise<void>;
}