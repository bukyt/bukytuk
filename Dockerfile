# Use official Node LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lockfile first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start production server
CMD ["npm", "run", "start"]