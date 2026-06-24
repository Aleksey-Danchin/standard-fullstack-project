# Changelog

Все значимые изменения каркаса документируются здесь.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
версии — [Semantic Versioning](https://semver.org/lang/ru/).

## [Unreleased]

### Added

- Документация и skills: старт через **GitHub Template** + `/init-project`, sync через `template` remote
- Scaffold zones: `SCAFFOLD.md`, `@scaffold-*` markers
- Skills: `sync-scaffold-template`, `align-scaffold-standard`
- Session module (backend + frontend), Redis, Traefik dev stack
- Redis persistence in dev: named volume `redis-data` + AOF (`infra/redis/redis.conf`)

## [0.1.0] - 2026-06-24

Первый стабильный каркас: NestJS + React + Prisma + Docker + session API.

[Unreleased]: https://github.com/Aleksey-Danchin/standard-fullstack-project/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Aleksey-Danchin/standard-fullstack-project/releases/tag/v0.1.0
