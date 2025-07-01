# Database Backup Service

A robust, automated database backup service with comprehensive notification support and scheduled execution capabilities.

## Features

- **Automated Database Backups**: Scheduled database backups
- **Smart Backup Management**: Automatic cleanup of old backups based on retention policy
- **Multiple Notification Channels**: Email and Discord notifications for backup status
- **Comprehensive Monitoring**: Detailed backup statistics and job status tracking
- **Configurable Scheduling**: Flexible cron-based backup scheduling
- **Error Handling**: Robust error handling with detailed logging and failure notifications
- **Timeout Protection**: Configurable backup timeout to prevent hanging operations

## Architecture

The service follows a modular architecture with clear separation of concerns:

```
├── core/
│   ├── databases/mongo/          # MongoDB-specific backup implementation
│   ├── interfaces/               # TypeScript interfaces and contracts
│   ├── manager/                  # Backup orchestration and file management
│   ├── notification/             # Notification service implementations
│   └── scheduler/                # Cron job scheduling and status tracking
├── config.ts                     # Configuration management
└── index.ts                      # Application entry point
```

### Key Components

- **BackupManager**: Orchestrates backup operations and manages backup file lifecycle
- **MongoBackupService**: Handles MongoDB-specific backup operations using `mongodump`
- **BackupJob**: Manages cron scheduling and tracks backup job status
- **NotificationServices**: Handles email (SMTP) and Discord webhook notifications
- **Configuration**: Environment-based configuration with sensible defaults

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Install MongoDB tools (required for `mongodump`):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb-database-tools
   
   # macOS
   brew install mongodb/brew/mongodb-database-tools
   
   # Windows
   # Download from MongoDB official website
   ```

4. Copy the environment template and configure:
   ```bash
   cp .env.example .env
   ```

## Configuration

Configure the service using environment variables in your `.env` file:

### Database Configuration
```env
MONGODB_URI=mongodb://localhost:27017/your-database
```

### Backup Settings
```env
BACKUP_DIR=./backups              # Directory to store backup files
MAX_BACKUPS=7                     # Number of backups to retain
CRON_SCHEDULE=0 0 * * *          # Daily at midnight (cron format)
TIMEZONE=UTC                      # Timezone for scheduling
BACKUP_TIMEOUT=1800000           # Backup timeout in milliseconds (30 minutes)
ENABLE_COMPRESSION=false         # Enable gzip compression for backups
```

### Email Notifications
```env
ENABLE_EMAIL_NOTIFICATIONS=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NOTIFICATION_EMAILS=admin1@email.com,admin2@email.com
```

### Discord Notifications
```env
ENABLE_DISCORD_NOTIFICATIONS=true
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_id/your_token
```

## Usage

### Starting the Service

```bash
# Build the project
npm run build

# Run the service
node dist/index.js
```

The service will:
1. Validate the MongoDB connection
2. Schedule the backup job according to your cron configuration
3. Start monitoring and logging backup status

### Cron Schedule Examples

```env
# Every day at 2:00 AM
CRON_SCHEDULE=0 2 * * *

# Every 6 hours
CRON_SCHEDULE=0 */6 * * *

# Every Sunday at 3:00 AM
CRON_SCHEDULE=0 3 * * 0

# Every 15 minutes (for testing)
CRON_SCHEDULE=*/15 * * * *
```

## Monitoring

### Console Logging
The service provides detailed console output including:
- Backup start/completion status
- Duration and performance metrics
- File cleanup operations
- Error details and stack traces
- Hourly status summaries

### Backup Statistics
Each backup operation tracks:
- Total number of backups
- Total storage used
- Oldest and newest backup timestamps
- Success/failure rates
- Operation duration

### Notification Reports
Both email and Discord notifications include:
- Backup success/failure status
- Operation duration
- Backup statistics
- Error details (for failures)
- Timestamp information

## Error Handling

The service implements comprehensive error handling:

- **Connection Failures**: MongoDB connection issues are caught and reported
- **Disk Space**: Backup directory creation and space issues are handled
- **Timeout Protection**: Long-running backups are terminated after the configured timeout
- **Notification Failures**: Notification errors don't interrupt the backup process
- **Concurrent Execution**: Prevents multiple backup jobs from running simultaneously

## File Management

### Backup File Naming
Backup files follow the pattern: `backup-YYYY-MM-DD-HH-mm-ss.archive`

### Automatic Cleanup
- Maintains only the most recent backups (configurable via `MAX_BACKUPS`)
- Removes oldest backups when the limit is exceeded
- Provides detailed logging of cleanup operations

### Storage Structure
```
backups/
├── backup-2024-01-01-00-00-00
├── backup-2024-01-02-00-00-00
└── backup-2024-01-03-00-00-00
```

## Dependencies

### Core Dependencies
- `dotenv`: Environment configuration management
- `node-cron`: Cron job scheduling
- `fs-extra`: Enhanced file system operations

### Database
- `mongodump`: MongoDB backup utility (external dependency)

### Notifications
- `nodemailer`: SMTP email sending
- `handlebars`: Email template rendering
- `axios`: HTTP requests for Discord webhooks

## Development

### Project Structure
```
src/
├── core/
│   ├── databases/
│   │   └── mongo/
│   │       └── MongoBackupService.ts
│   ├── interfaces/
│   │   ├── BackupJobStatus.ts
│   │   ├── BackupReport.ts
│   │   ├── IBackupService.ts
│   │   └── INotificationService.ts
│   ├── manager/
│   │   └── BackupManager.ts
│   ├── notification/
│   │   ├── DiscordNotifier.ts
│   │   ├── EmailNotifier.ts
│   │   └── index.ts
│   └── scheduler/
│       └── BackupJob.ts
├── config.ts
└── index.ts
```

### Adding New Database Support
To support additional databases:

1. Implement the `IBackupService` interface
2. Create a new service class in `core/databases/`
3. Update the `BackupJob` constructor to use the new service

### Adding New Notification Channels
To add new notification methods:

1. Implement the `INotificationService` interface
2. Create a new notifier class in `core/notification/`
3. Register the notifier in the notification index file

## Security Considerations

- Store sensitive credentials in environment variables
- Use app-specific passwords for email authentication
- Restrict Discord webhook URLs to authorized channels
- Ensure backup directory has appropriate file permissions
- Consider encrypting backup files for sensitive data

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Verify `MONGODB_URI` is correct
- Check MongoDB server is running
- Validate network connectivity and firewall settings

**Email Notifications Not Working**
- Verify SMTP credentials and server settings
- Check if less secure app access is enabled (Gmail)
- Review email server logs for authentication errors

**Discord Notifications Not Working**
- Validate webhook URL format and permissions
- Check Discord server webhook settings
- Verify network connectivity to Discord APIs

**Backup Files Not Created**
- Ensure `mongodump` is installed and accessible
- Check backup directory permissions
- Verify sufficient disk space

### Logs and Debugging

Enable detailed logging by checking console output. The service provides:
- Startup validation messages
- Backup operation progress
- Error details with stack traces
- Status summaries every hour