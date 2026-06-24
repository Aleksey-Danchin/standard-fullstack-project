# Каркас (scaffold) — зоны файлов

Это **не framework** в смысле NestJS/React — это **каркас** (scaffold): стартовый шаблон
репозитория, который форкают и наращивают своим кодом.

Терминология:

| Русский | В коде / файлах | Смысл |
|---------|-----------------|--------|
| каркас | **scaffold** | Общая инфраструктура и session/api, обновляемая из template |
| шаблон | **template** | Репозиторий `standard-fullstack-project` как источник |
| продукт | **product** | Ваш fork и бизнес-код |

Маркеры в исходниках:

| Маркер | Уровень | На fork |
|--------|---------|---------|
| `@scaffold-core` | **A — ядро** | Не редактировать. Расширять в своих модулях. |
| `@scaffold-config` | **B — конфиг** | Только имя проекта, домены, секреты, env. |
| `@scaffold-integration` | **C — wiring** | Добавлять imports/модули; не переписывать ядро. |

Skills Cursor:

- `prepare-scaffold-fork` — первичная настройка fork (интерактивно)
- `sync-scaffold-template` — подтянуть template (на fork)
- `align-scaffold-standard` — только в репозитории каркаса; на fork удаляется при prepare

## A — Core (`@scaffold-core`)

```
apps/backend/src/session/
apps/backend/src/prisma/
apps/frontend/src/services/session/
apps/frontend/src/services/api/
```

Session, API client, Prisma module, interceptors, store.

UI каркаса (`LoginForm`, `LogoutForm`, `SessionCheck`) — уровень A. Свой UI — в `features/` или обёртки.

## B — Config (`@scaffold-config`)

```
infra/compose/
infra/traefik/
infra/docker/
scripts/
.env.template
```

Допустимо: `xxyyzz` → имя проекта, домены, порты, секреты в `.env`.
Не менять логику compose/скриптов без необходимости.

## C — Integration (`@scaffold-integration`)

```
apps/backend/src/app.module.ts
apps/backend/src/main.ts
apps/frontend/src/main.tsx
```

Подключение своих модулей. Конфликты при sync — ожидаемы.

## Product (ваш код, без маркеров)

```
apps/backend/src/users/           # пример
apps/backend/src/<your-modules>/
apps/frontend/src/routes/
apps/frontend/src/features/
apps/prisma/schema/
```

## Не помечается

- `package.json`, lock-файлы
- `routeTree.gen.ts`, `apps/prisma/generated/`
- примеры: `~users/`, `~__tests__/`

## Шаблоны баннеров (для новых файлов каркаса)

**TypeScript / TSX (A):**

```ts
/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */
```

**Shell / YAML / Dockerfile / .env.template (B):**

```bash
# @scaffold-config — scaffold infra/scripts/env. Change project name, domains, and env only. See SCAFFOLD.md
```

**Integration (C):**

```ts
/**
 * @scaffold-integration — scaffold wiring point.
 * Add your imports/providers; avoid rewriting scaffold core unless needed. See SCAFFOLD.md
 */
```

## Проверка перед sync

```bash
.cursor/skills/align-scaffold-standard/scripts/scaffold-audit.sh
git fetch template
git diff --name-only template/main -- apps/backend/src/session apps/frontend/src/services
```

## Чеклист мейнтейнера каркаса

При добавлении файла в зоны A/B/C:

- [ ] Баннер с правильным `@scaffold-*`
- [ ] Путь добавлен в этот файл (`SCAFFOLD.md`)
- [ ] `CHANGELOG.md` при релизе
