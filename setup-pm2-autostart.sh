#!/bin/bash

# PM2 Auto-Startup Setup Script for Sail Kokokahi
# This script sets up PM2 to automatically start on system boot

echo "=== PM2 Auto-Startup Setup for Sail Kokokahi ==="
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing PM2..."
    sudo npm install -g pm2
    echo "PM2 installed successfully!"
fi

# Change to project directory
cd /home/livingroom/Documents/GitHub/sail-kokokahi

# Create logs directory if it doesn't exist
mkdir -p logs

# Install dependencies and build the application
echo "Installing dependencies and building application..."
npm install
npm run build

# Start the application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 process list
echo "Saving PM2 process list..."
pm2 save

# Generate startup script
echo "Generating PM2 startup script..."
PM2_STARTUP_CMD=$(pm2 startup systemd -u livingroom --hp /home/livingroom 2>&1 | grep "sudo env")

echo ""
echo "=== IMPORTANT: Manual Step Required ==="
echo "To complete the auto-startup setup, run the following command:"
echo ""
echo "$PM2_STARTUP_CMD"
echo ""
echo "After running that command, your application will automatically start on system boot."
echo ""

# Display status
echo "=== Current PM2 Status ==="
pm2 list

echo ""
echo "=== Setup Complete ==="
echo "Your Sail Kokokahi application is now running with PM2!"
echo ""
echo "Useful commands:"
echo "  pm2 list          - Show all PM2 processes"
echo "  pm2 logs          - Show application logs"
echo "  pm2 restart all   - Restart the application"
echo "  pm2 stop all      - Stop the application"
echo "  pm2 delete all    - Remove the application from PM2"
