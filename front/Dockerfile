FROM node:19

WORKDIR /usr/app/front

COPY . .

RUN npm i

RUN npm i -g serve

RUN npm run build

ENTRYPOINT [ "serve", "-s", "build" ]