# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# Run Stage
FROM node:22-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/server.js"]