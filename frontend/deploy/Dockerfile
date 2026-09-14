FROM node:22-alpine AS build
WORKDIR /src

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run generate

FROM nginx:1.27-alpine AS runtime
COPY --from=build /src/.output/public /usr/share/nginx/html
COPY deploy/linux/nginx.conf /etc/nginx/conf.d/default.conf

# config.js is mounted or overwritten per environment; it is not baked in.
EXPOSE 80
