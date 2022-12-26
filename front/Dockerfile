FROM node:19

WORKDIR /usr/app/front

COPY . .

RUN npm i

RUN npm run build

ENTRYPOINT [ "npm", "start" ]