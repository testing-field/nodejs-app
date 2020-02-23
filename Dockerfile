FROM node:12-alpine

WORKDIR /data

ADD package.json package.json
ADD package-lock.json package-lock.json
RUN npm i

ADD spec spec
ADD index.js index.js

CMD ["npm", "start"]
