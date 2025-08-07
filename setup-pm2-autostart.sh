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

# Check if port 3000 is already in use
echo "Checking if port 3000 is available..."
if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
    echo "⚠ Port 3000 is already in use. Finding processes using port 3000:"
    netstat -tuln | grep ":3000 "
    echo ""
    echo "Attempting to find and stop conflicting processes..."
    
    # Try to find processes using port 3000
    PID=$(lsof -ti :3000 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "Found process(es) using port 3000: $PID"
        echo "Attempting to stop them..."
        kill -TERM $PID 2>/dev/null
        sleep 3
        # Force kill if still running
        kill -KILL $PID 2>/dev/null
        echo "Processes stopped."
    fi
fi

# Stop any existing PM2 processes for this app
echo "Stopping any existing PM2 processes..."
pm2 delete sail-kokokahi 2>/dev/null || true

# Wait a moment for port to be released
sleep 2

# Verify port is now available
if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
    echo "✗ Port 3000 is still in use. You may need to:"
    echo "  1. Manually kill the process using port 3000"
    echo "  2. Use a different port by setting PORT environment variable"
    echo "  3. Run: sudo lsof -i :3000 to find what's using the port"
    exit 1
else
    echo "✓ Port 3000 is now available"
fi

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
