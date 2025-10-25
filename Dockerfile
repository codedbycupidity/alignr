FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY frontend/ ./frontend/
COPY index.html vite.config.ts tsconfig*.json tailwind.config.js postcss.config.js eslint.config.js ./
COPY public/ ./public/

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
