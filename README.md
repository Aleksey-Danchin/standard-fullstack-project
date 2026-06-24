# Standard Fullstack Project

Шаблон (каркас) fullstack веб-приложения: backend на NestJS, frontend на React, общая схема БД через Prisma, локальная разработка в Docker с HTTPS через Traefik и mkcert.

Репозиторий: [github.com/Aleksey-Danchin/standard-fullstack-project](https://github.com/Aleksey-Danchin/standard-fullstack-project)

## Стек

| Слой           | Технологии                                                          |
| -------------- | ------------------------------------------------------------------- |
| Backend        | NestJS, TypeScript                                                  |
| Frontend       | React, Vite, TanStack Router, TanStack Query, Tailwind CSS, DaisyUI |
| БД             | PostgreSQL 18, Prisma 7                                             |
| Инфраструктура | Docker Compose, Traefik v3, mkcert                                  |

## Структура проекта

```
.
├── apps/
│   ├── backend/     # NestJS API (префикс /api)
│   ├── frontend/    # React SPA (Vite dev server)
│   └── prisma/      # Схема, миграции, seed, сгенерированный клиент
├── infra/
│   ├── compose/     # dev.yml — разработка, test.yml — тестовое окружение
│   ├── docker/      # Dockerfile'ы для dev-контейнеров
│   └── traefik/     # Конфиг reverse proxy и TLS
├── scripts/         # Скрипты запуска и работы с Prisma
├── .env.template    # Шаблон переменных окружения (в репозитории)
└── .env             # Локальные переменные (создаётся из шаблона, в git не коммитится)
```

## Чеклист после клонирования

- [ ] **Имя проекта** — заменить плейсхолдер `xxyyzz` на своё имя (нижний регистр, для доменов — kebab-case, например `my-app`):

  ```bash
  find . -type f \
    ! -path '*/node_modules/*' \
    ! -path '*/.git/*' \
    ! -path '*/dist/*' \
    -exec grep -l -i 'xxyyzz' {} + 2>/dev/null | xargs -r sed -i 's/xxyyzz/ИМЯ_ПРОЕКТА/gi'
  ```

- [ ] **Адрес dev-режима** — выбрать локальный домен (например `my-app.localhost`) и убедиться, что он совпадает с `SESSION_COOKIE_DOMAIN`, `CLIENT_URL` и доменами в `infra/compose/` и `infra/traefik/`.

- [ ] **Боевой адрес** — зафиксировать production URL (например `https://example.com`) для деплоя, CORS, cookie и ссылок в приложении. В `.env` можно раскомментировать и заполнить `PRODUCTION_URL`.

- [ ] **Файл `.env`** — скопировать шаблон и заполнить значения под свой проект:

  ```bash
  cp .env.template .env
  ```

  Скрипты в `scripts/` используют `.env`, если он есть; иначе — `.env.template`.

- [ ] **mkcert** — один раз установить локальный CA: `mkcert -install`.

- [ ] **Первый запуск** — `./scripts/dev-start.sh`, затем миграции и seed (см. [Быстрый старт](#быстрый-старт)).

## Имя проекта (плейсхолдер `xxyyzz`)

В шаблоне везде используется заглушка **`xxyyzz`**: имя compose-проекта, Docker-сеть, имя БД, локальный домен `xxyyzz.localhost` и папка сертификатов mkcert.

Подробный порядок замены — в [чеклисте после клонирования](#чеклист-после-клонирования). После переименования обновите `.env` и перезапустите окружение.

## Требования

- [Docker](https://docs.docker.com/get-docker/) и Docker Compose v2
- [mkcert](https://github.com/FiloSottile/mkcert) — локальные TLS-сертификаты
- [openssl](https://www.openssl.org/) — проверка срока действия сертификатов

Один раз установите локальный CA mkcert (если ещё не делали):

```bash
mkcert -install
```

## Быстрый старт

1. Склонируйте репозиторий и пройдите [чеклист после клонирования](#чеклист-после-клонирования).
2. Запустите dev-окружение:

   ```bash
   ./scripts/dev-start.sh
   ```

   Скрипт подхватывает `.env` или `.env.template`, создаёт TLS-сертификат для dev-домена и поднимает сервисы: Postgres, backend, frontend, Prisma Studio, Traefik.

3. Создайте первую миграцию (если миграций ещё нет):

   ```bash
   ./scripts/prisma-migrate.sh init
   ```

4. Заполните БД тестовыми данными:

   ```bash
   ./scripts/prisma-seed.sh
   ```

5. Откройте в браузере:

   | Сервис        | URL                           |
   | ------------- | ----------------------------- |
   | Frontend      | https://xxyyzz.localhost      |
   | Backend API   | https://xxyyzz.localhost/api  |
   | Prisma Studio | https://xxyyzz.localhost:5555 |

Остановка окружения:

```bash
./scripts/dev-stop.sh
```

## Скрипты

| Скрипт                            | Назначение                                                     |
| --------------------------------- | -------------------------------------------------------------- |
| `scripts/dev-start.sh`            | Генерация TLS-сертификата и запуск dev-стека                   |
| `scripts/dev-stop.sh`             | Остановка dev-стека                                            |
| `scripts/prisma-migrate.sh <имя>` | Создание миграции (`prisma migrate dev`) и регенерация клиента |
| `scripts/prisma-seed.sh`          | Сброс БД, применение миграций и запуск seed                    |

Скрипты Prisma выполняют команды внутри контейнера `studio`, корректируют права на файлы в `apps/prisma` на хосте и используют тот же выбор `.env` / `.env.template`, что и `dev-start.sh`.

## Seed-данные

`apps/prisma/seed.ts` создаёт тестовых пользователей `root`, `admin`, `user` с паролем `123` (только для разработки).

## Разработка

Код приложений монтируется в контейнеры как volume (`apps/` → `/apps`), поэтому изменения на хосте подхватываются без пересборки образа:

- **Backend** — hot reload через `nest start --watch`
- **Frontend** — Vite HMR на порту 5173 внутри сети Docker, снаружи доступен через Traefik по HTTPS

Зависимости устанавливаются внутри контейнеров при первой сборке образов. При добавлении npm-пакетов может понадобиться пересборка:

```bash
docker compose -f infra/compose/dev.yml up -d --build backend frontend
```

### Prisma

- Схема: `apps/prisma/schema/`
- Клиент генерируется в `apps/prisma/generated/prisma/`
- Backend импортирует типы через алиас `__prisma` (см. `tsconfig` backend)

Контейнер `studio` при старте выполняет `prisma migrate deploy` и запускает Prisma Studio.

## Тестовое окружение

Отдельный compose-файл `infra/compose/test.yml` — изолированный стек для интеграционных тестов (свои имена контейнеров и сеть `xxyyzz-test-net`). Запуск вручную:

```bash
docker compose -f infra/compose/test.yml up -d --build
```

## Полезные команды

```bash
# Логи сервиса
docker compose -f infra/compose/dev.yml logs -f backend

# Статус контейнеров
docker compose -f infra/compose/dev.yml ps

# Полная пересборка
docker compose -f infra/compose/dev.yml up -d --build
```
