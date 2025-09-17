# Build Angular
FROM node:20-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

EXPOSE 4200

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]

# Serve via NGINX
FROM nginx:alpine
COPY --from=builder usr/src/app/dist/cours_en_ligne_front/browser /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
