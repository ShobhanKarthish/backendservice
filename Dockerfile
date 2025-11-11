FROM node:18-alpine
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy backend directory
COPY backend ./backend

# Expose port
EXPOSE 3000

# Start the application - FIXED PATH
CMD [ "node", "backend/index.js" ]