## Старт продукта (GitHub Template)

1. **Use this template** на GitHub → новый repo (`origin`).
2. `git clone` → **`/init-project`**.
3. Скрипт добавляет **`git remote template`** — связь с repo каркаса для обновлений.

GitHub template **не создаёт** эту связь; без `template` remote skill `sync-scaffold-template` не работает.

## Skills в продукте после `/init-project`

| Удаляется (одноразово) | Остаётся |
|------------------------|----------|
| `align-scaffold-standard` | `sync-scaffold-template` |
| `prepare-scaffold-fork` | |
| `/init-project` | |

Скрипт `prepare-fork.sh` удаляет одноразовые артефакты в **шаге 5**.

## Не fork

Для нескольких проектов с одного каркаса используйте **Use this template** каждый раз, не GitHub Fork (один fork на аккаунт на upstream).
