FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/proxy/package*.json ./apps/proxy/
COPY packages/database/package*.json ./packages/database/
COPY packages/types/package*.json ./packages/types/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run db:generate --workspace=@claudewatch/database

# Build TypeScript
RUN npm run build

# Expose proxy port
EXPOSE 3001

# Start proxy server
CMD ["npm", "run", "start", "--workspace=@claudewatch/proxy"]
