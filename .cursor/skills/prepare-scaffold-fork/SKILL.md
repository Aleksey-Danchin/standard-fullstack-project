---
name: prepare-scaffold-fork
description: >-
  Interactive setup after GitHub Use this template: asks project name, adds
  template git remote, cleanup, renames xxyyzz, creates .env, optional first boot.
  Use after creating a repo from template, clone, first setup, настройка проекта,
  or /init-project.
disable-model-invocation: false
---

# Prepare product from template

Интерактивная подготовка **продуктового repo**, созданного через **GitHub → Use this template**.
Агент задаёт вопросы → выполняет изменения → предлагает первый запуск.

**Точка входа:** slash-команда `/init-project`.

**Не запускать** в репозитории каркаса (мейнтейнер `standard-fullstack-project`).

## Принципы

1. **Сначала спросить** — потом менять файлы (`AskQuestion` или уточняющие сообщения).
2. **Один блок вопросов за раз** — не перегружать.
3. **Показать план** — краткое резюме ответов перед выполнением.
4. **Коммит** — только если пользователь явно попросил.
5. После подготовки в продукте остаётся только `sync-scaffold-template`. Удаляются одноразовые артефакты (см. план).

## Workflow

```
Prepare progress:
- [ ] Step 0: Confirm product-from-template context
- [ ] Step 1: Interview (3 раунда вопросов)
- [ ] Step 2: Confirm plan with user
- [ ] Step 3: Run prepare-fork.sh
- [ ] Step 4: Optional mkcert / dev boot
- [ ] Step 5: Summary + next steps (sync-scaffold-template)
```

### Step 0: Контекст

Ожидаемый путь пользователя:

1. GitHub: **Use this template** → новый repository (`origin`).
2. `git clone` этого repo на хост.
3. `/init-project` в Cursor.

Проверь:

- Свежий продукт: есть `.dev/` или `xxyyzz` в `infra/compose/dev.yml`.
- Уже настроен: нет `.dev`, имя заменено — спроси про перенастройку.

Если это **repo каркаса** (не продукт из template) — остановись.

**Раунд 0 (если неясно):** «Repo создан через Use this template?» Если нет — объясни правильный старт (README) и предложи продолжить только если это всё равно копия каркаса.

### Step 1: Опрос (используй AskQuestion)

**Раунд 1 — идентичность проекта**

| Вопрос | Валидация |
|--------|-----------|
| Имя проекта (kebab-case) | `^[a-z][a-z0-9-]*$`, не `xxyyzz` |
| Dev-домен | По умолчанию `{имя}.localhost` — подтвердить |

**Раунд 2 — окружение**

| Вопрос | По умолчанию |
|--------|--------------|
| Production URL | Пропустить |
| URL repo каркаса на GitHub | По умолчанию `https://github.com/Aleksey-Danchin/standard-fullstack-project.git` (для org — спросить) |
| Добавить `git remote template` на каркас? | **Да** (нужно для sync) |
| Сгенерировать `SESSION_TOKEN_SECRET`? | Да (openssl) |

**Раунд 3 — первый запуск**

| Вопрос | Варианты |
|--------|----------|
| Запустить dev-окружение сейчас? | Да / Нет / Только после коммита |
| `mkcert -install` уже делали? | Да / Нет / Не знаю |
| Создать git commit `chore: prepare project <name>`? | Да / Нет |

Если пользователь дал данные в сообщении — не дублируй вопросы, только подтверди.

### Step 2: План

Покажи пользователю:

```markdown
## План подготовки

- Имя: **my-app** → домен **my-app.localhost**
- Удалить: `.dev/`, `.cursor/skills/align-scaffold-standard/`, `.cursor/skills/prepare-scaffold-fork/`, `.cursor/commands/init-project.md`
- Заменить: `xxyyzz` → `my-app` во всём проекте
- Создать: `.env` с секретами
- Remote `template` → URL каркаса (связь для обновлений; GitHub template этого не делает сам)
- Первый запуск: да/нет
```

Дождись явного «да» / «go» перед Step 3 (если пользователь уже просил «сделай всё» — считай согласием).

### Step 3: Выполнение

Dry-run (показать что изменится):

```bash
.cursor/skills/prepare-scaffold-fork/scripts/prepare-fork.sh \
  --dry-run \
  --project-name my-app
```

Применить:

```bash
.cursor/skills/prepare-scaffold-fork/scripts/prepare-fork.sh \
  --project-name my-app \
  --production-url 'https://example.com'    # если указан
```

Флаги: `--no-template-remote`, `--template-url <git-url>`, `--session-secret '<value>'`.

После скрипта проверь:

```bash
grep -r xxyyzz --exclude-dir=node_modules --exclude-dir=.git . | head -5 || echo "OK: no placeholder"
test -f .env && echo "OK: .env exists"
test ! -d .dev && echo "OK: .dev removed"
```

### Step 4: Первый запуск (если согласовано)

```bash
mkcert -install   # если нужно
./scripts/dev-start.sh
./scripts/prisma-migrate.sh init   # только если migrations/ пуста или пользователь просит
./scripts/prisma-seed.sh
```

Smoke: открыть `https://<project>.localhost`, login `root` / `123`.

При ошибках Docker/mkcert — объясни и предложи шаги, не пропускай молча.

### Step 5: Итог

```markdown
## Проект подготовлен

| Параметр | Значение |
|----------|----------|
| Имя | my-app |
| Dev | https://my-app.localhost |
| Template remote | template → github.com/.../standard-fullstack-project |

**Дальше:** разработка в `main` / feature-ветках.

**Обновления каркаса:** skill `sync-scaffold-template` → ветка `sync/template-v*`.

Документация: SCAFFOLD.md, UPGRADING.md
```

## Utility scripts

**scripts/prepare-fork.sh** — cleanup, rename, `.env`, template remote.

## Антипаттерны

- Не удалять `.git` без явного запроса
- Не коммитить `.env`
- Не править `apps/**/session/` под имя проекта — только replace placeholder
- Не оставлять одноразовые skills/commands в продукте — скрипт удаляет в конце

## См. также

- [reference.md](reference.md) — что меняется в файлах
- Skill `sync-scaffold-template` — обновления каркаса позже
