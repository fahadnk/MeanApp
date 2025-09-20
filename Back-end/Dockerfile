# Use the official lightweight Node.js 18 image (based on Alpine Linux)
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (for efficient Docker caching)
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the project files into the container
COPY . .

# Expose port 5000 to the host machine (must match PORT in .env)
EXPOSE 5000

# Default command to run when the container starts
CMD ["npm", "start"]
