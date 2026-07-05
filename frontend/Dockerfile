# Stage 1: Build the React application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
# Render will inject build-time environment variables (e.g., VITE_API_URL) here
ARG VITE_API_URL
ARG VITE_AI_API_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AI_API_URL=$VITE_AI_API_URL
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the build output to Nginx's default public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the Nginx configuration template
# The official nginx alpine image will automatically run envsubst on files in this directory
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Default port, can be overridden by Render
ENV PORT=80

# Expose the port
EXPOSE ${PORT}

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
