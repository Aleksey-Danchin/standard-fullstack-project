---
name: sync-scaffold-template
description: >-
  Syncs a product repo (created via GitHub Use this template) with the scaffold
  source. Requires git remote template. Creates sync branches, merges tagged
  releases, resolves scaffold zone conflicts. Use when updating scaffold,
  pulling template release, syncing каркас, or template-sync.
disable-model-invocation: false
---

# Sync Scaffold Template

Помогает **в продуктовом repo** подтянуть релиз каркаса. Нужен `git remote template` (добавляется при `/init-project`).

**Важно:** ветки `sync/template-*` создаются только в **репозитории продукта**, не в каркасе.

## Быстрая проверка контекста

Перед sync определи:

1. Это **продукт** (из template) или **repo каркаса**?
   - Каркас → sync не нужен; релизы и теги `v*`.
2. Есть ли remote `template`? (если нет — сначала `/init-project` или `git remote add template <url>`)
3. Текущая версия в `.template-version` (если файл есть).
4. Целевая версия: тег (`v0.2.0`) или `template/main`.

## Workflow для агента

Скопируй чеклист и отмечай прогресс:

```
Sync progress:
- [ ] Step 1: Verify remotes and clean working tree
- [ ] Step 2: Fetch template and review incoming changes
- [ ] Step 3: Create sync branch and merge
- [ ] Step 4: Resolve conflicts (see reference.md)
- [ ] Step 5: Apply UPGRADING.md steps for target version
- [ ] Step 6: Post-sync verification
- [ ] Step 7: Update .template-version and summarize for user
```

### Step 1: Verify remotes

```bash
git status
git remote -v
```

Если нет `template`:

```bash
git remote add template https://github.com/Aleksey-Danchin/standard-fullstack-project.git
```

`origin` — репозиторий продукта пользователя. Не пушить sync в `template`.

Рабочее дерево должно быть чистым. Если нет — закоммитить или stash.

### Step 2: Fetch and review

Предпочтительно использовать скрипт (из корня репозитория):

```bash
# from repository root
.cursor/skills/sync-scaffold-template/scripts/template-sync.sh --dry-run

.cursor/skills/sync-scaffold-template/scripts/template-sync.sh --dry-run --ref v0.2.0
```

Или вручную:

```bash
git fetch template --tags
git log --oneline HEAD..template/main
git log --oneline template/main..HEAD
```

Прочитай `UPGRADING.md` для целевой версии **до** merge.

### Step 3: Create sync branch and merge

```bash
.cursor/skills/sync-scaffold-template/scripts/template-sync.sh --ref v0.2.0

# или последний тег на template/main
.cursor/skills/sync-scaffold-template/scripts/template-sync.sh
```

Ручной вариант:

```bash
git checkout main
git pull origin main
git checkout -b sync/template-v0.2.0
git merge v0.2.0
```

Используй **merge**, не rebase всего `main` продукта на template.

### Step 4: Resolve conflicts

См. [reference.md](reference.md) — зоны каркас / продукт / точки слияния.

Правила по умолчанию:

| Путь | При конфликте |
|------|----------------|
| `apps/backend/src/session/` | версия template + минимальные правки продукта |
| `apps/frontend/src/services/session/`, `services/api/` | версия template |
| `infra/`, `scripts/` | логика template, **имя проекта** — из продукта |
| `apps/prisma/schema/` | объединить модели; миграции не переписывать |
| `app.module.ts`, `main.tsx`, routes | merge вручную |
| README, примеры (`users`, `~__tests__`) | продукт или template по смыслу |

После каждого блока конфликтов: `git add` → продолжить merge.

### Step 5: UPGRADING

Выполни шаги из `UPGRADING.md` для диапазона `.template-version` → целевой тег
(новые env в `.env`, зависимости, переименования).

### Step 6: Post-sync verification

```bash
./scripts/dev-start.sh
./scripts/prisma-migrate.sh   # если менялась Prisma
```

Smoke (минимум):

- `https://<project>.localhost` открывается
- login / logout (session)
- ключевые маршруты продукта

При ошибках — чинить в `sync/template-*`, не в `main` напрямую.

### Step 7: Finish

```bash
# обновить .template-version на целевой тег (без префикса v в файле — как в CHANGELOG)
git add .template-version
git commit -m "chore: sync template v0.2.0"

git push -u origin sync/template-v0.2.0
```

Предложи пользователю PR: `sync/template-v0.2.0` → `main`.

Краткий отчёт:

```markdown
## Template sync summary

- **From:** 0.1.0 → **To:** 0.2.0
- **Branch:** sync/template-v0.2.0
- **Conflicts resolved:** [список файлов или «нет»]
- **Manual steps from UPGRADING:** [список]
- **Verification:** [pass/fail]
- **Next:** открыть PR в main
```

## Selective sync (частичное обновление)

Если полный merge слишком рискованный:

```bash
git fetch template
git checkout -b sync/template-session-v0.2.0
git checkout template/v0.2.0 -- \
  apps/backend/src/session \
  apps/frontend/src/services/session \
  apps/frontend/src/services/api
```

Проверь `UPGRADING.md` — могут требоваться сопутствующие изменения в `package.json`, `.env.template`, `infra/`.

## Первая настройка (один раз)

**GitHub:** Use this template → clone → **`/init-project`**.

Скрипт добавляет `git remote template` и удаляет одноразовые skills. Без этого шага sync невозможен.

## Антипаттерны

- Не merge template в feature-ветки
- Не пушить в remote `template` из продукта
- Не удалять `.git` если планируется sync
- Не переписывать старые миграции Prisma

## Utility scripts

**scripts/template-sync.sh** — fetch template, dry-run, create `sync/template-*` branch, merge.

```bash
.cursor/skills/sync-scaffold-template/scripts/template-sync.sh --dry-run
.cursor/skills/sync-scaffold-template/scripts/template-sync.sh --ref v0.2.0
```

## Дополнительно

- Зоны и конфликты: [reference.md](reference.md)
- Карта зон каркаса: [SCAFFOLD.md](../../../SCAFFOLD.md)
- Версии каркаса: `CHANGELOG.md`, `UPGRADING.md`, `.template-version`
