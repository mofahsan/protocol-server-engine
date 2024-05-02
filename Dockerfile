FROM node:21
WORKDIR /app
COPY package.json .
COPY . . 
RUN npm install
EXPOSE 5500
CMD ["node","index"]

