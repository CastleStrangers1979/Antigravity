#!/bin/bash
# Al-Malika Bakery - Auto-restart Server Script
# This script keeps the server running by auto-restarting when it crashes

cd /home/z/my-project

LOG_FILE="/home/z/my-project/server.log"
PID_FILE="/home/z/my-project/server.pid"

start_server() {
    # Kill any existing processes
    pkill -f "next dev" 2>/dev/null
    sleep 2

    # Start fresh
    echo "[$(date)] Starting server..." >> "$LOG_FILE"
    bun --bun next dev -p 3000 >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    sleep 5

    # Verify it started
    if curl -s -o /dev/null http://127.0.0.1:3000/ 2>/dev/null; then
        echo "[$(date)] Server started successfully!" >> "$LOG_FILE"
        return 0
    else
        echo "[$(date)] Server failed to start!" >> "$LOG_FILE"
        return 1
    fi
}

# Main loop
while true; do
    start_server
    sleep 30
done
