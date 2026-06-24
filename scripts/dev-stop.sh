#!/usr/bin/env bash
# @scaffold-config — scaffold infra/scripts/env. Change project name, domains, and env only. See SCAFFOLD.md

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
export PROJECT_ROOT

# shellcheck source=lib/env.sh
source "${SCRIPT_DIR}/lib/env.sh"
init_project_env

compose_dev_cmd down

echo "${POSTGRES_DB:-xxyyzz} dev environment stopped."
