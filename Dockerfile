# Use the official Node.js image as a base
FROM node:24-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json yarn.lock ./

# Install dependencies
RUN corepack enable
RUN corepack yarn install

# Copy the rest of the application code
COPY . .

# Build the Svelte app
RUN corepack yarn run build
RUN ls

# Serve the app
FROM caddy:2-alpine

# Copy the built app from the previous stage
COPY --from=builder /app/dist /usr/share/caddy
COPY Caddyfile /usr/share/caddy/Caddyfile
RUN ls /usr/share/caddy

# Expose the port the app runs on
EXPOSE 3000

CMD ["caddy", "run", "--config", "/usr/share/caddy/Caddyfile", "--adapter", "caddyfile"]
