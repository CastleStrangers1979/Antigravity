#!/bin/bash
cd /home/z/my-project
pkill -f "next" 2>/dev/null
sleep 2
bun --bun next dev -p 3000 &
sleep 5
echo "✅ الخادم يعمل على http://localhost:3000"
