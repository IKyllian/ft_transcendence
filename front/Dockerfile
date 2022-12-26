FROM node:19

WORKDIR /usr/app/front

COPY . .

RUN npm i

RUN npm run build

EXPOSE 80

ENTRYPOINT [ "npm", "start" ]