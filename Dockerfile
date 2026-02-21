FROM node:22-alpine
WORKDIR /app

# 1. Copy package files first
COPY package*.json ./

# 2. Install dependencies (This is what downloads 'jose')
RUN npm install

# 3. Copy the rest of your code
COPY . .

# 4. Generate Prisma (Crucial for your prisma import to work)
RUN npx prisma generate

CMD ["npm", "run", "dev"]