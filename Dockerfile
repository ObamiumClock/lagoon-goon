FROM node:lts-alpine

ENV NODE_ENV=production
ENV PORT=7860
WORKDIR /app

# Install build tools
RUN apk add --upgrade --no-cache python3 make g++

# Hugging Face needs port 7860
EXPOSE 7860

# Setup pnpm
RUN npm install --global corepack@latest
COPY package.json /app/package.json
COPY pnpm-lock.yaml /app/pnpm-lock.yaml
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install

COPY . /app

# Start the server
CMD ["node", "src/index.js"]
