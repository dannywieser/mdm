FROM node:24.12.0-alpine3.22

WORKDIR /app

COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci
RUN npm run build --workspace flag-manager

WORKDIR /app/apps/flag-manager

EXPOSE 3001

CMD ["node", "dist/server.js"]
