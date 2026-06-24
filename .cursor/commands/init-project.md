# Стартовая инициализация проекта

Проведи **стартовую инициализацию** продукта, созданного через **GitHub → Use this template**, по skill `prepare-scaffold-fork`.

## Что сделать

1. Прочитай `.cursor/skills/prepare-scaffold-fork/SKILL.md` и следуй ему.
2. **Интерактивно** спроси: имя проекта, URL repo каркаса (если не дефолтный), production URL, первый запуск, коммит.
3. Покажи **план** → `prepare-fork.sh --dry-run` → `prepare-fork.sh` (включает bootstrap: deps, migrate `create_user_model`, seed).
4. Скрипт добавит **`git remote template`** (связь с каркасом для будущих обновлений).
5. По согласованию: mkcert, `./scripts/dev-start.sh`.
6. Итоговая таблица + напомни про `sync-scaffold-template` при релизах каркаса.

Одноразовые артефакты (этот skill, `/init-project`, `align-scaffold-standard`) скрипт удалит в конце. В продукте остаётся `sync-scaffold-template`.

## Ограничения

- Не для repo **мейнтейнера каркаса** — только продукт из template.
- Не коммить `.env`, не удалять `.git`.

## Справка

- `SCAFFOLD.md` — зоны каркаса
