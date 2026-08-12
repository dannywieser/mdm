FROM node:24.12.0-alpine3.22 AS pruner

WORKDIR /app

RUN npm install -g turbo@2.9.16

COPY . .
RUN turbo prune web --docker

FROM node:24.12.0-alpine3.22 AS build

WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=pruner /app/out/full/ .
COPY tsconfig.base.json ./tsconfig.base.json
RUN npm run build --workspace web

FROM nginx:1.29.3-alpine3.22

ARG CACHE_BUST=1
RUN echo "cache-bust: ${CACHE_BUST}" && apk update && apk upgrade --no-cache

COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider "http://127.0.0.1:80/health" || exit 1
