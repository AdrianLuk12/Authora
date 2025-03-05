# frontend/Dockerfile
FROM node:22.14.0-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy application code
COPY . .

# Build the Next.js app
RUN yarn build

# Expose port
EXPOSE 3000

# Run the app
CMD ["yarn", "start"]