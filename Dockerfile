# =============================================================
# Stage 1 — deps: instala apenas as dependências de produção
# =============================================================
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

RUN pnpm install --frozen-lockfile --prod

# =============================================================
# Stage 2 — builder: compila a aplicação Next.js
# =============================================================
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copia todas as dependências (dev + prod) para o build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# Copia o restante do código
COPY . .

# Variáveis de build (valores placeholder — serão sobrescritas em runtime)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm build

# =============================================================
# Stage 3 — runner: imagem final mínima de produção
# =============================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copia artefatos do build standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public

# Copia as migrations e seeders para rodar dentro do container
COPY --from=builder --chown=nextjs:nodejs /app/lib/db/migrations ./lib/db/migrations
COPY --from=builder --chown=nextjs:nodejs /app/lib/db/seeders    ./lib/db/seeders
COPY --from=builder --chown=nextjs:nodejs /app/config            ./config
COPY --from=builder --chown=nextjs:nodejs /app/.sequelizerc      ./.sequelizerc

# Copia node_modules completo para as dependências nativas (sequelize, pg, etc.)
COPY --from=deps    --chown=nextjs:nodejs /app/node_modules      ./node_modules

# Entrypoint: aguarda o banco, roda migrations e inicia o servidor
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["./entrypoint.sh"]
