#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"

cd "${PROJECT_ROOT}"

CORE_PATHS=(
  "apps/backend/src/session"
  "apps/backend/src/prisma"
  "apps/frontend/src/services/session"
  "apps/frontend/src/services/api"
)

CONFIG_PATHS=(
  "infra"
  "scripts"
  ".env.template"
)

INTEGRATION_FILES=(
  "apps/backend/src/app.module.ts"
  "apps/backend/src/main.ts"
  "apps/frontend/src/main.tsx"
)

missing=0
extra=0

echo "=== Scaffold audit ==="
echo ""

echo "--- Core paths without @scaffold-core ---"
while IFS= read -r -d '' file; do
  if ! grep -q '@scaffold-core' "$file"; then
    echo "  MISSING: $file"
    missing=$((missing + 1))
  fi
done < <(find "${CORE_PATHS[@]}" -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 2>/dev/null)

echo ""
echo "--- Config paths without @scaffold-config ---"
while IFS= read -r -d '' file; do
  if ! grep -q '@scaffold-config' "$file"; then
    echo "  MISSING: $file"
    missing=$((missing + 1))
  fi
done < <(find "${CONFIG_PATHS[@]}" -type f \( -name '*.sh' -o -name '*.yml' -o -name 'Dockerfile.*' -o -name '.env.template' \) -print0 2>/dev/null)

echo ""
echo "--- Integration files without @scaffold-integration ---"
for file in "${INTEGRATION_FILES[@]}"; do
  if [[ -f "$file" ]] && ! grep -q '@scaffold-integration' "$file"; then
    echo "  MISSING: $file"
    missing=$((missing + 1))
  fi
done

echo ""
echo "--- Product paths with scaffold markers (unexpected) ---"
while IFS= read -r -d '' file; do
  if grep -qE '@scaffold-(core|config|integration)' "$file"; then
    echo "  UNEXPECTED: $file"
    extra=$((extra + 1))
  fi
done < <(find apps/backend/src/users apps/frontend/src/routes apps/frontend/src/features -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 2>/dev/null || true)

echo ""
if [[ -f .template-version ]]; then
  echo "Template version: $(tr -d '\n' < .template-version)"
fi

if git remote get-url template >/dev/null 2>&1; then
  git fetch template --quiet 2>/dev/null || true
  echo ""
  echo "--- Drift vs template (core paths) ---"
  git diff --name-only template/main -- apps/backend/src/session apps/frontend/src/services 2>/dev/null | sed 's/^/  /' || echo "  (unable to diff)"
fi

echo ""
if [[ "$missing" -eq 0 && "$extra" -eq 0 ]]; then
  echo "OK: all expected scaffold markers present."
  exit 0
fi

echo "Issues: $missing missing marker(s), $extra unexpected marker(s)."
echo "Run skill align-scaffold-standard or see SCAFFOLD.md"
exit 1
