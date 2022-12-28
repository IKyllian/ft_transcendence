FROM node:19

WORKDIR /usr/app/back

COPY . .

RUN npm i

RUN npm run build

ENTRYPOINT [ "npm", "run", "start:prod" ]