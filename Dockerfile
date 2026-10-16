FROM node:24-alpine AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.4.2 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --registry=https://registry.npmjs.org

COPY . .
ARG VITE_API_BASE_URL=https://api.lpalette.cn/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN pnpm run build

FROM nginx:alpine

LABEL org.opencontainers.image.source="https://github.com/Life-Palette/LifePalette-Web"

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 9531
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:9531/ || exit 1
