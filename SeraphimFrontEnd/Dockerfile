FROM node:10.15-alpine

WORKDIR /home
COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=0 /home/dist/app /usr/share/nginx/html
