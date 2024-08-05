# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port your app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "dist/server.js"]