# Navy Seal — генератор морских котиков

Сервис генерации уникальных морских котиков с метаданными для отрисовки. Каждый котик привязан к аккаунту пользователя.

## Стек

- **Backend:** ASP.NET Core 10, EF Core, PostgreSQL, JWT
- **Frontend:** React + TypeScript + Vite
- **БД:** PostgreSQL 16 (Docker)

## Быстрый старт

### Вариант 1: Docker Compose (всё сразу)

```bash
docker compose up -d --build
```

- UI: http://localhost:3000
- API: http://localhost:5280
- PostgreSQL: localhost:5432

### Вариант 2: Локальная разработка

#### 1. PostgreSQL

```bash
docker compose up -d postgres
```

#### 2. Backend

```bash
cd backend/NavySeal.API
dotnet run
```

API: http://localhost:5280  
Миграции применяются автоматически при старте.

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173

## API

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| GET | `/api/auth/me` | Текущий пользователь (JWT) |
| POST | `/api/sealions/generate` | Сгенерировать котика (JWT) |
| GET | `/api/sealions/recent` | Недавние котики |
| GET | `/api/sealions/my` | Все котики пользователя (JWT) |

## Метаданные котика

Генератор создаёт JSON с параметрами отрисовки: цвета, размер, узор, выражение, шляпа, аксессуар и т.д. Фронтенд рисует котика на Canvas по этим данным.
