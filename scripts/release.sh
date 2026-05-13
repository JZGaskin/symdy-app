#!/usr/bin/env bash
# Symdy Release Script
# Usage: ./scripts/release.sh [version]
# Example: ./scripts/release.sh v0.2.0

set -euo pipefail

VERSION="${1:-v0.1.0}"

echo "==> Tagging release $VERSION"
cd "$(dirname "$0")/.."

# Ensure working tree is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: Working tree has uncommitted changes. Commit or stash first."
  exit 1
fi

# Create and push tag
git tag -a "$VERSION" -m "Symdy $VERSION"
git push origin "$VERSION"

echo ""
echo "==> Tag pushed! GitHub Actions will now build and release automatically."
echo "==> Check progress: https://github.com/JZGaskin/symdy-app/actions"
echo "==> Release will appear at: https://github.com/JZGaskin/symdy-app/releases"
