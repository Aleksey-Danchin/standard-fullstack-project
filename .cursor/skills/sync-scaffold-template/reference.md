# Template sync — справочник

## Два репозитория

```text
КАРКАС (template remote)              ПРОДУКТ (origin)
─────────────────────────              ─────────────────
main, теги v0.x.y                      main — ваш код
feature/*, fix/*                       feature/* — ваши фичи
                                       sync/template-v0.x.y — только при обновлении
```

Форк = общая история на старте + независимое развитие. Ветки не синхронизируются сами.

## Зоны файлов

### Каркас (приоритет template при конфликте)

Файлы помечены `@scaffold-core` или `@scaffold-config`. Полный список: [SCAFFOLD.md](../../../SCAFFOLD.md).

```
apps/backend/src/session/
apps/backend/src/prisma/
apps/frontend/src/services/session/
apps/frontend/src/services/api/
infra/
scripts/
.env.template          # смержить; .env продукта — вручную по UPGRADING
```

### Примеры (можно не брать из template)

```
apps/backend/src/users/
apps/frontend/src/routes/~users/
apps/frontend/src/routes/~__tests__/
apps/prisma/seeders/     # кроме базовой структуры seed
```

### Продукт (приоритет origin)

```
apps/backend/src/<your-modules>/
apps/frontend/src/features/
apps/frontend/src/routes/<your-routes>/
apps/prisma/schema/    # ваши модели и миграции
```

### Точки слияния (ожидайте конфликты)

```
apps/backend/src/app.module.ts
apps/frontend/src/main.tsx
apps/frontend/src/global/routeTree.gen.ts  # часто регенерируется роутером
```

Стратегия: импорты и wiring из обеих сторон.

## Типичные конфликты

### Имя проекта (`xxyyzz` vs `my-app`)

В template — плейсхолдер. В продукте — своё имя.

- `infra/compose/*.yml` — логика из template, **имена** из продукта
- `SESSION_COOKIE_DOMAIN`, домены Traefik — из продукта
- Не откатывать переименование при sync

### Prisma

- `schema.prisma` / `schema/*.prisma` — объединить модели
- Папка `migrations/` — **добавлять**, не редактировать чужие миграции
- После merge: `./scripts/prisma-migrate.sh`

### package.json / lock

- Зависимости каркаса — из template
- Зависимости продукта — сохранить
- После merge может понадобиться rebuild контейнеров

## Команды диагностики

```bash
# что придёт из template
git fetch template
git log --oneline --graph HEAD..template/main

# что есть только у продукта
git log --oneline --graph template/main..HEAD

# файлы, изменённые в template с последнего тега
git diff --name-only $(cat .template-version 2>/dev/null || echo HEAD)..template/main

# общий предок
git merge-base HEAD template/main
```

## Версионирование каркаса

| Тип релиза | Ожидание при sync |
|------------|-------------------|
| patch | безопасный merge |
| minor | merge + UPGRADING |
| major | merge + обязательные ручные шаги |

Синкаться на **теги**, не на плавающий `main`, если нужна предсказуемость.

## Remote naming

| Remote | URL | Назначение |
|--------|-----|------------|
| `origin` | репозиторий продукта | push/pull разработки |
| `template` | standard-fullstack-project | fetch релизов каркаса |

Скрипт: `.cursor/skills/sync-scaffold-template/scripts/template-sync.sh` (также принимает remote `upstream`).
