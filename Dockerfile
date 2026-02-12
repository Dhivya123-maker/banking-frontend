# Build stage
FROM node:20 AS build
WORKDIR /app

# Copy everything
COPY . .

# Install and build
RUN npm install
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=build /app/dist/bank-frontend/browser /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]