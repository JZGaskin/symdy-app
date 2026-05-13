#!/usr/bin/env bash
# deploy.sh — Deploy Symdy landing page to Surge.sh
# Usage: bash deploy.sh [subdomain]
#   Default: bash deploy.sh       → https://symdy-app.surge.sh
#   Custom:  bash deploy.sh myname → https://myname.surge.sh
#
# Prerequisites: Node.js installed (Surge runs via npx)
# First deploy will prompt for email/password to create a free account.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LANDING="$SCRIPT_DIR/index.html"
SUBDOMAIN="${1:-symdy-app}"

if [ ! -f "$LANDING" ]; then
  echo "❌ Landing page not found at $LANDING"
  exit 1
fi

# Prepare deploy directory
DEPLOY_DIR=$(mktemp -d)
cp "$LANDING" "$DEPLOY_DIR/index.html"

# Simple 404 redirect
cat << 'EOF' > "$DEPLOY_DIR/404.html"
<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0;url=/"><title>Symdy</title></head><body><script>location="/"</script></body></html>
EOF

echo ""
echo "🚀 Deploying Symdy landing page..."
echo "   Source: $LANDING"
echo "   Target: https://$SUBDOMAIN.surge.sh"
echo ""

npx surge --project "$DEPLOY_DIR" --domain "${SUBDOMAIN}.surge.sh"

echo ""
echo "✅ Done! Symdy is live at: https://$SUBDOMAIN.surge.sh"
echo ""
echo "📋 Reminders:"
echo "   1. Push the v0.1.0 tag to GitHub to trigger the release build"
echo "      → git push origin v0.1.0"
echo "   2. Update download links on the landing page after release is live"
echo "   3. Post to social channels with the URL"
echo ""
