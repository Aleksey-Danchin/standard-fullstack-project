#!/usr/bin/env bash
# Одноразовый bootstrap после init: npm ci, первая миграция, seed.
# Вызывается из prepare-fork.sh (skill prepare-scaffold-fork).

set -euo pipefail

PREPARE_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${PREPARE_SCRIPT_DIR}/../../../.." && pwd)"
export PROJECT_ROOT
export SCRIPT_DIR="${PROJECT_ROOT}/scripts"

INITIAL_MIGRATION_NAME="${INITIAL_MIGRATION_NAME:-create_user_model}"
DRY_RUN="${DRY_RUN:-false}"

# shellcheck source=../../../../scripts/lib/env.sh
source "${SCRIPT_DIR}/lib/env.sh"
# shellcheck source=ensure-dev-deps.sh
source "${PREPARE_SCRIPT_DIR}/ensure-dev-deps.sh"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker command is not available." >&2
  exit 1
fi

init_project_env

HOST_UID="$(id -u)"
HOST_GID="$(id -g)"

fix_prisma_ownership() {
  if [[ "${DRY_RUN}" == true ]]; then
    echo "[dry-run] chown -R ${HOST_UID}:${HOST_GID} apps/prisma"
    return 0
  fi
  compose_dev_cmd run --rm --no-deps studio sh -lc \
    "chown -R ${HOST_UID}:${HOST_GID} /apps/prisma" >/dev/null 2>&1 || true
}

run_bootstrap() {
  if [[ "${DRY_RUN}" == true ]]; then
    echo "[dry-run] ensure_dev_dependencies"
    echo "[dry-run] compose up -d --wait postgres redis"
    echo "[dry-run] prisma migrate dev --name ${INITIAL_MIGRATION_NAME}"
    echo "[dry-run] prisma db seed"
    return 0
  fi

  ensure_dev_dependencies

  echo "Starting postgres and redis..."
  compose_dev_cmd up -d --wait postgres redis

  echo "Applying initial migration (${INITIAL_MIGRATION_NAME})..."
  compose_dev_cmd run --rm studio npx prisma migrate dev --name "${INITIAL_MIGRATION_NAME}"
  compose_dev_cmd run --rm --no-deps studio npx prisma generate

  echo "Seeding database..."
  compose_dev_cmd run --rm studio npx prisma db seed

  fix_prisma_ownership
  echo "Bootstrap complete."
}

echo "=== Bootstrap dev environment ==="
run_bootstrap
