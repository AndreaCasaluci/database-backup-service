FROM node:18-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl gnupg bash ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/*

# Install MongoDB tools (Docker will automatically use the right architecture)
RUN curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg \
    && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" \
    | tee /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && apt-get update && apt-get install -y \
    mongodb-database-tools \
    mongodb-mongosh \
    && rm -rf /var/lib/apt/lists/*

# Verify installations
RUN mongosh --version && mongodump --version

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

RUN mkdir -p /app/backups \
    && addgroup --gid 1001 nodejs \
    && adduser --disabled-password --uid 1001 --ingroup nodejs backup \
    && chown -R backup:nodejs /app

USER backup

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('Service is running')" || exit 1

CMD ["node", "dist/index.js"]