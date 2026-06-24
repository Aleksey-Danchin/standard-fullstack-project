#!/usr/bin/env bash

# Выбирает .env или .env.template, подгружает переменные и настраивает docker compose.
# Требует: PROJECT_ROOT
init_project_env() {
  if [[ -z "${PROJECT_ROOT:-}" ]]; then
    echo "Error: PROJECT_ROOT is not set." >&2
    exit 1
  fi

  if [[ -f "${PROJECT_ROOT}/.env" ]]; then
    ENV_FILE="${PROJECT_ROOT}/.env"
  elif [[ -f "${PROJECT_ROOT}/.env.template" ]]; then
    ENV_FILE="${PROJECT_ROOT}/.env.template"
    echo "Using ${ENV_FILE} (.env not found; copy to .env for local overrides)." >&2
  else
    echo "Error: neither .env nor .env.template found in ${PROJECT_ROOT}" >&2
    exit 1
  fi

  export ENV_FILE

  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
}

compose_dev_cmd() {
  docker compose --env-file "${ENV_FILE}" -f "${PROJECT_ROOT}/infra/compose/dev.yml" "$@"
}
