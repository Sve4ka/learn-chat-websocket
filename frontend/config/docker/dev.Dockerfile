FROM node:alpine
WORKDIR /app

# Copy package files and install dependencies for development
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --shamefully-hoist

COPY . .

EXPOSE 5173
CMD ["pnpm", "dev", "--host"]
