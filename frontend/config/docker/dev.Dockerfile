FROM node:alpine
WORKDIR /app

# Copy package files and install dependencies for development
COPY package.json ./
RUN npm install

COPY . .

EXPOSE 5173
CMD ["npm", "dev", "--host"]
