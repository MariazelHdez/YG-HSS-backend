FROM node:16-alpine3.15

# make the 'app' folder the current working directory
WORKDIR /usr/src/web

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# install project dependencies
RUN npm install -g @vue/cli
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

CMD ["npm", "run", "start:dev"]
EXPOSE 8080