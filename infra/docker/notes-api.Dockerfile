FROM node:24.12.0-alpine3.22

WORKDIR /app

COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci
RUN npm run build --workspace notes-api

WORKDIR /app/apps/notes-api

EXPOSE 3000

CMD ["node", "dist/server.js"]
