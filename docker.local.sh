#!/bin/bash

docker build -f Dockerfile.base -t ably-api-nestjs:base .

docker-compose --compatibility -f docker-compose.local.yml up -d
docker-compose --compatibility logs -f