FROM node:24.12.0-alpine3.22

WORKDIR /app

COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci
RUN npm run build --workspace image-server

WORKDIR /app/apps/image-server

EXPOSE 3002

CMD ["node", "dist/server.js"]
