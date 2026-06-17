# Fix: Docker API crash (502)

## Причины
1. **PendingModelChanges** — миграция `AddDailyContest` была создана вручную без `.Designer.cs`, snapshot расходился с моделью → `MigrateAsync()` падал при старте → 502.
2. **libgssapi_krb5.so.2** — в slim-образе `aspnet` не было библиотеки для Npgsql/GSS.

## Исправления
- Пересоздана миграция `20260616164656_AddDailyContest` через `dotnet ef` + заполнен `Up()` (таблицы `DailyContests`, `ContestVotes`).
- Dockerfile: `apt-get install libgssapi-krb5-2`.
- docker-compose: `GSS Encryption Mode=Disable` в connection string.

## Перезапуск
```bash
docker compose build api
docker compose up -d
```

Если миграции застряли в странном состоянии: `docker compose down -v` (удалит данные Postgres) и снова `up`.
