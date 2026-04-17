# Установка и запуск — geo-platform

Краткая инструкция по подготовке окружения, локальному запуску и обязательным компонентам.

1) Требования

- Git
- Node.js (LTS, например 18+) и `pnpm`/`npm`/`yarn` для фронтенда
- Python 3.10+ для `FastAPI`
- Docker & Docker Compose (рекомендовано для локальной разработки)
- PostgreSQL с PostGIS (локально или в контейнере)
- Redis

1) Переменные окружения

Поместите файл `.env` рядом с `infrastructure/docker/docker-compose.yml`. Пример ключей в `infrastructure/docker/.env.example`.

Основные переменные:

```
POSTGRES_USER=geo_user
POSTGRES_PASSWORD=geo_pass
POSTGRES_DB=geo_db
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
REDIS_HOST=redis
REDIS_PORT=6379
API_PORT=8000
FRONTEND_PORT=3000
TILESERVER_PORT=8080
```

1) Локальная разработка (рекомендуется — Docker Compose)

Перейдите в папку с конфигом и запустите сервисы:

```bash
cd infrastructure/docker
cp .env.example .env   # отредактируйте при необходимости
docker compose up --build -d
```

Потом можно выполнить миграции и seed (при наличии):

```bash
docker compose exec api bash -c "alembic upgrade head"  # если используется alembic
docker compose exec api bash -c "python -m database.seeds.seed"  # пример
```

1) Запуск вручную (без Docker)

API (FastAPI):

```bash
cd apps/api
python -m venv .venv
.\.venv\Scripts\activate   # Windows
source .venv/bin/activate    # macOS / Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend (Next.js):

```bash
cd apps/frontend
npm i -g pnpm
pnpm install
pnpm dev
```

1) Tile server

Используйте `tileserver-gl` с MBTiles. Пример запуска через Docker: том с MBTiles монтируется в `/data`.

1) Полезные советы для production

- Используйте CDN для тайлов и статических ассетов.
- Старайтесь кешировать bbox-запросы и результаты кластеризации в Redis.
- БД: используйте управляемые Postgres с поддержкой PostGIS или резервные архивы и репликацию.
- Для Nginx/TLS используйте прокси и certbot/Let's Encrypt.

1) Что дальше

- В `apps/api` добавьте миграции и реализацию репозитория `point_repo` (запросы PostGIS).
- В `apps/frontend` реализуйте компоненты карты и хуки, использующие `/api/points`.
