#!/bin/bash
cd /home/z/my-project
if ! pgrep -f "next dev" > /dev/null; then
    bun --bun next dev -p 3000 > /dev/null 2>&1 &
fi
