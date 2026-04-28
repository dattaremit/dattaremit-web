#!/bin/bash
set -uo pipefail
FAIL=0

cd "$(dirname "$0")/../.." || exit 1

echo ""
echo "========================================="
echo "  Claude Code Quality Gate — dattaremit-web"
echo "========================================="

echo ""
echo "=== [1/6] Prettier format check ==="
npx prettier --check . --ignore-path .gitignore 2>&1 || FAIL=1

echo ""
echo "=== [2/6] ESLint ==="
npx eslint . 2>&1 || FAIL=1

echo ""
echo "=== [3/6] TypeScript type check ==="
npx tsc --noEmit 2>&1 || FAIL=1

echo ""
echo "=== [4/6] Security audit (high + critical only) ==="
npm audit --audit-level=high 2>&1 || FAIL=1

echo ""
echo "=== [5/6] Dead code — knip (warnings only, never blocks) ==="
npx knip 2>&1 || true

echo ""
echo "=== [6/6] Build verification (warnings only) ==="
npm run build 2>&1 | tail -20 || true

echo ""
if [ $FAIL -ne 0 ]; then
  echo "QUALITY GATE FAILED — fix errors above before pushing."
else
  echo "All quality checks passed."
fi

exit $FAIL
