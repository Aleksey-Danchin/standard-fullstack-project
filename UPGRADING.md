# Upgrading

Инструкции при обновлении каркаса в **продуктовом репозитории** (созданном через **Use this template**).

Первичная настройка — **`/init-project`** после clone (добавляет `git remote template`).

Перед merge прочитайте раздел для целевой версии. После merge обновите `.template-version`.

## Общий порядок

1. `git fetch template --tags`
2. `.cursor/skills/sync-scaffold-template/scripts/template-sync.sh --dry-run --ref vX.Y.Z`
3. Прочитать раздел ниже для `vX.Y.Z`
4. `.cursor/skills/sync-scaffold-template/scripts/template-sync.sh --ref vX.Y.Z`
5. Разрешить конфликты (см. `SCAFFOLD.md`, skill `sync-scaffold-template`)
6. `./scripts/dev-start.sh`, smoke-тесты
7. PR `sync/template-vX.Y.Z` → `main`

## 0.1.0 → Unreleased

Пока нет breaking changes после `v0.1.0`.

При sync с `main` проверьте:

- [ ] `UPGRADING.md` и `CHANGELOG.md` обновлены из каркаса
- [ ] `.env` — новые переменные из `.env.template`
- [ ] Prisma migrate, если менялась схема

## 0.1.0 (первый старт)

1. GitHub: **Use this template** → новый repository
2. `git clone` → Cursor: **`/init-project`**
3. Дальше — разработка; обновления — `sync-scaffold-template`
