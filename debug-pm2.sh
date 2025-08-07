#!/bin/bash

# PM2 Debug Script for Sail Kokokahi
# This script helps diagnose why PM2 processes are exiting

echo "=== PM2 Debug Information ==="
echo ""

# Check PM2 status
echo "Current PM2 processes:"
pm2 list

echo ""
echo "=== PM2 Logs (last 20 lines) ==="
pm2 logs --lines 20

echo ""
echo "=== System Information ==="
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PM2 version: $(pm2 --version)"

echo ""
echo "=== Environment Check ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "Current directory: $(pwd)"

echo ""
echo "=== Project Status ==="
if [ -f "package.json" ]; then
    echo "✓ package.json found"
else
    echo "✗ package.json NOT found"
fi

if [ -d "node_modules" ]; then
    echo "✓ node_modules directory exists"
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
echo "=== Manual Test ==="
echo "Try running manually: NODE_ENV=production npm start"
echo "Or try: NODE_ENV=production node_modules/.bin/next start"

echo ""
echo "=== PM2 Specific Logs ==="
echo "For detailed logs, run: pm2 logs sail-kokokahi"
echo "To monitor in real-time: pm2 monit"
