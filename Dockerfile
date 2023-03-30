FROM oraclelinux:9-slim

RUN mkdir -p /home/node/app
RUN mkdir -p /home/node/web

COPY src/web/package*.json /home/node/web/
COPY src/api/package*.json /home/node/app/


RUN curl -sL https://rpm.nodesource.com/setup_16.x | bash -
RUN microdnf install -y nodejs

# USER node

WORKDIR /home/node/app
RUN npm install && npm cache clean --force --loglevel=error
COPY src/api/.env* ./

WORKDIR /home/node/web

RUN npm install && npm cache clean --force --loglevel=error
COPY src/api /home/node/app/
COPY src/web /home/node/web/

RUN npm run build:docker

EXPOSE 3000

WORKDIR /home/node/app

ENV NODE_ENV=production
RUN npm run build:api
CMD [ "node", "./dist/index.js" ]