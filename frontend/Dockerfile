FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# AU FUTUR POUR LA PRODUCTION lorsque je passe a cette etape 
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

expose 80

cmd ["nginx", "-g", "daemon off;"]