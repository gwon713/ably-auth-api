#!/bin/bash

ENV=${1}
if [[ -z ${ENV} ]]; then
  echo 'Stop Docker Start Need To Environment!!!'
  exit;
fi

if [ ! -f ./env/${ENV}.env ]; then
  echo "$ENV Environment File Not Exist"
  echo "$ENV Environment File Make"
  touch ./env/${ENV}.env
fi

docker build -f Dockerfile.base -t ably-api-nestjs:base .
docker build --build-arg NODE_ENV=${ENV} -f Dockerfile -t ably-api-nestjs:app .

docker-compose --compatibility up -d
docker-compose --compatibility logs -f