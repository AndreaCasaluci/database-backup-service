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

### Local Installation

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

### Docker Installation

**Prerequisites:**
- Docker and Docker Compose installed

**Setup:**
1. Clone the repository
2. Copy and configure environment:
   ```bash
   cp .env.docker .env
   # Edit .env with your actual configuration
   ```

3. Start with Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Copy the environment template and configure:
   ```bash
   cp .env.example .env
   ```

**Docker Features:**
- 🐳 Complete containerized environment
- 🗄️ Includes MongoDB container for testing
- 📦 MongoDB tools pre-installed
- 🔒 Non-root user execution for security
- 📊 Health checks and monitoring
- 🔄 Automatic restart policies
- 📁 Persistent backup storage

## Configuration

Configure the service using environment variables in your `.env` file:

### Database Configuration
```env
# Local development
MONGODB_URI=mongodb://localhost:27017/your-database

# Docker environment (using Docker Compose MongoDB)
MONGODB_URI=mongodb://admin:password123@mongodb:27017/myapp?authSource=admin
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

#### Local Development
```bash
# Build the project
npm run build

# Run the service
node dist/index.js
```

#### Docker Deployment

**Quick Start with Docker Compose:**
```bash
# Copy environment template
cp .env.docker .env
# Edit .env with your configuration

# Start all services (backup service + MongoDB)
docker-compose up -d

# View logs
docker-compose logs -f backup-service

# Stop services
docker-compose down
```

**Manual Docker Build:**
```bash
# Build image
docker build -t database-backup-service .

# Run container
docker run -d \
  --name backup-service \
  --env-file .env \
  -v $(pwd)/backups:/app/backups \
  database-backup-service
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
Backup files follow the pattern: `backup-YYYY-MM-DD-HH-mm-ss`

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

## Docker Deployment

### Docker Architecture
- **Base Image**: Node.js 18 Alpine Linux
- **Security**: Non-root user execution (user: backup, uid: 1001)
- **Tools**: MongoDB database tools pre-installed
- **Health Checks**: Built-in container health monitoring
- **Volumes**: Persistent backup storage
- **Network**: Isolated bridge network for service communication

### Docker Compose Services
- **backup-service**: The main backup application
- **mongodb**: MongoDB database for testing/development
- **Volumes**: `mongodb_data` for database persistence, local `./backups` for backup files
- **Network**: `backup-network` for secure inter-service communication

### Docker Commands
```bash
# Production deployment
docker-compose up -d

# Development with hot-reload
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f backup-service

# Scale and manage
docker-compose ps                    # View service status
docker-compose restart backup-service # Restart specific service
docker-compose down                  # Stop all services

# Container management
docker exec -it database-backup-service sh  # Access container shell
docker stats database-backup-service        # Monitor resources
```

### Environment Files
- **`.env`**: Local development configuration
- **`.env.docker`**: Docker-specific configuration template
- **Docker environment variables**: Automatically loaded via `env_file` in docker-compose.yml

### Volume Mounts
```yaml
volumes:
  - ./backups:/app/backups              # Backup persistence
  - /etc/localtime:/etc/localtime:ro    # Timezone sync
```

### Docker Security Features
- Alpine Linux base for minimal attack surface
- Non-root user execution (backup:nodejs)
- Network isolation with custom bridge
- Environment-based secret management
- Read-only system file mounts

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

### Docker-Specific Issues

**Container Won't Start**
```bash
# Check container logs
docker-compose logs backup-service

# Verify MongoDB connectivity
docker-compose exec backup-service mongodump --version
```

**Permission Denied on Backup Directory**
```bash
# Fix backup directory permissions
sudo chown -r 1001:1001 ./backups
chmod 755 ./backups
```

**MongoDB Connection Issues in Docker**
```bash
# Check if MongoDB container is running
docker-compose ps mongodb

# Test connection from backup service
docker-compose exec backup-service \
  mongodump --host mongodb:27017 --version

# Check Docker network
docker network ls
docker network inspect database-backup-service_backup-network
```

**Build Issues**
```bash
# Clean Docker cache and rebuild
docker system prune -a
docker-compose build --no-cache
```

**Container Resource Issues**
```bash
# Monitor container resources
docker stats database-backup-service

# Check available disk space
docker system df
```

### Logs and Debugging

Enable detailed logging by checking console output. The service provides:
- Startup validation messages
- Backup operation progress
- Error details with stack traces
- Status summaries every hour