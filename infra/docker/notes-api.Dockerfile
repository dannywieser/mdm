FROM node:24.12.0-alpine3.22 AS pruner

WORKDIR /app

RUN npm install -g turbo@2.9.16

COPY . .
RUN turbo prune notes-api --docker

FROM node:24.12.0-alpine3.22 AS installer

WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=pruner /app/out/full/ .
COPY tsconfig.base.json ./tsconfig.base.json
RUN npm run build --workspace notes-api
RUN npm prune --omit=dev

FROM node:24.12.0-alpine3.22 AS runner

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app
COPY --from=installer /app .

WORKDIR /app/apps/notes-api
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider "http://localhost:${PORT:-3000}/health" || exit 1

CMD ["node", "dist/server.js"]
