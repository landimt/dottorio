#!/bin/bash

# Script para reiniciar automaticamente o servidor em caso de crash
# Útil para desenvolvimento local

echo "🚀 Iniciando dev server com auto-restart..."

while true; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$(date '+%H:%M:%S') - Starting Next.js dev server..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  yarn dev

  EXIT_CODE=$?

  if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Server stopped gracefully"
    break
  else
    echo "⚠️  Server crashed with exit code $EXIT_CODE"
    echo "🔄 Restarting in 3 seconds..."
    sleep 3
  fi
done

echo "👋 Dev server stopped"
