FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production
COPY index.js ./

EXPOSE 9000 9002
CMD ["node", "index.js"]
