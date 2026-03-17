#!/usr/bin/env bash
set -e

failed=0
for sketch in src/*.js; do
  name=$(basename "$sketch" .js)
  echo "Building $name..."
  if npx canvas-sketch "$sketch" --build --dir build 2>&1; then
    echo "  ✓ $name"
  else
    echo "  ✗ $name failed"
    failed=$((failed + 1))
  fi
  echo
done

if [ "$failed" -gt 0 ]; then
  echo "$failed sketch(es) failed to build."
  exit 1
else
  echo "All sketches built successfully."
fi
