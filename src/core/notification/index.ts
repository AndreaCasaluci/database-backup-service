import { BackupReport } from '../interfaces/BackupReport';
import { config } from '../../config';
import { INotificationService } from '../interfaces/INotificationService';
import { EmailNotifier } from './EmailNotifier';
import { DiscordNotifier } from './DiscordNotifier';
import { StringUtils } from '../../utils/StringUtils';

const NOTIFIER_CONFIGS = [
    {
        notifier: EmailNotifier,
        enabled: () => config.emailNotificationsEnabled
    },
    {
        notifier: DiscordNotifier,
        enabled: () => config.discordNotificationsEnabled
    }
]

function getEnabledNotifiers(): INotificationService[] {
    return NOTIFIER_CONFIGS.filter(({ enabled }) => enabled())
        .map(({ notifier }) => new notifier());
}

async function executeNotifications(
    notificationFn: (notifier: INotificationService) => Promise<void>
): Promise<void> {
    const notifiers = getEnabledNotifiers();

    const notifications = notifiers.map(async (notifier) => {
        try {
            await notificationFn(notifier);
        } catch (err) {
            console.error('Notification failure:', err);
        }
    });

    await Promise.allSettled(notifications);
}

export async function notifySuccess(message: string, report?: BackupReport) {
    await executeNotifications(notifier => notifier.sendSuccess(filterNotificationMessage(message), report));
}

export async function notifyFailure(message: string, error?: unknown, report?: BackupReport) {
    await executeNotifications(notifier => notifier.sendFailure(filterNotificationMessage(message), filterNotificationMessage(error instanceof Error ? error.message : String(error)), report));
}

function filterNotificationMessage(message: string): string {
    return StringUtils.filterMessage(message, [...config.stringsToFilter, config.mongoUri]);
}