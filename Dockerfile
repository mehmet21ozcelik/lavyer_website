# Stage 1: Install dependencies
FROM node:20-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build the app
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (needed before build)
RUN npx prisma generate

# Next.js telemetry disable
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js app
RUN npm run build

# Stage 3: Production server
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Disable Next.js telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED=1

# Add system user and group for security (Non-root user requirement)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Directory for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma schema so we can run migrations in the container if absolutely necessary
# But best practice is to run them via script or pipeline. 
# We include them here just in case migrations need to be invoked via:
# `docker exec -it <container> npx prisma migrate deploy`
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Prisma Engine is in node_modules, node_modules is inside standalone but we might need explicit copying
# if we plan to run npx prisma inside the container. Since the spec asks to support "npm run prisma:migrate:deploy"
COPY --from=deps /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]
