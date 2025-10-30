# Builder
FROM node:22 AS builder
WORKDIR /app

COPY package*.json .
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build


# Runner
FROM node:22 AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD [ "node", "dist/server.js" ]