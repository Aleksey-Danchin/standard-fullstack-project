# Upgrading

Инструкции при обновлении каркаса в **репозитории продукта** (fork).

Первичная настройка fork — skill **`prepare-scaffold-fork`**, не этот файл.

Перед merge прочитайте раздел для целевой версии. После merge обновите `.template-version`.

Автоматизация sync: skill `sync-scaffold-template`.

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

- [ ] `UPGRADING.md` и `CHANGELOG.md` в продукте обновлены из template
- [ ] `.env` — новые переменные из `.env.template`
- [ ] Prisma migrate, если менялась схема

## 0.1.0 (первая установка)

Используйте skill **`prepare-scaffold-fork`** (интерактивно) или:

```bash
.cursor/skills/prepare-scaffold-fork/scripts/prepare-fork.sh --project-name my-app
```
