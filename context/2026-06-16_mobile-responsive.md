# Адаптация фронтенда под мобильные устройства

## Проблемы
- `SeaLionCanvas` с фиксированными `width`/`height` в inline-стилях вызывал горизонтальный скролл на узких экранах.
- Шапка: поиск + язык + auth в одной строке — тесно на телефоне.
- Неполные media queries (только detail/preview на 640px).

## Изменения

### SeaLionCanvas
- `width`/`height` — максимальные размеры, не жёсткие пиксели.
- `ResizeObserver` всегда подстраивает canvas под контейнер.
- Стиль: `width: 100%; max-width: N; aspect-ratio: 1`.

### Layout
- Блок `nav__actions` для языка и кнопок авторизации.
- На мобильном: поиск на всю ширину, действия — строкой/колонкой ниже.

### index.css
- Breakpoints: 900px (detail hero → 1 колонка), 640px (основной mobile), 380px (очень узкие).
- Safe-area insets, `overflow-x: clip`, `touch-action: manipulation`.
- Сетки карточек: 2 колонки на телефоне, 1 на <380px.
- Кнопки действий на detail — на всю ширину.
- Горизонтальный скролл вкладок ленты.
- Уменьшенные отступы, адаптивная типографика.

### index.html
- `viewport-fit=cover`, `theme-color`.

## Сборка
- `npm run build` — OK.
