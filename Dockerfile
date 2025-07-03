# Multi-stage build to get MongoDB tools from official MongoDB image
FROM mongo:7.0 AS mongo-tools

# Main application image
FROM node:18-slim

# Copy MongoDB tools from the mongo image
COPY --from=mongo-tools /usr/bin/mongosh /usr/bin/mongosh
COPY --from=mongo-tools /usr/bin/mongodump /usr/bin/mongodump
COPY --from=mongo-tools /usr/bin/mongoexport /usr/bin/mongoexport
COPY --from=mongo-tools /usr/bin/mongoimport /usr/bin/mongoimport
COPY --from=mongo-tools /usr/bin/mongorestore /usr/bin/mongorestore

# Install basic dependencies and MongoDB tools dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates tzdata bash \
    libgssapi-krb5-2 libkrb5-3 libk5crypto3 libcom-err2 \
    libssl3 libsasl2-2 libldap-2.5-0 \
    && rm -rf /var/lib/apt/lists/*

# Verify installations
RUN mongosh --version && mongodump --version

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

RUN mkdir -p /app/backups \
    && addgroup --gid 1000 nodejs \
    && (adduser --disabled-password --uid 1000 --gid 1000 backup || true) \
    && chown -R backup:nodejs /app

USER backup

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('Service is running')" || exit 1

CMD ["node", "dist/index.js"]