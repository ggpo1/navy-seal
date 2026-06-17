# Tinder-раздел (Discover) + нижнее меню на мобильных

## Backend
- `GET /api/sealions/discover?limit=15` (auth) — котики, которых пользователь ещё не оценивал и которые не его собственные.
- Выборка: пул до 100, shuffle, отдача `limit` штук.
- `SeaLionService.GetDiscoverAsync`.

## Оценки
- Лайк → `PUT /api/sealions/{id}/rating` с `value: 5`
- Дизлайк → `value: 1`

## Frontend
- `/discover` — `DiscoverPage`: карточка, свайп влево/вправо, кнопки ✕ / ♥, подгрузка колоды.
- `BottomNav` — Главная, Тиндер, Профиль (≤768px, fixed bottom, safe-area).
- В шапке на десктопе — ссылка «Тиндер»; на мобильном скрыта (есть bottom nav).
- i18n: `nav.*`, `discover.*`, `meta.discover` (ru/en/zh).

## Сборка
- `dotnet build`, `npm run build` — OK.
