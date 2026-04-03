FROM node:22-slim

RUN npm install -g pnpm@10

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml .npmrc package.json ./

COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json ./lib/db/
COPY lib/object-storage-web/package.json ./lib/object-storage-web/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/hd-rivic/package.json ./artifacts/hd-rivic/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @workspace/hd-rivic run build

RUN pnpm --filter @workspace/api-server run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
