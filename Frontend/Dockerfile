# Use Node.js image for React
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Serve the React app
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]

# Expose port for React
EXPOSE 3000
