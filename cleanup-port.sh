#!/bin/bash

# Port 3000 Cleanup Script for Sail Kokokahi
# This script helps resolve port 3000 conflicts

echo "=== Port 3000 Cleanup Script ==="
echo ""

# Check if port 3000 is in use
if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
    echo "Port 3000 is currently in use:"
    netstat -tuln | grep ":3000 "
    echo ""
    
    # Find processes using port 3000
    echo "Processes using port 3000:"
    lsof -i :3000 2>/dev/null || echo "No processes found with lsof"
    
    echo ""
    echo "Attempting to stop processes using port 3000..."
    
    # Get PIDs using port 3000
    PIDS=$(lsof -ti :3000 2>/dev/null)
    
    if [ ! -z "$PIDS" ]; then
        echo "Found PIDs: $PIDS"
        
        for PID in $PIDS; do
            echo "Stopping process $PID..."
            # Try graceful termination first
            kill -TERM $PID 2>/dev/null
        done
        
        # Wait a moment
        sleep 3
        
        # Force kill any remaining processes
        for PID in $PIDS; do
            if kill -0 $PID 2>/dev/null; then
                echo "Force killing process $PID..."
                kill -KILL $PID 2>/dev/null
            fi
        done
        
        echo "Cleanup complete."
    else
        echo "No processes found using port 3000"
    fi
    
else
    echo "✓ Port 3000 is available"
fi

echo ""
echo "=== PM2 Cleanup ==="
echo "Stopping all PM2 processes..."
pm2 delete all 2>/dev/null || true

echo ""
echo "=== Final Port Check ==="
if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
    echo "✗ Port 3000 is still in use. Manual intervention may be required."
    echo "Try running as root: sudo lsof -i :3000"
else
    echo "✓ Port 3000 is now available"
    echo "You can now start your application"
fi

echo ""
echo "=== Alternative Solutions ==="
echo "If port 3000 is still in use, you can:"
echo "1. Use a different port: PORT=3001 npm start"
echo "2. Reboot the system to clear all processes"
echo "3. Run as root: sudo ./cleanup-port.sh"
