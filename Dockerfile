FROM node:lts as build
ARG TARGET_ENVIRONMENT="staging"
ARG BACKEND_FORMAT="ast"
WORKDIR /usr/src/app
RUN sh -c '[ -z "$http_proxy" ] || ( npm config set proxy $http_proxy; npm config set https-proxy $http_proxy )'
COPY package.json ./
RUN npm install
COPY ./vite.config.ts ./svelte.config.js ./
COPY ./src ./src
COPY ./static ./static

RUN VITE_TARGET_ENVIRONMENT=${TARGET_ENVIRONMENT} VITE_BACKEND_FORMAT=${BACKEND_FORMAT} npm run build

CMD ["npm", "run", "release"]
