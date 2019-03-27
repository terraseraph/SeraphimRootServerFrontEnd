# FROM node:10.15-alpine

# WORKDIR /home
# COPY . .
# RUN npm install
# RUN npm run build

# FROM nginx:alpine
# COPY --from=0 /home/dist/app /usr/share/nginx/html

FROM johnpapa/angular-cli as client-app
LABEL authors="John Papa"
WORKDIR /usr/src/app
COPY ["package.json", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent
COPY . .
ENV PORT 4201
EXPOSE 4201
# RUN ng build --prod
CMD ["npm", "start"]
