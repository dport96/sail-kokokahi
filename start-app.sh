#!/bin/bash

# Sail Kokokahi Auto-Start Script
# This script ensures the application starts on boot and restarts if it crashes

# Set environment variables
export NODE_ENV=production
export PORT=3000

# Change to project directory
cd /home/livingroom/Documents/GitHub/sail-kokokahi

# Start or restart the application with PM2
/usr/local/bin/pm2 start ecosystem.config.js --update-env

# Save PM2 process list
/usr/local/bin/pm2 save

echo "Sail Kokokahi started successfully"