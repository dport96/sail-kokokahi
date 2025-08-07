#!/bin/bash

# Sail Kokokahi Auto-Start Script
# This script ensures the application starts on boot and restarts if it crashes

# Set environment variables
export NODE_ENV=production
export PORT=3000

# Change to project directory
cd /home/livingroom/Documents/GitHub/sail-kokokahi

# Create logs directory if it doesn't exist
mkdir -p logs

# Build the application if .next directory doesn't exist or is older than package.json
if [ ! -d ".next" ] || [ "package.json" -nt ".next" ]; then
    echo "Building application..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "Build failed! Cannot start application."
        exit 1
    fi
fi

# Stop any existing PM2 processes for this app
/usr/local/bin/pm2 delete sail-kokokahi 2>/dev/null || true

# Start the application with PM2
echo "Starting application with PM2..."
/usr/local/bin/pm2 start ecosystem.config.js

# Save PM2 process list
/usr/local/bin/pm2 save

# Show PM2 status
echo "PM2 Status:"
/usr/local/bin/pm2 list

echo "Sail Kokokahi started successfully"