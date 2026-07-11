FROM node:24.12.0-alpine3.22 AS pruner

WORKDIR /app

RUN npm install -g turbo@2.9.16

COPY . .
RUN turbo prune flag-manager --docker

FROM node:24.12.0-alpine3.22 AS installer

WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=pruner /app/out/full/ .
COPY tsconfig.base.json ./tsconfig.base.json
RUN npm run build --workspace flag-manager
RUN npm prune --omit=dev

FROM node:24.12.0-alpine3.22 AS runner

ENV NODE_ENV=production
ENV PORT=3001

ARG CACHE_BUST=1
RUN echo "cache-bust: ${CACHE_BUST}" && apk update && apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
    /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

WORKDIR /app
COPY --from=installer /app .

WORKDIR /app/apps/flag-manager
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider "http://localhost:${PORT:-3001}/health" || exit 1

CMD ["node", "dist/server.js"]
