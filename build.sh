#!/bin/bash

export USER_ID=$(id -u)
export GROUP_ID=$(id -g)

echo "Building with USER_ID=${USER_ID} and GROUP_ID=${GROUP_ID}"

docker compose build --no-cache
docker compose up -d

echo "Service started! Check logs with: docker-compose logs -f backup-service"