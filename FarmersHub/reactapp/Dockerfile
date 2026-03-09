# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Accept the API Base URL build argument and set it as an environment variable
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Accept the AniVet API Base URL
ARG REACT_APP_ANIVET_API_URL
ENV REACT_APP_ANIVET_API_URL=$REACT_APP_ANIVET_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create a custom Nginx config to handle React Router (SPA)
# This ensures that refreshing a page like /login doesn't give a 404
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]