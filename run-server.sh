#!/bin/bash
# Al-Malika Bakery - Permanent Server Startup Script
# This script ensures the server stays running

cd /home/z/my-project

# Kill any existing processes
pkill -f "next" 2>/dev/null
sleep 2

# Start the production server
echo "Starting Al-Malika Bakery server..."
exec node .next/standalone/server.js 2>&1 || exec bun --bun next start 2>&1
