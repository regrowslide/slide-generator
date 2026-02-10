#!/bin/bash

# ポート3000と3001で動作しているプロセスをkillする

echo "🔍 Checking for processes on ports 3000 and 3001..."

# ポート3000のプロセスをkill
PORT_3000_PID=$(lsof -ti:3000)
if [ ! -z "$PORT_3000_PID" ]; then
  echo "⚠️  Killing process on port 3000 (PID: $PORT_3000_PID)"
  kill -9 $PORT_3000_PID
  echo "✅ Process on port 3000 killed"
else
  echo "✓ No process running on port 3000"
fi

# ポート3001のプロセスをkill
PORT_3001_PID=$(lsof -ti:3001)
if [ ! -z "$PORT_3001_PID" ]; then
  echo "⚠️  Killing process on port 3001 (PID: $PORT_3001_PID)"
  kill -9 $PORT_3001_PID
  echo "✅ Process on port 3001 killed"
else
  echo "✓ No process running on port 3001"
fi

echo "✨ Ports are now available"
