# Stage 1: Build Angular app
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Angular app for production
RUN npm run build -- --configuration production

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Heroku listens on $PORT
ENV PORT 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
