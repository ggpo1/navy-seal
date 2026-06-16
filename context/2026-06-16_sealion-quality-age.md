# 2026-06-16 Качество и возраст при генерации котиков

## Что сделано

### Backend
- `SeaLionMetadata`: поля `Quality` (common → legendary) и `Age` (0–20 лет)
- `SeaLionGenerationOptions`: опциональные входные параметры `Quality`, `Age`
- `ISeaLionGenerator.Generate(options?)` — при отсутствии параметров значения случайные
- `SeaLionGenerator`:
  - взвешенный рандом качества (50/25/15/8/2 %)
  - возраст влияет на пропорции (щенок / подросток / пожилой)
  - качество влияет на шанс шляпы, аксессуара, узора
- API `POST /api/sealions/generate` принимает тело `{ "quality": "rare", "age": 3 }`
- Валидация: quality из списка, age 0–20

### Frontend
- Типы `quality`, `age` в `SeaLionMetadata`
- `api.generateSeaLion({ quality?, age? })`
- Отображение качества и возраста в превью на главной
- i18n: ru / en / zh

## Пример запроса

```json
POST /api/sealions/generate
{ "quality": "epic", "age": 2 }
```
