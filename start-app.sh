#!/bin/bash

# Sail Kokokahi Auto-Start Script
# This script ensures the application starts on boot and restarts if it crashes

# Set environment variables
export NODE_ENV=production
export PORT=3000

# Change to project directory
#cd /home/livingroom/Documents/GitHub/sail-kokokahi

# Create logs directory if it doesn't exist
mkdir -p logs

# Ensure Node.js and npm are in PATH
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

# Check if Next.js binary exists
if [ ! -f "node_modules/.bin/next" ]; then
    echo "Next.js binary not found. Installing dependencies..."
    npm install
fi

# Build the application if .next directory doesn't exist or is older than package.json
if [ ! -d ".next" ] || [ "package.json" -nt ".next" ]; then
    echo "Building application..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "Build failed! Cannot start application."
        exit 1
    fi
fi

# Check for port conflicts
echo "Checking for port conflicts..."
if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
    echo "⚠ Port 3000 is already in use. Attempting to resolve..."
    
    # Find and stop processes using port 3000
    PID=$(lsof -ti :3000 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "Found process using port 3000: $PID"
        kill -TERM $PID 2>/dev/null
        sleep 2
        kill -KILL $PID 2>/dev/null || true
    fi
fi

# Stop any existing PM2 processes for this app
/usr/local/bin/pm2 delete sail-kokokahi 2>/dev/null || true

# Wait for port to be released
sleep 2

# Start the application with PM2
echo "Starting application with PM2..."
/usr/local/bin/pm2 start ecosystem.config.js

# Wait a moment and check if process is still running
sleep 5
if /usr/local/bin/pm2 list | grep -q "sail-kokokahi.*online"; then
    echo "✓ PM2 process is running successfully"
else
    echo "✗ PM2 process failed to start or exited"
    echo "Checking logs..."
    /usr/local/bin/pm2 logs sail-kokokahi --lines 20
    exit 1
fi

# Save PM2 process list
/usr/local/bin/pm2 save

# Show PM2 status
echo "PM2 Status:"
/usr/local/bin/pm2 list

echo "Sail Kokokahi started successfully"