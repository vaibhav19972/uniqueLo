# ===================================================================
# Stage 1: Build Vite React application
# ===================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies with lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and public assets
COPY . .

# Build production bundle (TypeScript check + Vite bundle)
RUN npm run build

# ===================================================================
# Stage 2: Serve statically via Nginx Alpine
# ===================================================================
FROM nginx:alpine AS runner

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
