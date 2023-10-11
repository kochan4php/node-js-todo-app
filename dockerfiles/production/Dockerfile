FROM node:lts-alpine as base

# Install dependencies and build
FROM base as builder
RUN apk add --no-cache libc6-compat
RUN npm i -g pnpm
WORKDIR /usr/src/app
COPY ../../package.json .
COPY ../../pnpm-lock.yaml .
COPY ../../. .
RUN pnpm i
RUN pnpm build

# Production image
FROM base as prod
ENV NODE_ENV=production
WORKDIR /usr/src/app
RUN npm i pm2 -g
COPY ../../package.json .
RUN npm pkg delete scripts.prepare
RUN npm i --omit=dev
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 8000
ENTRYPOINT [ "pm2-runtime" ]
CMD [ "dist/index.js" ]
