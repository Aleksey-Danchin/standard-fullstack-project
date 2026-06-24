#!/usr/bin/env bash
# @scaffold-config — scaffold infra/scripts/env. Change project name, domains, and env only. See SCAFFOLD.md

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
export PROJECT_ROOT

# shellcheck source=lib/env.sh
source "${SCRIPT_DIR}/lib/env.sh"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker command is not available." >&2
  exit 1
fi

if ! command -v mkcert >/dev/null 2>&1; then
  echo "Error: mkcert command is not available." >&2
  exit 1
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "Error: openssl command is not available." >&2
  exit 1
fi

init_project_env

MKCERT_CAROOT="$(mkcert -CAROOT)"
CERT_DIR="${MKCERT_CAROOT}/${POSTGRES_DB:-xxyyzz}"
mkdir -p "${CERT_DIR}"

ensure_cert() {
  local domain="$1"
  local cert_file="${CERT_DIR}/${domain}.pem"
  local key_file="${CERT_DIR}/${domain}-key.pem"

  local generate_cert=0
  if [[ ! -f "${cert_file}" || ! -f "${key_file}" ]]; then
    generate_cert=1
  elif ! openssl x509 -checkend 86400 -noout -in "${cert_file}" >/dev/null 2>&1; then
    generate_cert=1
  fi

  if [[ "${generate_cert}" -eq 1 ]]; then
    mkcert -cert-file "${cert_file}" -key-file "${key_file}" "${domain}"
    echo "SSL certificate generated for ${domain}."
  else
    echo "SSL certificate is valid for ${domain}."
  fi
}

ensure_cert "${SESSION_COOKIE_DOMAIN:-xxyyzz.localhost}"

export MKCERT_CAROOT

compose_dev_cmd up -d --build postgres redis redis-commander backend frontend studio traefik
