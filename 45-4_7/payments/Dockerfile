FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g http-server

COPY --from=build /app/dist/payments/browser /app/dist

EXPOSE 4200

CMD ["http-server", "dist", "-p", "4200"]