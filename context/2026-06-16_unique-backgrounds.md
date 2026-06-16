# 2026-06-16 Уникальные фоны морских котиков

## Backend

### `SeaLionBackgroundGenerator`
Отдельный генератор фонов с темами и процедурными элементами.

**Стили:**
- `waves`, `gradient`, `plain` — базовые
- `beach`, `bubbles`, `sunset` — чаще у common/uncommon
- `coral` — rare+
- `deepSea`, `aurora` — epic/legendary
- `starry` — legendary

**Метаданные:**
- `backgroundColor`, `backgroundColorSecondary`, `backgroundAccentColor`
- `backgroundStyle`, `waveIntensity`
- `backgroundMarks[]` — `kind`, `x`, `y`, `size`, `opacity`, `rotation`

**Элементы:** bubble, star, sparkle, cloud, sun, ray, coral, aurora

Качество влияет на пул редких стилей. Палитры согласованы по HSL внутри темы.

### Прочее
- `SeaLionColorGenerator` — только цвета тела (без фона)
- `SeaLionGenerator` — вызывает `SeaLionBackgroundGenerator.Generate(rng, quality)`

## Frontend

- `backgroundRenderer.ts` — отрисовка всех стилей и marks
- Типы и `resolveTraits` обновлены
- Старые записи без новых полей — fallback на waves/gradient
