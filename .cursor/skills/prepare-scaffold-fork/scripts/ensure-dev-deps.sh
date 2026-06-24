#!/usr/bin/env bash
# @scaffold-config — scaffold infra/scripts/env. Change project name, domains, and env only. See SCAFFOLD.md

# Устанавливает npm-зависимости и Prisma client в контейнерах (bootstrap prepare-scaffold-fork).
# Требует: PROJECT_ROOT, compose_dev_cmd (из env.sh после init_project_env).

_deps_host_uid() {
  id -u
}

_deps_host_gid() {
  id -g
}

_deps_app_has_node_modules() {
  local app_dir="$1"
  local nm="${PROJECT_ROOT}/apps/${app_dir}/node_modules"
  [[ -d "${nm}" ]] && [[ -n "$(ls -A "${nm}" 2>/dev/null)" ]]
}

_deps_fix_ownership() {
  local app_dir="$1"
  local service="$2"
  local uid gid
  uid="$(_deps_host_uid)"
  gid="$(_deps_host_gid)"

  compose_dev_cmd run --rm --no-deps -w "/apps/${app_dir}" "${service}" \
    sh -lc "chown -R ${uid}:${gid} /apps/${app_dir}" >/dev/null 2>&1 || true
}

_deps_install_app() {
  local app_dir="$1"
  local service="$2"

  if _deps_app_has_node_modules "${app_dir}"; then
    return 0
  fi

  echo "Installing npm dependencies for apps/${app_dir}..."
  compose_dev_cmd run --rm --no-deps -w "/apps/${app_dir}" "${service}" npm ci
  _deps_fix_ownership "${app_dir}" "${service}"
}

_deps_prisma_client_ready() {
  [[ -f "${PROJECT_ROOT}/apps/prisma/generated/prisma/client.js" ]]
}

ensure_dev_dependencies() {
  echo "Ensuring dev dependencies (npm ci + prisma generate)..."
  compose_dev_cmd build backend frontend studio

  _deps_install_app backend backend
  _deps_install_app frontend frontend
  _deps_install_app prisma studio

  if ! _deps_prisma_client_ready; then
    echo "Generating Prisma client..."
    compose_dev_cmd run --rm --no-deps -w /apps/prisma studio npx prisma generate
    _deps_fix_ownership prisma studio
  fi

  echo "Dev dependencies ready."
}

ensure_prisma_workspace() {
  compose_dev_cmd build studio
  _deps_install_app prisma studio

  if ! _deps_prisma_client_ready; then
    echo "Generating Prisma client..."
    compose_dev_cmd run --rm --no-deps -w /apps/prisma studio npx prisma generate
    _deps_fix_ownership prisma studio
  fi
}
