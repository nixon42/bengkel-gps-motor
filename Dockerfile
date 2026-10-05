# Multi-stage production container build for Bengkel Mobil GPS Motor Kediri
# Stage 1: Build Frontend Assets
FROM node:20-alpine AS builder

WORKDIR /app

# Install native dependencies required for build
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/bengkel.db
ENV UPLOAD_DIR=/app/uploads
ENV TZ=Asia/Jakarta
ENV NODE_OPTIONS="--max-old-space-size=512"

# Install tzdata (for Asia/Jakarta WIB timezone) and native build dependencies for better-sqlite3 compilation
RUN apk add --no-cache tzdata python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Remove compiler toolchain to maintain minimal image size (keeping tzdata intact)
RUN apk del python3 make g++

# Copy precompiled frontend assets from Stage 1
COPY --from=builder /app/dist ./dist

# Copy backend server code and operational scripts
COPY server ./server
COPY scripts ./scripts

# Ensure persistent storage volume mount points exist
RUN mkdir -p /app/data /app/uploads/receipts /app/uploads/ro /app/uploads/inventory

VOLUME ["/app/data", "/app/uploads"]

EXPOSE 3000

CMD ["node", "--max-old-space-size=512", "server/index.js"]
