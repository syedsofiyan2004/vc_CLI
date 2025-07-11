FROM node:20-slim
WORKDIR /home/app
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      git \
      python3 python3-pip \
      golang-go \
      wget ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && wget https://packages.microsoft.com/config/debian/$(. /etc/os-release && echo $VERSION_ID)/packages-microsoft-prod.deb \
 && dpkg -i packages-microsoft-prod.deb \
 && apt-get update \
 && apt-get install -y dotnet-sdk-6.0 \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --production

COPY main.sh cli.js script.js ./
COPY plugins/ ./plugins/
COPY builders/ ./builders/
RUN chmod +x main.sh cli.js
ENTRYPOINT ["./main.sh"]
