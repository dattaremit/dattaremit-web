#!/bin/bash
set -uo pipefail

# Extract file path from the Claude Code tool input (passed via stdin as JSON)
FILE=$(python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null || echo "")

# Only process TypeScript/JavaScript source files
if [[ -z "$FILE" ]] || [[ ! "$FILE" =~ \.(ts|tsx|js|jsx|mts|mjs)$ ]]; then
  exit 0
fi

if [ ! -f "$FILE" ]; then
  exit 0
fi

FAIL=0

echo "--- [post-edit] Auto-fixing: $FILE ---"

# Step 1: Auto-fix — format + lint (best-effort, never block here)
npx prettier --write "$FILE" 2>/dev/null || true
npx eslint --fix "$FILE" 2>/dev/null || true

# Step 2: Block check — fail if unfixable lint errors remain
echo "--- ESLint check ---"
npx eslint "$FILE" || FAIL=1

if [ $FAIL -ne 0 ]; then
  echo ""
  echo "ESLint errors remain after auto-fix. Fix them before continuing."
fi

exit $FAIL
