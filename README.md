# Standard Fullstack Project

**Каркас** (scaffold) fullstack-приложения: NestJS API, React SPA, Prisma/PostgreSQL, Docker + Traefik + HTTPS (mkcert).

Репозиторий: [github.com/Aleksey-Danchin/standard-fullstack-project](https://github.com/Aleksey-Danchin/standard-fullstack-project)

## Что это

| Термин | Значение |
|--------|----------|
| **Каркас / scaffold** | Стартовый monorepo: session, infra, dev-окружение |
| **Template repo** | Этот репозиторий на GitHub (источник для **Use this template**) |
| **Продукт** | Новый repo, созданный из template + ваш код |

Плейсхолдер имени в каркасе: **`xxyyzz`** (compose, БД, домен `xxyyzz.localhost`).

## Стек

| Слой | Технологии |
|------|------------|
| Backend | NestJS, TypeScript |
| Frontend | React, Vite, TanStack Router, TanStack Query, Tailwind, DaisyUI |
| БД | PostgreSQL 18, Prisma 7 |
| Инфра | Docker Compose, Traefik v3, Redis, mkcert |

## Структура

```
apps/backend/      NestJS (/api)
apps/frontend/     React (Vite)
apps/prisma/       схема, миграции, seed
infra/             compose, traefik, dockerfiles
scripts/           dev-start, prisma-*
.cursor/skills/    Cursor Agent skills (init, sync)
```

Зоны каркаса и маркеры `@scaffold-*` — [SCAFFOLD.md](SCAFFOLD.md).

## Начало работы

### Новый продукт (рекомендуется: GitHub Template)

1. **GitHub:** на странице каркаса → **Use this template** → Create a new repository  
   (можно несколько проектов с одного каркаса; fork на тот же аккаунт для этого не нужен).
2. **Локально:** `git clone` вашего нового repo.
3. **Cursor:** **`/init-project`** — интерактивная настройка (имя, `.env`, `git remote template`, первый запуск).
4. Разработка своих фич вне зон каркаса ([SCAFFOLD.md](SCAFFOLD.md)).
5. **Обновления каркаса:** skill `sync-scaffold-template` → ветка `sync/template-*` → PR в `main`.

GitHub после template **не связывает** repo с каркасом автоматически — remote `template` добавляет `/init-project` (или вручную).

### Мейнтейнер каркаса

1. Settings → **Template repository** — включить.
2. Релизы с тегами `v*`, `CHANGELOG.md`, `UPGRADING.md`.
3. Skills: `align-scaffold-standard`, `prepare-scaffold-fork`, `sync-scaffold-template`.

## Документация

| Файл | Описание |
|------|----------|
| [SCAFFOLD.md](SCAFFOLD.md) | Зоны A/B/C, маркеры, drift |
| [UPGRADING.md](UPGRADING.md) | Шаги при обновлении версии каркаса |
| [CHANGELOG.md](CHANGELOG.md) | История релизов каркаса |
| `.template-version` | Версия каркаса |

## Cursor

| Команда / skill | Когда |
|-----------------|-------|
| `/init-project` | Один раз после **Use this template** + clone |
| `sync-scaffold-template` | Подтянуть релиз каркаса (`v*`) |
| `align-scaffold-standard` | Только в repo каркаса (на продукте удаляется) |

## Требования

Docker, Docker Compose v2, [mkcert](https://github.com/FiloSottile/mkcert), openssl.

## Session API (кратко)

Cookie-сессии (Redis), префикс `/api/session`: `login`, `logout`, `check`, `refresh`, `list`.
