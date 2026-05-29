#!/bin/bash
# Al-Malika Bakery - Permanent Server Startup
# This script ensures the server runs reliably

cd /home/z/my-project/.next/standalone

# Set environment
export NODE_ENV=production
export PORT=3000
export HOSTNAME="0.0.0.0"

echo "=========================================="
echo "  مخبز الملكة - Al-Malika Bakery"
echo "  Starting server on port 3000..."
echo "=========================================="

# Start the server
exec node server.js
