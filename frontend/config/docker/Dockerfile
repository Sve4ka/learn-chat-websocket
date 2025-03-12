# Stage 1: Build Stage
FROM node:alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Copy the rest source code and build the project
COPY . .

# Pass build-time variable for API URL and build the project
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

# Copy static assets to the build output
RUN cp -r public/* dist/

# Stage 2: Production Stage using Caddy
FROM caddy:latest
WORKDIR /usr/share/caddy

# Copy built files from builder stage
COPY --from=builder /app/dist .

# Copy the Caddy configuration file from the new location
COPY config/caddy/Caddyfile /etc/caddy/Caddyfile

EXPOSE 3000
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
