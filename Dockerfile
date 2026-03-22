FROM node:14

WORKDIR /usr/src/cbdbapp

# Install dependencies first (cached unless package.json changes)
COPY package*.json ./
RUN npm install && npm cache clean --force
RUN npm install nohup -g

# Copy source code (only this layer rebuilds on code changes)
COPY . .
RUN chmod +x run.sh
RUN node src/prep_tasks.js

EXPOSE 3000
EXPOSE 5000
ENTRYPOINT ["./run.sh"]
