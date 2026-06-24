#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"
TEMPLATE_REPO="https://github.com/Aleksey-Danchin/standard-fullstack-project.git"
PLACEHOLDER="xxyyzz"

DRY_RUN=false
PROJECT_NAME=""
PRODUCTION_URL=""
ADD_TEMPLATE_REMOTE=true
SESSION_SECRET=""
TEMPLATE_URL=""
SKIP_BOOTSTRAP=false

usage() {
  cat <<'EOF'
Usage: prepare-fork.sh --project-name <name> [options]

Options:
  --project-name <name>   Имя проекта (kebab-case, a-z0-9-)
  --production-url <url>  Production URL (опционально)
  --session-secret <str>  SESSION_TOKEN_SECRET (иначе генерируется)
  --template-url <url>    URL git-репозитория каркаса (для remote template)
  --no-template-remote    Не добавлять git remote template
  --no-bootstrap          Не ставить зависимости, migrate и seed
  --dry-run               Показать действия без изменений
  -h, --help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-name) PROJECT_NAME="${2:?}"; shift 2 ;;
    --production-url) PRODUCTION_URL="${2:?}"; shift 2 ;;
    --session-secret) SESSION_SECRET="${2:?}"; shift 2 ;;
    --template-url) TEMPLATE_URL="${2:?}"; shift 2 ;;
    --no-template-remote) ADD_TEMPLATE_REMOTE=false; shift ;;
    --no-bootstrap) SKIP_BOOTSTRAP=true; shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "${PROJECT_NAME}" ]]; then
  echo "Error: --project-name is required." >&2
  usage
  exit 1
fi

if [[ ! "${PROJECT_NAME}" =~ ^[a-z][a-z0-9-]*$ ]]; then
  echo "Error: project name must be kebab-case (e.g. my-app)." >&2
  exit 1
fi

if [[ "${PROJECT_NAME}" == "${PLACEHOLDER}" ]]; then
  echo "Error: choose a name other than ${PLACEHOLDER}." >&2
  exit 1
fi

DEV_DOMAIN="${PROJECT_NAME}.localhost"
cd "${PROJECT_ROOT}"

run() {
  if [[ "${DRY_RUN}" == true ]]; then
    echo "[dry-run] $*"
  else
    "$@"
  fi
}

run_rm_rf() {
  local target="$1"
  if [[ "${DRY_RUN}" == true ]]; then
    echo "[dry-run] rm -rf ${target}"
  elif [[ -e "${target}" ]]; then
    rm -rf "${target}"
    echo "Removed ${target}"
  fi
}

echo "=== Prepare product from template ==="
echo "Project: ${PROJECT_NAME}"
echo "Dev domain: ${DEV_DOMAIN}"
[[ -n "${PRODUCTION_URL}" ]] && echo "Production: ${PRODUCTION_URL}"
echo ""

# 1. Cleanup scaffold-only artifacts
run_rm_rf ".dev"
run_rm_rf ".cursor/skills/align-scaffold-standard"

# 2. Rename placeholder in tracked project files
if [[ "${DRY_RUN}" == true ]]; then
  echo "[dry-run] find + sed: ${PLACEHOLDER} -> ${PROJECT_NAME}"
  grep -ril "${PLACEHOLDER}" . \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist \
    --exclude-dir=.cursor --exclude-dir=generated 2>/dev/null | head -20 || true
else
  mapfile -t MATCH_FILES < <(find . -type f \
    ! -path '*/.cursor/*' \
    ! -path '*/node_modules/*' \
    ! -path '*/.git/*' \
    ! -path '*/dist/*' \
    ! -path '*/apps/prisma/generated/*' \
    -exec grep -l -i "${PLACEHOLDER}" {} + 2>/dev/null || true)

  if [[ ${#MATCH_FILES[@]} -gt 0 ]]; then
    for f in "${MATCH_FILES[@]}"; do
      sed -i "s/${PLACEHOLDER}/${PROJECT_NAME}/gi" "${f}"
    done
    echo "Renamed ${PLACEHOLDER} -> ${PROJECT_NAME} in ${#MATCH_FILES[@]} file(s)."
  else
    echo "No ${PLACEHOLDER} occurrences found (already renamed?)."
  fi
fi

# 3. Create .env
if [[ "${DRY_RUN}" == true ]]; then
  echo "[dry-run] cp .env.template .env + secrets"
else
  if [[ ! -f .env.template ]]; then
    echo "Error: .env.template not found." >&2
    exit 1
  fi
  cp .env.template .env

  if [[ -z "${SESSION_SECRET}" ]]; then
    SESSION_SECRET="$(openssl rand -hex 32)"
  fi

  sed -i "s/^SESSION_TOKEN_SECRET=.*/SESSION_TOKEN_SECRET=${SESSION_SECRET}/" .env

  if [[ -n "${PRODUCTION_URL}" ]]; then
    if grep -q '^# PRODUCTION_URL=' .env; then
      sed -i "s|^# PRODUCTION_URL=.*|PRODUCTION_URL=${PRODUCTION_URL}|" .env
    elif grep -q '^PRODUCTION_URL=' .env; then
      sed -i "s|^PRODUCTION_URL=.*|PRODUCTION_URL=${PRODUCTION_URL}|" .env
    else
      echo "PRODUCTION_URL=${PRODUCTION_URL}" >> .env
    fi
  fi
  echo "Created .env (SESSION_TOKEN_SECRET set)."
fi

# 4. Template remote (связь с каркасом; GitHub Use this template не добавляет её сам)
if [[ "${ADD_TEMPLATE_REMOTE}" == true ]]; then
  REMOTE_URL="${TEMPLATE_URL:-${TEMPLATE_REPO}}"
  if git remote get-url template >/dev/null 2>&1; then
    echo "Remote template already exists."
  elif [[ "${DRY_RUN}" == true ]]; then
    echo "[dry-run] git remote add template ${REMOTE_URL}"
  else
    git remote add template "${REMOTE_URL}"
    echo "Added git remote template → ${REMOTE_URL}"
  fi
fi

# 5. Executable bits on scripts (git template often drops +x)
if [[ "${DRY_RUN}" == true ]]; then
  echo "[dry-run] chmod +x scripts/*.sh scripts/lib/*.sh"
else
  chmod +x scripts/*.sh scripts/lib/*.sh 2>/dev/null || true
  chmod +x "${SCRIPT_DIR}"/*.sh 2>/dev/null || true
  echo "Set executable bit on scripts"
fi

# 6. Bootstrap: npm ci, первая миграция create_user_model, seed
if [[ "${SKIP_BOOTSTRAP}" == false ]]; then
  export DRY_RUN
  "${SCRIPT_DIR}/bootstrap-dev.sh"
else
  echo "Skipped bootstrap (--no-bootstrap)."
fi

# 7. One-time Cursor artifacts (this script removes itself)
run_rm_rf ".cursor/skills/prepare-scaffold-fork"
if [[ "${DRY_RUN}" == true ]]; then
  echo "[dry-run] rm -f .cursor/commands/init-project.md"
elif [[ -f ".cursor/commands/init-project.md" ]]; then
  rm -f ".cursor/commands/init-project.md"
  echo "Removed .cursor/commands/init-project.md"
fi

echo ""
echo "=== Done ==="
echo "Next:"
echo "  mkcert -install   # if not done yet"
echo "  ./scripts/dev-start.sh"
echo "  https://${DEV_DOMAIN}"
