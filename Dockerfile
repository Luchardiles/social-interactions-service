FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 50057

RUN npx prisma generate

CMD ["npm", "start"]
