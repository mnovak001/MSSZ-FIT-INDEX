# Multi-stage build for Next.js application
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set dummy env vars for build (only needed for Prisma schema validation)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NEXTAUTH_SECRET="dummy-secret-for-build-only"

# Generate Prisma Client and build the application
RUN npm run build

# Production image - use full copy approach (not standalone)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy all necessary files for running Next.js
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/app ./app
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# Create uploads directory
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use next start instead of node server.js
CMD ["npm", "start"]

# Migrations image - includes full node_modules with Prisma CLI
FROM base AS migrations
WORKDIR /app

# Copy all dependencies including devDependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set dummy env vars
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Run migrations
CMD ["./node_modules/.bin/prisma", "migrate", "deploy"]