FROM node:19

WORKDIR /usr/app/back

COPY . .

RUN npm i

RUN npm run build

EXPOSE 5000

ENTRYPOINT [ "npm", "start" ]