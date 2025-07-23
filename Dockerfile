# 1. Use Node base image
FROM node:22

# 2. Create app directory
WORKDIR /app

# 3. Install app dependencies
COPY package*.json ./
RUN npm install

# 4. Copy source code
COPY . .

# 5. Default command
CMD ["npx", "ts-node", "src/index.ts"]