export class StringUtils {
    static filterMessage(message: string, targets: string[]): string {
        const escapedTargets = targets
            .map(target => target.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));

        const regex = new RegExp(escapedTargets.join('|'), 'gi');
        return message.replace(regex, '****');
    }
}