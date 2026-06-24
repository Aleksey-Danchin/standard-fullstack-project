# Standard Fullstack Project

**Каркас** (scaffold) fullstack-приложения: NestJS API, React SPA, Prisma/PostgreSQL, Docker + Traefik + HTTPS (mkcert).

Репозиторий: [github.com/Aleksey-Danchin/standard-fullstack-project](https://github.com/Aleksey-Danchin/standard-fullstack-project)

## Что это

| Термин | Значение |
|--------|----------|
| **Каркас / scaffold** | Стартовый monorepo: session, infra, dev-окружение |
| **Template** | Этот репозиторий как источник обновлений |
| **Fork / продукт** | Ваш проект на базе каркаса + свой код |

Плейсхолдер имени в шаблоне: **`xxyyzz`** (compose, БД, домен `xxyyzz.localhost`).

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
.cursor/skills/    Cursor Agent skills для fork и sync
```

Зоны каркаса и маркеры `@scaffold-*` — [SCAFFOLD.md](SCAFFOLD.md).

## Начало работы

### Продуктовый fork

1. Fork / clone репозитория.
2. В Cursor: **«настрой проект под меня»** или skill **`prepare-scaffold-fork`** — интерактивная подготовка (имя, `.env`, cleanup, template remote, опционально первый запуск).
3. Разработка своих фич вне зон каркаса ([SCAFFOLD.md](SCAFFOLD.md)).
4. Обновления каркаса: skill **`sync-scaffold-template`** → ветка `sync/template-*` → PR в `main`.

### Мейнтейнер каркаса

Работа в `main`, релизы с тегами `v*`, skills `align-scaffold-standard` + `prepare-scaffold-fork` / `sync-scaffold-template` для документации.

## Документация

| Файл | Описание |
|------|----------|
| [SCAFFOLD.md](SCAFFOLD.md) | Зоны A/B/C, маркеры, drift |
| [UPGRADING.md](UPGRADING.md) | Шаги при обновлении версии template |
| [CHANGELOG.md](CHANGELOG.md) | История релизов каркаса |
| `.template-version` | Текущая версия каркаса в repo |

## Cursor skills

| Skill | Кому | Назначение |
|-------|------|------------|
| `prepare-scaffold-fork` | Fork | Интерактивная первичная настройка |
| `sync-scaffold-template` | Fork | Подтянуть релиз template |
| `align-scaffold-standard` | Только каркас | Маркеры, аудит (на fork удаляется) |

## Требования

Docker, Docker Compose v2, [mkcert](https://github.com/FiloSottile/mkcert), openssl.

## Session API (кратко)

Cookie-сессии (Redis), префикс `/api/session`: `login`, `logout`, `check`, `refresh`, `list`.

Подробности — в коде `apps/backend/src/session/` и после подготовки fork на вашем dev-домене.
