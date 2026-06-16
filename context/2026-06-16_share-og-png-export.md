# Share, OG preview, PNG export

## Что сделано

### 1. Кнопка «Скопировать ссылку»
- На странице `/sealions/:id` две кнопки: копирование ссылки и скачивание PNG.
- Копируется URL вида `{origin}/share/sealions/{id}` — для Telegram/соцсетей с OG-метаданными.
- Утилита `frontend/src/utils/share.ts`: `getSeaLionShareUrl`, `copyTextToClipboard`.

### 2. Open Graph / preview
- **Backend** `GET /share/sealions/{id}` — HTML с `og:*`, `twitter:*`, редирект на SPA.
- **Backend** `GET /api/sealions/{id}/og-image` — PNG 1200×630 (ImageSharp): фон из metadata, силуэт котика, имя, качество, рейтинг.
- `App:PublicFrontendUrl` и `App:PublicApiUrl` в `appsettings.json`.
- **Frontend** `useSeaLionShareMeta` — обновляет meta-теги при просмотре котика в браузере.
- Vite proxy `/share` → backend (dev).

### 3. Экспорт canvas в PNG
- `SeaLionCanvas` — `forwardRef` + `exportPng(filename?, size=1024)` через offscreen canvas с подписью имени.
- Кнопка «Скачать PNG» на detail page.

## Файлы
- `Configuration/AppSettings.cs`
- `Services/SeaLionOgImageGenerator.cs`
- `Controllers/ShareController.cs`
- `Controllers/SeaLionsController.cs` — og-image endpoint
- `frontend/src/hooks/useSeaLionShareMeta.ts`
- `frontend/src/utils/share.ts`
- `frontend/src/pages/SeaLionDetailPage.tsx`
- `frontend/src/components/SeaLionCanvas.tsx`

## Продакшен
В `appsettings.Production.json` задать реальные `App:PublicFrontendUrl` и `App:PublicApiUrl` (публичные HTTPS URL).
