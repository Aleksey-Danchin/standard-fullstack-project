## Старт продукта (GitHub Template)

1. **Use this template** на GitHub → новый repo (`origin`).
2. `git clone` → **`/init-project`**.
3. Скрипт добавляет **`git remote template`** — связь с repo каркаса для обновлений.

GitHub template **не создаёт** эту связь; без `template` remote skill `sync-scaffold-template` не работает.

## Bootstrap (один раз в prepare-fork)

`prepare-fork.sh` вызывает `bootstrap-dev.sh`:

1. `npm ci` в backend, frontend, prisma (контейнеры)
2. `prisma generate`
3. `postgres` + `redis`
4. `prisma migrate dev --name create_user_model` — первая миграция создаётся в продукте
5. `prisma db seed` — пользователь `root` / `123`

В template **нет** готовых migration SQL — только `schema` и `migration_lock.toml`.

Пропустить: `prepare-fork.sh --no-bootstrap`.

## Skills в продукте после `/init-project`

| Удаляется (одноразово) | Остаётся |
|------------------------|----------|
| `align-scaffold-standard` | `sync-scaffold-template` |
| `prepare-scaffold-fork` | |
| `/init-project` | |

Скрипт `prepare-fork.sh`: `chmod +x scripts/*.sh`, bootstrap, затем удаляет одноразовые артефакты.

После init: `./scripts/dev-start.sh` (без повторной установки зависимостей).

## Не fork

Для нескольких проектов с одного каркаса используйте **Use this template** каждый раз, не GitHub Fork (один fork на аккаунт на upstream).
