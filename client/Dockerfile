FROM node:alpine
FROM node:16.14.2-alpine AS node
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

CMD ["npm", "run", "dev"]