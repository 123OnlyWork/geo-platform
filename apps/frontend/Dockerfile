FROM node:20-alpine AS builder
WORKDIR /app

# Dependencies
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# Build-time env (Next.js requires this for public API)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Optional: ускорение сборки
ENV NEXT_TELEMETRY_DISABLED=1

# Source
COPY . .

# Build Next.js app
RUN npm run build

# Remove dev dependencies
RUN npm prune --production


# -------------------------
# RUNTIME STAGE
# -------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only runtime artifacts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

EXPOSE 3000

CMD ["npm", "run", "start"]