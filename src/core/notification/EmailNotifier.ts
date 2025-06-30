import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import { config } from '../../config';
import { INotificationService } from '../interfaces/INotificationService';
import { BackupReport } from '../interfaces/BackupReport';

export class EmailNotifier implements INotificationService {
    private transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: Number(config.smtpPort),
        secure: config.smtpSecure === true,
        auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
        },
    });

    private template: handlebars.TemplateDelegate;

    constructor() {
        const templatePath = path.join(__dirname, 'templates', 'backup-report.html');
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        this.template = handlebars.compile(templateContent);
    }

    async sendSuccess(message: string, report?: BackupReport) {
        const html = this.template({
            ...report,
            status: '✅ Success',
            statusClass: 'status-success',
            duration: report?.durationSeconds || 0,
        });
        await this.sendEmail('✅ Backup Successful', html);
    }

    async sendFailure(message: string, error?: unknown, report?: BackupReport) {
        const html = this.template({
            ...report,
            status: '❌ Failure',
            statusClass: 'status-failure',
            success: false,
            error: error instanceof Error ? error.message : String(error),
        });
        await this.sendEmail('❌ Backup Failed', html);
    }

    private async sendEmail(subject: string, html: string) {
        const recipients = config.notificationEmails?.split(',').map(e => e.trim());
        if (!recipients?.length) return;

        await this.transporter.sendMail({
            from: `"Backup Service" <${config.smtpUser}>`,
            to: recipients,
            subject,
            html,
        });
    }
}
