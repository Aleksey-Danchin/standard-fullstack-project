#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"

TEMPLATE_REPO="https://github.com/Aleksey-Danchin/standard-fullstack-project.git"
DRY_RUN=false
DO_MERGE=true
REF=""

usage() {
  cat <<'EOF'
Usage: .cursor/skills/sync-scaffold-template/scripts/template-sync.sh [options]

Подтягивает изменения каркаса в репозиторий продукта (fork).
Создаёт ветку sync/template-<ref> и выполняет merge.

Options:
  --dry-run       Только fetch и показать, что изменится (без ветки и merge)
  --ref <ref>     Тег или ветка template (например v0.2.0 или main)
  --no-merge      Создать ветку sync/template-<ref>, но не делать merge
  -h, --help      Справка

Examples:
  .cursor/skills/sync-scaffold-template/scripts/template-sync.sh --dry-run
  .cursor/skills/sync-scaffold-template/scripts/template-sync.sh --ref v0.2.0
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; DO_MERGE=false; shift ;;
    --no-merge) DO_MERGE=false; shift ;;
    --ref) REF="${2:?--ref requires a value}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

cd "${PROJECT_ROOT}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not a git repository." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree is not clean. Commit or stash changes first." >&2
  exit 1
fi

TEMPLATE_REMOTE=""
for name in template upstream; do
  if git remote get-url "$name" >/dev/null 2>&1; then
    TEMPLATE_REMOTE="$name"
    break
  fi
done

if [[ -z "${TEMPLATE_REMOTE}" ]]; then
  echo "Remote 'template' not found. Adding: ${TEMPLATE_REPO}"
  git remote add template "${TEMPLATE_REPO}"
  TEMPLATE_REMOTE="template"
fi

echo "Using template remote: ${TEMPLATE_REMOTE} ($(git remote get-url "${TEMPLATE_REMOTE}"))"
git fetch "${TEMPLATE_REMOTE}" --tags

if [[ -z "${REF}" ]]; then
  REF="$(git tag -l 'v*' --sort=-v:refname | head -n1 || true)"
  if [[ -z "${REF}" ]]; then
    REF="main"
    REF_FULL="${TEMPLATE_REMOTE}/main"
  else
    REF_FULL="${REF}"
  fi
else
  if git rev-parse "${REF}" >/dev/null 2>&1; then
    REF_FULL="${REF}"
  elif git rev-parse "${TEMPLATE_REMOTE}/${REF}" >/dev/null 2>&1; then
    REF_FULL="${TEMPLATE_REMOTE}/${REF}"
  else
    echo "Error: ref '${REF}' not found locally or on ${TEMPLATE_REMOTE}." >&2
    exit 1
  fi
fi

CURRENT_BRANCH="$(git branch --show-current)"
echo ""
echo "Current branch: ${CURRENT_BRANCH}"
if [[ -f .template-version ]]; then
  echo "Installed template version: $(cat .template-version)"
fi
echo "Target ref: ${REF_FULL}"
echo ""

echo "=== Incoming commits (not in HEAD) ==="
git log --oneline HEAD.."${REF_FULL}" | head -n20 || true
INCOMING_COUNT="$(git rev-list --count HEAD.."${REF_FULL}" 2>/dev/null || echo 0)"
if [[ "${INCOMING_COUNT}" -gt 20 ]]; then
  echo "... and $((INCOMING_COUNT - 20)) more"
fi
echo ""

echo "=== Local-only commits (not in template ref) ==="
git log --oneline "${REF_FULL}"..HEAD | head -n20 || true
echo ""

echo "=== Changed files ==="
git diff --name-only HEAD.."${REF_FULL}" | head -n50 || true
FILE_COUNT="$(git diff --name-only HEAD.."${REF_FULL}" | wc -l)"
if [[ "${FILE_COUNT}" -gt 50 ]]; then
  echo "... and $((FILE_COUNT - 50)) more files"
fi
echo ""

if [[ "${DRY_RUN}" == true ]]; then
  echo "Dry run complete. No branch or merge created."
  echo "Next: read UPGRADING.md, then run without --dry-run"
  exit 0
fi

SAFE_REF="${REF//\//-}"
SYNC_BRANCH="sync/template-${SAFE_REF}"

if git show-ref --verify --quiet "refs/heads/${SYNC_BRANCH}"; then
  echo "Error: branch ${SYNC_BRANCH} already exists. Delete or use another --ref." >&2
  exit 1
fi

git checkout -b "${SYNC_BRANCH}"

if [[ "${DO_MERGE}" == true ]]; then
  echo "Merging ${REF_FULL} into ${SYNC_BRANCH}..."
  if ! git merge "${REF_FULL}" --no-edit; then
    echo ""
    echo "Merge conflicts. Resolve files, then:"
    echo "  git add <files>"
    echo "  git commit"
    echo "See SCAFFOLD.md and .cursor/skills/sync-scaffold-template/reference.md"
    exit 1
  fi
  echo "Merge completed without conflicts."
else
  echo "Branch ${SYNC_BRANCH} created. Run: git merge ${REF_FULL}"
fi

echo ""
echo "Next steps:"
echo "  1. Follow UPGRADING.md for version ${REF}"
echo "  2. ./scripts/dev-start.sh and smoke tests"
echo "  3. Update .template-version if needed"
echo "  4. git push -u origin ${SYNC_BRANCH}"
echo "  5. Open PR: ${SYNC_BRANCH} -> main"
