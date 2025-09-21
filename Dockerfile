# Stage 1: Build Angular
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Stage 2: NGINX
FROM nginx:alpine
COPY --from=builder /app/dist/cloudnotes-angular.therama.dev /usr/share/nginx/html
# Use NGINX template to render ${PORT} at runtime (Heroku)
COPY conf.d/default.conf.template /etc/nginx/templates/default.conf.template

# Use dynamic port for Heroku
ENV PORT=8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
