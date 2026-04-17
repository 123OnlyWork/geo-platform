# geo-platform

Шаблон монорепозитория для масштабируемого картографического сервиса (Next.js + FastAPI + PostGIS + Redis).

См. подробные инструкции в [INSTALL.md](INSTALL.md).

Структура (кратко):

- `apps/frontend` — Next.js (SSR)
- `apps/api` — FastAPI сервисы
- `apps/tile-server` — tile server
- `packages/*` — общие библиотеки (ui, map-core, api-client, types)
- `infrastructure` — docker, nginx, terraform
- `database` — миграции и seed
