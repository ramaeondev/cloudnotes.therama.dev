# =========================
# Stage 1: Build Angular app
# =========================
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build Angular app
COPY . .
RUN npm run build -- --configuration production

# =========================
# Stage 2: Serve with Nginx
# =========================
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular build output
COPY --from=build /app/dist/cloudnotes-angular.therama.dev /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose ports for Heroku
EXPOSE 80
EXPOSE 443

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
