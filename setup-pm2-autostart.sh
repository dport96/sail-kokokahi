#!/usr/bin/env bash

# PM2 Auto-Startup Setup Script for Sail Kokokahi
# This script sets up PM2 to automatically start on system boot

set -euo pipefail

echo "=== PM2 Auto-Startup Setup for Sail Kokokahi ==="
echo ""

# Determine script directory (project root is assumed to be the script's directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Configurable variables
APP_NAME="sail-kokokahi"
: ${PORT:=3000} # default PORT=3000 but can be overridden in environment

# Resolve current user and home directory dynamically
CURRENT_USER="${SUDO_USER:-${USER:-$(whoami)}}"
CURRENT_HOME="${HOME:-$(getent passwd "$CURRENT_USER" | cut -d: -f6)}"
CURRENT_GROUP="$(id -gn "$CURRENT_USER")"

# Parse optional flags
CHOWN=false
APP_URL=""
while [ "$#" -gt 0 ]; do
    case "$1" in
        --chown)
            CHOWN=true
            shift
            ;;
        --url|--app-url)
            if [ -n "${2:-}" ]; then
                APP_URL="$2"
                shift 2
            else
                echo "Error: --url|--app-url requires a value" >&2
                exit 1
            fi
            ;;
        -h|--help)
            echo "Usage: $0 [--chown] [--url <app_url>]"
            echo "  --chown         Attempt to fix ~/.pm2 ownership (chown) before retrying 'pm2 save'"
            echo "  --url <app_url> Set the app URL (eg. http://example.com:3000) to pass as NEXT_PUBLIC_APP_URL and NEXTAUTH_URL"
            exit 0
            ;;
        *)
            # ignore unknown args
            shift
            ;;
    esac
done

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
        echo "PM2 is not installed. Installing PM2..."
        sudo npm install -g pm2
        echo "PM2 installed successfully!"
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Install dependencies and build the application
echo "Installing dependencies..."
npm install

echo "Building the application..."
if [ -n "${APP_URL}" ]; then
    echo "Building with NEXT_PUBLIC_APP_URL=$APP_URL and NEXTAUTH_URL=$APP_URL"
    NEXT_PUBLIC_APP_URL="$APP_URL" NEXTAUTH_URL="$APP_URL" npm run build
else
    npm run build
fi

# Helper to check port usage (tries lsof then ss then netstat)
is_port_in_use() {
    local port=$1
    if command -v lsof &> /dev/null; then
        lsof -i :"$port" -sTCP:LISTEN >/dev/null 2>&1 && return 0 || return 1
    elif command -v ss &> /dev/null; then
        ss -ltnp 2>/dev/null | grep -q ":$port " && return 0 || return 1
    else
        netstat -tuln 2>/dev/null | grep -q ":$port " && return 0 || return 1
    fi
}

echo "Checking if port $PORT is available..."
if is_port_in_use "$PORT"; then
    echo "⚠ Port $PORT is already in use. Finding processes using port $PORT:"
    if command -v lsof &> /dev/null; then
        lsof -i :"$PORT"
    else
        netstat -tuln | grep ":$PORT " || true
    fi
    echo ""
    echo "Attempting to find and stop conflicting processes..."

    # Try to find processes using the port
    if command -v lsof &> /dev/null; then
        PID=$(lsof -ti :"$PORT" 2>/dev/null || true)
    else
        PID=$(ss -ltnp 2>/dev/null | grep ":$PORT " | awk -F"pid=" '{print $2}' | awk -F"," '{print $1}' || true)
    fi

    if [ -n "${PID:-}" ]; then
        echo "Found process(es) using port $PORT: $PID"
        echo "Attempting to stop them..."
        kill -TERM $PID 2>/dev/null || true
        sleep 3
        # Force kill if still running
        kill -KILL $PID 2>/dev/null || true
        echo "Processes stopped."
    fi
fi

# Stop any existing PM2 processes for this app
echo "Stopping any existing PM2 processes..."
pm2 delete "$APP_NAME" 2>/dev/null || true

# Wait a moment for port to be released
sleep 2

# Verify port is now available
if is_port_in_use "$PORT"; then
    echo "✗ Port $PORT is still in use. You may need to:"
    echo "  1. Manually kill the process using port $PORT"
    echo "  2. Use a different port by setting PORT environment variable"
    echo "  3. Run: sudo lsof -i :$PORT to find what's using the port"
    exit 1
else
    echo "✓ Port $PORT is now available"
fi

# Start the application with PM2
echo "Starting application with PM2..."
if [ -n "${APP_URL}" ]; then
    echo "Starting with APP_URL=$APP_URL"
    export NEXT_PUBLIC_APP_URL="$APP_URL"
    export NEXTAUTH_URL="$APP_URL"
    pm2 start ecosystem.config.js --name "$APP_NAME" --update-env
else
    pm2 start ecosystem.config.js --name "$APP_NAME"
fi

# Save PM2 process list
echo "Saving PM2 process list..."
if pm2 save 2>/dev/null; then
    echo "pm2 save succeeded"
else
    echo "pm2 save failed due to permission or other issues"
    if [ "$CHOWN" = true ]; then
        echo "Attempting to chown $CURRENT_HOME/.pm2 to $CURRENT_USER:$CURRENT_GROUP"
        if sudo chown -R "$CURRENT_USER:$CURRENT_GROUP" "$CURRENT_HOME/.pm2"; then
            echo "Ownership changed, retrying 'pm2 save'..."
            if pm2 save 2>/dev/null; then
                echo "pm2 save succeeded after chown"
            else
                echo "pm2 save still failed after chown; attempting 'sudo pm2 save' as a last resort..."
                if sudo pm2 save; then
                    echo "pm2 save succeeded with sudo"
                else
                    echo "pm2 save failed even with sudo. Please inspect ~/.pm2 permissions manually." >&2
                fi
            fi
        else
            echo "Failed to change ownership of $CURRENT_HOME/.pm2. You may need to run the chown command manually." >&2
        fi
    else
        echo "Attempting 'sudo pm2 save' to work around permissions..."
        if sudo pm2 save; then
            echo "pm2 save succeeded with sudo"
        else
            echo "pm2 save failed even with sudo. To auto-fix permissions, re-run this script with the --chown flag or run: sudo chown -R $CURRENT_USER:$CURRENT_GROUP $CURRENT_HOME/.pm2" >&2
        fi
    fi
fi

# Generate startup script command for the current user/home
echo "Generating PM2 startup script..."

# Detect platform and generate appropriate pm2 startup command
OS_NAME="$(uname -s)"
PM2_STARTUP_CMD=""
if [ "$OS_NAME" = "Darwin" ]; then
    # macOS uses launchd
    PM2_STARTUP_CMD=$(pm2 startup launchd 2>&1 | grep "sudo" || true)
else
    # Assume linux/systemd
    PM2_STARTUP_CMD=$(pm2 startup systemd -u "$CURRENT_USER" --hp "$CURRENT_HOME" 2>&1 | grep "sudo env" || true)
fi

echo ""
echo "=== IMPORTANT: Manual Step May Be Required ==="
if [ -n "$PM2_STARTUP_CMD" ]; then
    echo "To complete the auto-startup setup, run the following command as shown below (it may require sudo):"
    echo ""
    echo "$PM2_STARTUP_CMD"
    echo ""
    echo "After running that command, your application will automatically start on system boot/login depending on your OS."
else
    echo "Could not automatically generate the exact startup command. Run 'pm2 startup' manually and follow the printed instructions."
fi

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
