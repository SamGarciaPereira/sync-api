# syntax=docker/dockerfile:1

# ---------- Build ----------
FROM node:24-bookworm-slim AS builder
WORKDIR /app

# openssl/ca-certificates são usados pelo Prisma
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Instala dependências primeiro (melhor cache)
COPY package.json package-lock.json ./
RUN npm ci

# Código e build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# "npm run build" = "prisma generate && next build" (saída em ./dist, distDir no next.config.ts)
RUN npm run build

# ---------- Runtime ----------
FROM node:24-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copia a aplicação já construída: node_modules, dist (build do Next),
# client Prisma gerado (src/generated/prisma), migrations e schema.
COPY --from=builder --chown=node:node /app ./

USER node
EXPOSE 3001

# API: aplica as migrations e sobe o Next.
# O serviço do worker sobrescreve este comando no docker-compose.prod.yml.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
