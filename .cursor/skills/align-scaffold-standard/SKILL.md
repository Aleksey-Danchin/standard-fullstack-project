---
name: align-scaffold-standard
description: >-
  Aligns the template repository with scaffold (каркас) standards: audits zones,
  adds @scaffold-* markers, updates SCAFFOLD.md. For standard-fullstack-project
  maintainers only — product repos delete this skill on /init-project.
  Use when marking scaffold files or adding new scaffold modules to the template.
disable-model-invocation: false
---

# Align Scaffold Standard

**Только для репозитория каркаса.** В продукте из template удаляется при `/init-project`.

Приводит каркас к стандарту: маркеры в файлах, актуальный `SCAFFOLD.md`.

## Когда применять

| Ситуация | Действие |
|----------|----------|
| Новый файл в зоне A/B/C | Баннер + строка в `SCAFFOLD.md` |
| Рефакторинг зон каркаса | Аудит `scripts/scaffold-audit.sh` + правки |
| Пользователь просит «пометить каркасные файлы» | Полный проход (только в repo каркаса) |

## Workflow

```
Align progress:
- [ ] Step 1: Run `scripts/scaffold-audit.sh`
- [ ] Step 2: Classify repo (scaffold vs product from template)
- [ ] Step 3: Fix missing markers
- [ ] Step 4: Fix misplaced product code in scaffold zones
- [ ] Step 5: Update SCAFFOLD.md
- [ ] Step 6: Re-run audit and summarize
```

### Step 1: Audit

```bash
.cursor/skills/align-scaffold-standard/scripts/scaffold-audit.sh
```

Запомни: `MISSING`, `UNEXPECTED`, drift vs `template/main`.

### Step 2: Classify

- **Репозиторий template** (standard-fullstack-project): все пути из `SCAFFOLD.md` должны быть помечены.
- **Продукт из template**: не использовать этот skill — маркеры уже в каркасе

### Step 3: Add or fix markers

Используй **стабильный** текст из [SCAFFOLD.md](../../../SCAFFOLD.md) (раздел «Шаблоны баннеров»).

| Тип файла | Куда вставить |
|-----------|----------------|
| `.ts`, `.tsx` (A) | Первая строка файла, block comment |
| `.sh` | Сразу после shebang |
| `.yml`, `Dockerfile`, `.env.template` | Первая строка `# ...` |
| Integration (C) | `app.module.ts`, `main.ts`, `main.tsx` |

Не менять текст баннера без причины — это снижает merge-конфликты.

Проверка:

```bash
grep -rl '@scaffold-core' apps/backend/src/session apps/frontend/src/services
```

### Step 4: Misplaced code

Если в `apps/frontend/src/services/session/` лежит бизнес-логика:

1. Создать `apps/frontend/src/features/<name>/`
2. Перенести код, обновить imports
3. В scaffold оставить только вызов/hook из feature

Если продукт сильно изменил core-файл:

```bash
git fetch template
git diff template/main -- apps/frontend/src/services/session/sessionStore.ts
```

Предложить: `git checkout template/main -- <path>` + перенос кастомизаций в product.

### Step 5: Update SCAFFOLD.md

Добавить новые пути в секции A/B/C. Удалить устаревшие. Не дублировать README.

Если добавлен новый каталог core:

```markdown
## A — Core
...
apps/backend/src/new-scaffold-module/
```

### Step 6: Verify

```bash
.cursor/skills/align-scaffold-standard/scripts/scaffold-audit.sh
```

Отчёт пользователю:

```markdown
## Scaffold align summary

- **Missing markers fixed:** N files
- **Product code moved:** [paths or «нет»]
- **SCAFFOLD.md:** updated
- **Drift vs template:** [список или «не проверялось»]
- **Next:** template-sync / commit / PR
```

## Баннеры — копипаста

**A — core (TS/TSX):**

```ts
/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */
```

**B — config:**

```bash
# @scaffold-config — scaffold infra/scripts/env. Change project name, domains, and env only. See SCAFFOLD.md
```

**C — integration:**

```ts
/**
 * @scaffold-integration — scaffold wiring point.
 * Add your imports/providers; avoid rewriting scaffold core unless needed. See SCAFFOLD.md
 */
```

## Utility scripts

**scripts/scaffold-audit.sh** — проверка `@scaffold-*` маркеров и drift core-путей.

```bash
.cursor/skills/align-scaffold-standard/scripts/scaffold-audit.sh
```

## Связанные ресурсы

- Карта зон: [SCAFFOLD.md](../../../SCAFFOLD.md)
- Подтягивание template: skill `sync-scaffold-template`

## Антипаттерны

- Не помечать `package.json` и generated-файлы
- Не использовать термин `framework` в новых баннерах — только **scaffold** / каркас
- Не менять wording баннеров в каждом файле по-разному
