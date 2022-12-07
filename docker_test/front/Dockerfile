FROM node:19
#FRONT

WORKDIR /tmp/front
COPY ./data .
COPY ./front_env.sh .

ARG  BASE_URL=$BASE_URL
ARG  SOCKET_URL=$SOCKET_URL
ARG  API42_CLIENT_ID=$API42_CLIENT_ID


RUN rm -f ./src/env.ts \
	&& sh front_env.sh \
	&& cp env.ts ./src/env.ts

RUN npm i

ENTRYPOINT ["npm", "start"]