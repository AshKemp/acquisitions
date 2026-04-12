FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS dev-deps
RUN npm ci

FROM base AS prod-deps
RUN npm ci --omit=dev

FROM dev-deps AS dev
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "start"]
