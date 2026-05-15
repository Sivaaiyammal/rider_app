FROM node:20-bookworm

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci && npm prune --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "--experimental-global-webcrypto", "main.js"]