#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
export PROJECT_ROOT

# shellcheck source=lib/env.sh
source "${SCRIPT_DIR}/lib/env.sh"
init_project_env

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker command is not available." >&2
  exit 1
fi

HOST_UID="$(id -u)"
HOST_GID="$(id -g)"
STUDIO_WAS_RUNNING=0
STUDIO_STARTED_BY_SCRIPT=0

if [[ -n "$(compose_dev_cmd ps --status running -q studio)" ]]; then
  STUDIO_WAS_RUNNING=1
fi

if [[ "${STUDIO_WAS_RUNNING}" -eq 0 ]]; then
  compose_dev_cmd up -d studio
  STUDIO_STARTED_BY_SCRIPT=1
fi

cleanup() {
  local exit_code=$?
  set +e

  if [[ -n "$(compose_dev_cmd ps --status running -q studio)" ]]; then
    compose_dev_cmd exec -T studio sh -lc "chown -R ${HOST_UID}:${HOST_GID} /apps/prisma"
  else
    compose_dev_cmd run --rm --no-deps studio sh -lc "chown -R ${HOST_UID}:${HOST_GID} /apps/prisma"
  fi

  if [[ "${STUDIO_WAS_RUNNING}" -eq 1 ]]; then
    compose_dev_cmd restart studio
  elif [[ "${STUDIO_STARTED_BY_SCRIPT}" -eq 1 ]]; then
    compose_dev_cmd stop studio
  fi

  exit "${exit_code}"
}

trap cleanup EXIT

compose_dev_cmd exec -T studio npx prisma migrate reset --force
compose_dev_cmd exec -T studio npx prisma generate
compose_dev_cmd exec -T studio npx prisma db seed
