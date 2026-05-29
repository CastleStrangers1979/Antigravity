#!/bin/bash
cd /home/z/my-project/.next/standalone
while true; do
    if ! pgrep -f "node server.js" > /dev/null; then
        echo "[$(date)] Starting server..." >> /home/z/my-project/keepalive.log
        node server.js >> /home/z/my-project/keepalive.log 2>&1 &
        sleep 5
    fi
    sleep 10
done
