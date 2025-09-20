# Use official Node.js 18 image (lightweight Alpine version)
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (for efficient caching)
COPY package*.json ./

# Install Angular CLI globally (so you can use ng commands inside container)
# Then install project dependencies
RUN npm install -g @angular/cli && npm install

# Copy the rest of the project files into the container
COPY . .

# Expose Angular default dev server port (4200)
EXPOSE 4200

# Default command: start the Angular app
CMD ["npm", "start"]
