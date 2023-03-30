ARG utility_prefix=ghcr.io/amrc-factoryplus/utilities
ARG utility_ver=v1.0.6

FROM ${utility_prefix}-build:${utility_ver} AS build

# Install the node application on the build container where we can
# compile the native modules.
RUN install -d -o node -g node /home/node/app
WORKDIR /home/node/app
USER node
COPY package*.json ./
RUN npm install --save=false
COPY . .
RUN npm run build

FROM ${utility_prefix}-run:${utility_ver}

# Copy across from the build container.
WORKDIR /home/node/app
COPY --from=build --chown=node:node /home/node/app ./

USER node

EXPOSE 3000

ENV NODE_ENV development

CMD ["npm", "run", "start"]
