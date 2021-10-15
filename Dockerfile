FROM node:16-alpine
WORKDIR /usr/src/app

# run application
ENV NPM_CONFIG_LOGLEVEL verbose
CMD ["sh", "-c", "npm install && npm run dev"]
