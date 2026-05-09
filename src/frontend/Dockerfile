FROM node:20-alpine AS development-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS production-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
ARG VITE_BACKEND_URL=""
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
WORKDIR /app
COPY . ./
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
COPY package.json package-lock.json ./
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
EXPOSE 3000
CMD ["npm", "run", "start"]