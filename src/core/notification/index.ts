import { BackupReport } from '../interfaces/BackupReport';
import { config } from '../../config';
import { INotificationService } from '../interfaces/INotificationService';
import { EmailNotifier } from './EmailNotifier';

const notifiers: INotificationService[] = [
    new EmailNotifier(),
];

export async function notifySuccess(message: string, report?: BackupReport) {
    for (const notifier of notifiers) {
        try {
            if (notifier instanceof EmailNotifier && config.emailNotificationsEnabled)
                await notifier.sendSuccess(message, report);
        } catch (err) {
            console.error('Notification failure (success):', err);
        }
    }
}

export async function notifyFailure(message: string, error?: unknown, report?: BackupReport) {
    for (const notifier of notifiers) {
        try {
            await notifier.sendFailure(message, error, report);
        } catch (err) {
            console.error('Notification failure (error):', err);
        }
    }
}
