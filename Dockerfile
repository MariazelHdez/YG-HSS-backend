FROM --platform=linux/amd64 oraclelinux:7-slim

RUN mkdir -p /home/node/app
RUN mkdir -p /home/node/web
RUN mkdir -p /opt/oracle/instantclient_21_9

COPY src/web/package*.json /home/node/web/
COPY src/api/package*.json /home/node/app/

ADD instantclient_21_9/* /opt/oracle/instantclient_21_9
RUN echo /opt/oracle/instantclient_21_9 > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig

RUN curl -sL https://rpm.nodesource.com/setup_16.x | bash -
RUN  yum -y install oracle-nodejs-release-el7 && \
    yum -y install nodejs && \
    rm -rf /var/cache/yum

RUN yum install -y libaio wget unzip

RUN wget https://download.oracle.com/otn_software/linux/instantclient/instantclient-basiclite-linuxx64.zip && \
    unzip instantclient-basiclite-linuxx64.zip && rm -f instantclient-basiclite-linuxx64.zip && \
    cd /opt/oracle/instantclient* && rm -f *jdbc* *occi* *mysql* *mql1* *ipc1* *jar uidrvci genezi adrci && \
    echo /opt/oracle/instantclient* > /etc/ld.so.conf.d/oracle-instantclient.conf && ldconfig

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