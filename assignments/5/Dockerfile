# Stage 1: Build Stage (Optional, but good practice for Node.js)
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
# We do this first to leverage Docker caching (if dependencies don't change, this layer is skipped)
COPY package*.json ./

# Install dependencies (Node uses 'npm install', not 'mvn package')
RUN npm install

# Stage 2: Production Stage (Smaller, cleaner image for running the app)
FROM node:18-alpine

WORKDIR /app

# Copy all files from the builder stage, including node_modules
# Since the app uses EJS, we need the views and app.js
COPY --from=builder /app .

# Expose the port your Express app listens on (e.g., 3000)
EXPOSE 3000

# Command to run your application (starts app.js)
CMD ["npm", "start"]
# OR CMD ["node", "app.js"] if your package.json doesn't have a start script