# 2026-06-16 Navy Seal — генератор морских котиков

## Что сделано

Создан full-stack сервис с нуля:

### Backend (ASP.NET Core 10 + PostgreSQL)
- JWT-аутентификация (регистрация, вход, профиль)
- EF Core + Npgsql, миграция `InitialCreate`
- Таблицы: `Users`, `SeaLions` (метаданные в `jsonb`)
- `SeaLionGenerator` — случайные метаданные отрисовки
- API: generate, recent, my
- `docker-compose.yml` — PostgreSQL 16

### Frontend (React + TypeScript + Vite)
- Главная: кнопка «Сгенерировать», превью по центру, лента недавних внизу
- Профиль: все котики пользователя
- `SeaLionCanvas` — отрисовка по метаданным (Canvas)
- Прокси `/api` → `localhost:5280`

### Запуск
```bash
docker compose up -d
cd backend/NavySeal.API && dotnet run
cd frontend && npm run dev
```

## Метаданные котика
bodyColor, bellyColor, size, flipperLength, eyeStyle, expression, pattern, hat, accessory, whiskers, rotation, backgroundColor, name
