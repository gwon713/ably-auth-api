#!/bin/bash

ENV=${1}
if [[ -z ${ENV} ]]; then
  echo 'Stop Docker Start Need To Environment!!!'
  exit;
fi

if ! [[ -d "env" ]]; then
  echo "Environment Folder Not Exist"
  echo "Environment Folder Make"
  mkdir env
fi


if ! [[ -f ./env/${ENV}.env  ]]; then
  echo "$ENV Environment File Not Exist"
  echo "$ENV Environment File Make"
  touch ./env/${ENV}.env
fi

sudo docker build -f Dockerfile.base -t ably-api-nestjs:base .
sudo docker build --build-arg NODE_ENV=${ENV} -f Dockerfile -t ably-api-nestjs:app .

sudo docker-compose --compatibility up -d
sudo docker-compose --compatibility logs -f