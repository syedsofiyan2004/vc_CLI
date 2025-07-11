FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production
COPY index.js start.sh ./
RUN chmod +x start.sh

EXPOSE 8000
ENTRYPOINT ["./start.sh"]
