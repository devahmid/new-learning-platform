# ---- BUILD STAGE ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ---- PROD STAGE ----
FROM node:20-slim AS prod

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

# Ajoute le .env si besoin
# COPY .env ./

CMD ["node", "dist/main"]

EXPOSE 3000
