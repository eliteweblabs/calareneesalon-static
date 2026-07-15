FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.mjs ./
COPY public ./public

ENV HOST=0.0.0.0
EXPOSE 3000

CMD ["node", "server.mjs"]
