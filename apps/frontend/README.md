# Frontend (Next.js)

Папка `apps/frontend` содержит SSR-приложение на Next.js (`app` directory). Пример структуры внутри указан в основном документе проекта.

Локальная разработка:

```bash
cd apps/frontend
npm i -g pnpm
pnpm install
pnpm dev
```

Сборка для продакшена:

```bash
pnpm build
pnpm start
```

Переменные окружения: `NEXT_PUBLIC_API_URL` — адрес API.
