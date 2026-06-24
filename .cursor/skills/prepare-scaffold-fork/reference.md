# Prepare fork — справочник

## Что делает подготовка

| Шаг | Действие |
|-----|----------|
| Cleanup | `rm -rf .dev`, `rm -rf .cursor/skills/align-scaffold-standard` |
| Rename | `xxyyzz` → `{project}` (case-insensitive) в файлах проекта |
| `.env` | `cp .env.template .env`, новый `SESSION_TOKEN_SECRET`, опционально `PRODUCTION_URL` |
| Git | `git remote add template` (если выбрано) |

## Где встречается имя проекта

После rename обновляются (через replace `xxyyzz` в `apps/`, `infra/`, `scripts/`, `.env.template`; `.cursor/skills/` не трогаем):

- `infra/compose/dev.yml`, `test.yml` — compose project, сети
- `infra/traefik/` — сети, пути сертификатов `*.localhost.pem`
- `.env.template` / `.env` — `POSTGRES_DB`, `SESSION_COOKIE_DOMAIN`, `CLIENT_URL`
- `scripts/dev-*.sh` — сообщения и defaults

## Dev-домен

Формат: `{project-name}.localhost` (mkcert + Traefik).

Должен совпадать с:

- `SESSION_COOKIE_DOMAIN`
- `CLIENT_URL` / `RECOMMENDED_CLIENT_URL`
- сертификат в `mkcert -CAROOT/{POSTGRES_DB}/`

## Skills на fork после подготовки

| Оставить | Удалить |
|----------|---------|
| `prepare-scaffold-fork` | `align-scaffold-standard` |
| `sync-scaffold-template` | — |

`prepare-scaffold-fork` можно оставить для справки или удалить вручную — на усмотрение команды.

## Повторный запуск

Если `xxyyzz` уже заменён — скрипт rename пропустит совпадения. Повторная подготовка безопасна только на ранней стадии; иначе уточни у пользователя.
