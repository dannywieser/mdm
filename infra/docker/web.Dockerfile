FROM node:24.12.0-alpine3.22 AS build

WORKDIR /app

COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci
RUN npm run build --workspace web

FROM nginx:1.29.3-alpine3.22

ARG CACHE_BUST=1
RUN echo "cache-bust: ${CACHE_BUST}" && apk update && apk upgrade --no-cache

COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider "http://localhost:80/health" || exit 1
