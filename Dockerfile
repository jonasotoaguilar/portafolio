# Production container for the static Astro portfolio.
#
# Build (fail-closed without SITE):
#   docker build --build-arg SITE=https://portafolio.jonasotoaguilar.space -t portafolio .
# Run:
#   docker run --rm -p 8080:8080 portafolio
#
# Stage 1 builds the static site with a frozen pnpm install. Stage 2 serves
# dist/ as non-root nginx on unprivileged port 8080. No secrets are consumed
# at build or runtime; SITE is public build-time config only.

FROM node:22.13.0-alpine@sha256:f2dc6eea95f787e25f173ba9904c9d0647ab2506178c7b5b7c5a3d02bc4af145 AS builder

WORKDIR /app

# Exact pnpm pin matching packageManager in package.json. corepack is
# avoided: its bundled keys in Node 22.13.0 cannot verify current pnpm
# signatures, while npm installs the exact pinned version over HTTPS.
RUN npm install -g pnpm@11.25.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

RUN pnpm install --frozen-lockfile

COPY . .

# SITE is required and explicit — no default. The release workflow bakes the
# production origin; local builds must pass --build-arg SITE=<origin>.
ARG SITE
RUN test -n "${SITE}" || (echo "error: SITE build argument is required" >&2 && exit 1)

ENV SITE=${SITE}

RUN pnpm run build && test -f dist/index.html

FROM nginxinc/nginx-unprivileged:1.29-alpine@sha256:0c79d56aee561a1d81c63f00eee5fb5fe29279560cdc55e91425133104c7fbe6

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

USER nginx

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:8080/ || exit 1
