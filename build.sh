#!/bin/bash

export USER_ID=$(id -u)
export GROUP_ID=$(id -g)

# Load variables from .env
set -a
source .env
set +a

echo "Building with USER_ID=${USER_ID} and GROUP_ID=${GROUP_ID}"
echo "Using BACKUP_DIR=${BACKUP_DIR}"

# Ensure backup dir exists and is writable
mkdir -p "$BACKUP_DIR"
sudo chown -R ${USER_ID}:${GROUP_ID} "$BACKUP_DIR"

docker compose build --no-cache
docker compose up -d

echo "Service started! Check logs with: docker-compose logs -f backup-service"