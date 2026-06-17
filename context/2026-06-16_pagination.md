# Пагинация: «Недавние» и профиль пользователя

## Backend
- `DTOs/PagedResponse.cs` — обёртка с `Items`, `Total`, `Page`, `PageSize`; `Pagination.Normalize()` (default 12, max 50).
- `GET /api/sealions/recent?page=&pageSize=` — пагинированный список.
- `GET /api/users/{username}?page=&pageSize=` — пагинация котиков в профиле; `sealCount` = общее число.
- `PublicUserProfileDto` и `SeaLionListResponse` расширены полями пагинации.

## Frontend
- `PAGE_SIZE = 12`, `api.getRecent(page)`, `api.getUserProfile(username, page)`.
- Компонент `Pagination.tsx` (prev/next, «Страница X из Y»).
- `HomePage`: пагинация только для вкладки `recent`; week/best — топ-24 без пагинации.
- `PublicProfilePage`: состояние `page`, перезагрузка при смене страницы.
- i18n: `pagination.*` в ru/en/zh; стили `.pagination` в `index.css`.

## Сборка
- `dotnet build` и `npm run build` — OK.
