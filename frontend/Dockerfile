FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Rebuild esbuild if needed for the architecture
# RUN npm rebuild esbuild

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
