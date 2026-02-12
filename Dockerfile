# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build -- --configuration production

# Runtime stage with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx files
RUN rm -rf ./*

# Copy built application
COPY --from=build /app/dist/bank-frontend/browser .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]