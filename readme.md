# 🎁 Family Gifts

Статическая страница со списками подарков для членов семьи.

## Развёртывание
1. Склонируй репозиторий
2. Включи **GitHub Pages** в настройках (`Settings > Pages > Deploy from branch > main`)
3. Настрой поддомен `gifts.shil.team` через DNS (CNAME на `jashilko.github.io`)

## Добавление подарков
- Файлы списков лежат в `data/*.json`
- Формат:
```json
{
  "title": "Название",
  "price": "Цена",
  "link": "https://пример.сайт",
  "image": "https://ссылка/картинка.jpg",
  "gifted": false,
  "canceled": false
}
