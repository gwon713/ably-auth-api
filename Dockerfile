FROM ably-api-nestjs:base as build

WORKDIR /app


COPY ./tsconfig.build.json .
COPY ./tsconfig.json .
COPY ./nest-cli.json .
COPY ./app ./app
COPY ./libs ./libs

RUN nest build common \
&& nest build database \
&& nest build app \
&& rm -rf apps libs

FROM ably-api-nestjs:base as app

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY ./env/${NODE_ENV}.env ./env/${NODE_ENV}.env
COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules