# 2026-06-16 Страница котика: комментарии и рейтинг

## Backend

### Модели
- `Comment` — текст до 1000 символов, автор, котик
- `Rating` — 1–5, уникальный индекс `(UserId, SeaLionId)`

### API
- `GET /api/sealions/{id}` — детали + средний рейтинг + оценка текущего пользователя
- `GET /api/sealions/{id}/comments`
- `POST /api/sealions/{id}/comments` [Authorize]
- `PUT /api/comments/{id}` / `DELETE /api/comments/{id}` [Authorize, только автор]
- `PUT /api/sealions/{id}/rating` — upsert 1–5
- `DELETE /api/sealions/{id}/rating` — снять свою оценку

### Миграция
`20260616180000_AddCommentsAndRatings`

## Frontend

- Маршрут `/sealions/:id` → `SeaLionDetailPage`
- `StarRating`, `CommentSection`
- Карточки ведут на страницу котика; после генерации — редирект на detail
- i18n: `detail`, `rating`, `comments`, `meta.seaLion`
