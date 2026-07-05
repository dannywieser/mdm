FROM node:24.12.0-alpine3.22

WORKDIR /app

COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci
RUN npm run build --workspace stats-service

WORKDIR /app/apps/stats-service

EXPOSE 3004

CMD ["node", "dist/server.js"]
