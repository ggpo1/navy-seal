# Голосование «Котик дня»

## Механика
- Период: UTC-сутки (00:00–24:00)
- Кандидаты: котики, созданные за последние 24 часа
- 1 голос на пользователя за период (можно сменить выбор)
- В полночь UTC период финализируется: победитель по числу голосов
- В `metadata.awards[]` добавляется запись:
  - `nomination`: `daily_best`
  - `wonAt`, `periodStartUtc`, `periodEndUtc`

## API
- `GET /api/contests/daily` — текущий конкурс, кандидаты, прошлый победитель
- `POST /api/contests/daily/vote` `{ seaLionId }` — голос (auth)

## UI
- `DailyContestSection` на главной
- `SeaLionAwards` на странице котика

## Таблицы
- `DailyContests`, `ContestVotes`
- Миграция `20260616200000_AddDailyContest`
