FROM node:19

WORKDIR /usr/app/front

COPY . .

RUN npm i

RUN npm i -g serve

ARG REACT_APP_BASE_URL
ARG REACT_APP_REDIRECT_URL
ARG REACT_APP_SOCKET_URL
ARG REACT_APP_API42_CLIENT_ID

RUN npm run build

ENTRYPOINT [ "serve", "-s", "build" ]