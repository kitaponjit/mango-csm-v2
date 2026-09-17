# Nuxt frontend (frontend/) as a static site served by nginx.
#
# The build context is the REPOSITORY ROOT, not frontend/: the legacy globals
# (jQuery, AdminLTE, xtools.js, ...) live in Website/Content and
# Website/Scripts/Others and are copied into public/vendor by
# scripts/sync-vendor.mjs. public/vendor is gitignored, so a fresh clone has no
# vendor assets unless the build makes them. What is sent is limited by
# Dockerfile.dockerignore next to this file.
#
#   docker compose up --build                                   (from the repo root)
#   docker build -f frontend/deploy/Dockerfile -t mango-csm-frontend .
#
# Frontend only. The .NET 8 backend (MangoServiceNetCore) is a separate
# repository and is not built or started here.

FROM node:24-alpine AS build
WORKDIR /repo/frontend

# mongodb-memory-server is a dev dependency used only by `npm run test:parity`.
# Its install hook downloads a ~100 MB mongod the image never uses.
ENV MONGOMS_DISABLE_POSTINSTALL=1

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY Website/Content ../Website/Content
COPY Website/Scripts/Others ../Website/Scripts/Others
COPY frontend ./
RUN npm run sync:vendor && npm run generate


FROM nginx:1.27-alpine AS runtime

COPY --from=build /repo/frontend/.output/public /usr/share/nginx/html

# The image's entrypoint renders /etc/nginx/templates/*.template into
# /etc/nginx/conf.d/ and runs /docker-entrypoint.d/*.sh before starting nginx.
COPY frontend/deploy/docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY frontend/deploy/docker/40-mango-config.sh /docker-entrypoint.d/40-mango-config.sh
# A Windows checkout gives the script CRLF endings, which /bin/sh rejects, and
# the entrypoint skips scripts that are not executable.
RUN sed -i 's/\r$//' /docker-entrypoint.d/40-mango-config.sh \
 && chmod 755 /docker-entrypoint.d/40-mango-config.sh

# Where nginx forwards /service/ (see default.conf.template). The default is the
# backend's dev port on the Docker host.
ENV API_UPSTREAM=http://host.docker.internal:5075
# Substitute only API_UPSTREAM; the template's own nginx $variables stay as-is.
ENV NGINX_ENVSUBST_FILTER=API_UPSTREAM
# Optional: rewrites window.dataServer in config.js at startup (see
# 40-mango-config.sh). Empty keeps config.js exactly as built.
ENV DATA_SERVER=

EXPOSE 80
