import { IBackupService } from '../../interfaces/IBackupService';
import { config } from '../../../config';
import { ensureDir, pathExists } from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export class MongoBackupService implements IBackupService {
    async performBackup(): Promise<void> {
        const timestamp = this.generateTimestamp();
        const backupPath = path.join(config.backupDir, `backup-${timestamp}`);

        try {
            await ensureDir(config.backupDir);
            console.log(`🚀 Starting MongoDB backup to: ${backupPath}`);

            await this.validateConnection();

            await this.executeBackup(backupPath);

            await this.validateBackup(backupPath);

        } catch (error) {
            console.error('❌ MongoDB backup failed:', error);
            throw new Error(`MongoDB backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async validate(): Promise<void> {
        await this.validateConnection();
    }

    private generateTimestamp(): string {
        return new Date().toISOString().replace(/[:.]/g, '-');
    }

    private async validateConnection(): Promise<void> {
        try {
            console.log('🔍 Validating MongoDB connection...');
            const cmd = `mongosh "${config.mongoUri}" --eval "db.runCommand('ping')" --quiet`;
            const { stdout, stderr } = await execAsync(cmd, { timeout: 10000 });

            if (stderr && !stderr.includes('Using password on the command line')) {
                throw new Error(`Connection validation failed: ${stderr}`);
            }

            console.log('✅ MongoDB connection validated');
        } catch (error) {
            throw new Error(`Failed to validate MongoDB connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async executeBackup(backupPath: string): Promise<void> {
        const compressionFlag = config.enableCompression ? '--gzip' : '';
        const cmd = `mongodump --uri="${config.mongoUri}" -o="${backupPath}" ${compressionFlag}`.trim();

        console.log(`📦 Executing backup command${config.enableCompression ? ' (with compression)' : ''}...`);
        const startTime = Date.now();

        try {
            const { stdout, stderr } = await execAsync(cmd, {
                timeout: 30 * 60 * 1000,
                maxBuffer: 1024 * 1024 * 10
            });

            const duration = Math.round((Date.now() - startTime) / 1000);

            if (stdout) {
                console.log('📄 Backup output:', stdout);
            }

            if (stderr && !this.isExpectedStderr(stderr)) {
                console.warn('⚠️ Backup warnings:', stderr);
            }

            console.log(`✅ MongoDB backup completed in ${duration}s: ${backupPath}`);
        } catch (error) {
            throw new Error(`Backup execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async validateBackup(backupPath: string): Promise<void> {
        try {
            console.log('🔍 Validating backup integrity...');

            const backupExists = await pathExists(backupPath);
            if (!backupExists) {
                throw new Error('Backup directory was not created');
            }

            const { stdout } = await execAsync(`find "${backupPath}" -name "*.bson*" | wc -l`);
            const bsonFileCount = parseInt(stdout.trim(), 10);

            if (bsonFileCount === 0) {
                throw new Error('No BSON files found in backup - backup may be empty or corrupted');
            }

            console.log(`✅ Backup validation passed - found ${bsonFileCount} BSON files`);
        } catch (error) {
            throw new Error(`Backup validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private isExpectedStderr(stderr: string): boolean {
        const expectedPatterns = [
            'Using password on the command line',
            'writing',
            'done dumping'
        ];

        return expectedPatterns.some(pattern =>
            stderr.toLowerCase().includes(pattern.toLowerCase())
        );
    }
}
