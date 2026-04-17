# Geo Platform

Геоплатформа для визуализации и анализа пространственных данных с использованием:

- Next.js (frontend)
- FastAPI (backend)
- PostGIS (геоданные)
- Tegola (vector tiles)
- Redis (кеш)

Проект реализован как монорепозиторий.

---

## Архитектура


geo-platform/
├── apps/
│ ├── frontend/ # Next.js (карта, UI)
│ └── api/ # FastAPI (мета, прокси, API)
├── packages/
│ ├── map-core/ # стили/конфиг карты (будущий shared слой)
│ └── api-client/ # клиент для API (заготовка)
├── infrastructure/
│ └── docker/ # docker-compose, tegola config
├── README.md
└── INSTALL.md


---

## Как работает карта

1. Frontend (Leaflet) отображает карту
2. Тайлы запрашиваются из Tegola:

/maps/map/{z}/{x}/{y}.pbf

3. Tegola берет данные из PostGIS (OSM)
4. Backend (FastAPI) отдает:
- `/health`
- `/api/map/meta` (конфиг карты)

---

## Основные эндпоинты

### Backend

- http://localhost:8000/health
- http://localhost:8000/api/map/meta

### Tegola

- http://localhost:8080/capabilities
- http://localhost:8080/maps/map/{z}/{x}/{y}.pbf

### Frontend

- http://localhost:3000
- http://localhost:3000/map

---

## Быстрый старт (Docker)

```bash
cd infrastructure/docker
docker compose up --build

После запуска:

Frontend: http://localhost:3000
API: http://localhost:8000
Tiles: http://localhost:8080

Стек технологий
Frontend
Next.js 14
React 18
Leaflet
leaflet.vectorgrid
Backend
FastAPI
SQLAlchemy
Pydantic
Гео
PostGIS
Tegola
OpenStreetMap
