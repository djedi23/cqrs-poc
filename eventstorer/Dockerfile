FROM node:7.8.0

RUN yarn global add node-gyp wait-on
WORKDIR /opt
ADD package.json yarn.lock ./
RUN yarn --no-progress

ADD webpack.config.js .
ADD src src
RUN node_modules/.bin/webpack --progress --colors

CMD wait-on -l tcp:${BUS_HOST}:5672 tcp:${MONGO_HOST}:27017 && node ./build/
