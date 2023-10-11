FROM node:lts-alpine as base

# Install dependencies only
FROM base as deps
RUN apk add --no-cache libc6-compat
RUN npm i -g pnpm
WORKDIR /usr/src/app
COPY ../../package.json .
COPY ../../pnpm-lock.yaml .
RUN pnpm i --frozen-lockfile

# Development image
FROM deps as dev
ENV NODE_ENV=development
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY ../../. .
EXPOSE 8000
ENTRYPOINT [ "npm", "run" ]
CMD [ "dev" ]