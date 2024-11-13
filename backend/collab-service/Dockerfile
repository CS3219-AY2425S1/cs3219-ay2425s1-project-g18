FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5003

EXPOSE 5004

CMD ["npm", "run", "dev"]
