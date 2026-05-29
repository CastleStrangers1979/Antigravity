#!/bin/bash
# Al-Malika Bakery - Quick Start Script
# Run this command whenever the server stops

cd /home/z/my-project
pkill -f "next" 2>/dev/null
sleep 2
bun --bun next dev -p 3000 &
sleep 5
echo "✅ الخادم يعمل الآن على http://localhost:3000"
echo "   تحقق من Preview Panel لرؤية التطبيق"
