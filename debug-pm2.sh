#!/bin/bash

# PM2 Debug Script for Sail Kokokahi
# This script helps diagnose why PM2 processes are exiting

echo "=== PM2 Debug Information ==="
echo ""

# Check PM2 status
echo "Current PM2 processes:"
pm2 list

echo ""
echo "=== Recent PM2 Logs ==="
pm2 logs sail-kokokahi --lines 30

echo ""
echo "=== System Information ==="
echo "Operating System: $(lsb_release -d 2>/dev/null || uname -a)"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PM2 version: $(pm2 --version)"
echo "Node.js location: $(which node)"
echo "NPM location: $(which npm)"

echo ""
echo "=== Environment Check ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "PATH: $PATH"
echo "Current directory: $(pwd)"
echo "User: $(whoami)"
echo "User ID: $(id -u)"
echo "Group ID: $(id -g)"

echo ""
echo "=== Project Status ==="
if [ -f "package.json" ]; then
    echo "✓ package.json found"
else
    echo "✗ package.json NOT found"
fi

if [ -d "node_modules" ]; then
    echo "✓ node_modules directory exists"
    if [ -f "node_modules/.bin/next" ]; then
        echo "✓ Next.js binary found"
    else
        echo "✗ Next.js binary NOT found in node_modules/.bin/"
    fi
else
    echo "✗ node_modules directory NOT found - run 'npm install'"
fi

if [ -d ".next" ]; then
    echo "✓ .next build directory exists"
else
    echo "✗ .next build directory NOT found - run 'npm run build'"
fi

if [ -f ".env" ]; then
    echo "✓ .env file found"
else
    echo "✗ .env file NOT found"
fi

echo ""
echo "=== Port Check ==="
if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
    echo "⚠ Port 3000 is already in use"
    netstat -tuln | grep ":3000 "
else
    echo "✓ Port 3000 is available"
fi

echo ""
echo "=== Manual Tests ==="
echo "1. Test direct Next.js start:"
echo "   NODE_ENV=production ./node_modules/.bin/next start"
echo ""
echo "2. Test npm start:"
echo "   NODE_ENV=production npm start"
echo ""
echo "3. Test with specific port:"
echo "   NODE_ENV=production PORT=3000 npm start"

echo ""
echo "=== PM2 Troubleshooting ==="
echo "Try alternative config: pm2 start ecosystem.npm.config.js"
echo "For detailed logs: pm2 logs sail-kokokahi"
echo "To monitor: pm2 monit"
echo "To flush logs: pm2 flush"

echo ""
echo "=== Ubuntu Specific Checks ==="
if command -v systemctl >/dev/null 2>&1; then
    echo "SystemD available - check if PM2 startup is configured:"
    echo "Run: pm2 startup"
fi

# Check if running as root (which can cause issues)
if [ "$EUID" -eq 0 ]; then
    echo "⚠ WARNING: Running as root. Consider running as regular user."
fi
