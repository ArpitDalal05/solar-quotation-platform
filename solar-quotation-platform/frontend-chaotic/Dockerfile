FROM node:20-alpine

WORKDIR /app

COPY package.json vite.config.ts tsconfig.json postcss.config.js tailwind.config.js index.html ./
COPY src ./src
COPY .env.example ./.env

RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

