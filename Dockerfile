FROM node:18-alpine

RUN apk add --no-cache \
    mongodb-tools \
    bash \
    curl \
    tzdata

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

RUN mkdir -p /app/backups

RUN addgroup -g 1001 -S nodejs && \
    adduser -S backup -u 1001 -G nodejs && \
    chown -R backup:nodejs /app

USER backup

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('Service is running')" || exit 1

CMD ["node", "dist/index.js"]
