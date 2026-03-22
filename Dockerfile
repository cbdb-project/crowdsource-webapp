FROM node:12-slim

# Install build tools for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y python make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/cbdbapp

# Install dependencies first (cached unless package.json changes)
COPY package*.json ./
RUN npm install --production=false && npm cache clean --force
RUN npm install nohup -g

# Copy source code (only this layer rebuilds on code changes)
COPY . .
RUN node src/prep_tasks.js

EXPOSE 3000
EXPOSE 5000
ENTRYPOINT ["./run.sh"]
