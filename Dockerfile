FROM node:16.2.0-alpine3.11 AS build_image
USER root
WORKDIR /usr/src/app
COPY .npmrc .npmrc
# COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build && npm prune --production

FROM fleetcorbr/node_oracle
USER root
# copy from build image
COPY --from=build_image /usr/src/app/dist ./dist
COPY --from=build_image /usr/src/app/node_modules ./node_modules
EXPOSE 8080
CMD ["node", "dist/main"]