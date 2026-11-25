# Кубики & Карти — клуб настільних ігор

Вебсайт для добору настільних ігор для друзів, родини та тематичних вечорів (варіант 18 РГР).
Головна функція — інтерактивний квіз із 5 питань (кількість гравців, вік наймолодшого гравця,
компанія, тривалість партії, жанр), який рекомендує конкретну гру з каталогу.

- Сайт: https://kubyky-karty.vercel.app/
- Репозиторій: https://github.com/Brav0-0/kubyky-karty

## Технології

- **HTML5** — семантична розмітка (`header`, `nav`, `main`, `section`, `fieldset`/`legend`, `dialog`), ARIA-атрибути.
- **Tailwind CSS 3** — збірка через Tailwind CLI у `css/tailwind.css`, mobile-first, темна тема через варіанти `dark:`.
- **Vanilla JavaScript (ES6+)** — уся логіка без фреймворків, кожен модуль в IIFE.
- **Бібліотеки через CDN:** Swiper (слайдер відгуків), Fancybox (галерея), Typed.js (анімація тексту), Font Awesome (іконки).
- **Vercel** — хостинг, Vercel Web Analytics; **GitHub Actions** — CI/CD.

## Сторінки

| Файл | Призначення |
|---|---|
| `index.html` | Головна: Hero, квіз підбору гри, галерея, калькулятор підписки |
| `catalog.html` | Каталог ігор з фільтрами (назва, гравці, вік, ціна) |
| `about.html` | Про сервіс, відгуки (Swiper) |
| `contacts.html` | Контакти та форма зворотного зв'язку з валідацією RegEx |
| `checkout.html` | Оформлення покупки гри або підписки |
| `info.html` | Доставка, оплата, FAQ, політика конфіденційності |

## Основні функції

- **Квіз підбору гри** (`assets/js/quiz.js`, `assets/js/games.js`): кожна гра отримує бали за збіг
  з відповідями (ваги: гравці 3, компанія 3, тривалість 2, жанр 3); вік — жорсткий фільтр.
  Показується відсоток збігу та дві альтернативи.
- **Каталог з фільтрацією** (`assets/js/catalog.js`): миттєві фільтри без перезавантаження.
- **Mock-дані** `data.json`: список ігор завантажується асинхронно (`fetch` + `async/await`),
  з перевіркою записів і зрозумілим повідомленням, якщо файл недоступний.
- **Dark/Light Mode** (`assets/js/theme.js`): клас `.dark` на `<html>`, вибір зберігається в `localStorage`,
  без вибору — системна тема.
- **Калькулятор підписки** (`assets/js/widget.js`, `assets/js/pricing.js`) у модальному вікні `<dialog>`.
- **Валідація форм** (`assets/js/validation.js`, `assets/js/checkout.js`): RegEx для імені, email,
  телефону `+380XXXXXXXXX`, номера картки (алгоритм Луна), терміну дії.
- **SEO**: meta description, canonical, Open Graph, `robots.txt`, `sitemap.xml`.

## Запуск локально

`data.json` завантажується через `fetch`, тому сторінки треба відкривати через локальний сервер
(відкриття файлу напряму `file://` браузер блокує):

```bash
git clone https://github.com/Brav0-0/kubyky-karty.git
cd kubyky-karty
npm ci
npm run build:css      # зібрати css/tailwind.css (після зміни класів)
npx serve .            # або розширення Live Server у VS Code
```

## CI/CD

`.github/workflows/deploy.yml` при кожному push у `main`:
1. збирає Tailwind і перевіряє, що `css/tailwind.css` закомічено актуальним;
2. запускає `npm run check:js` (синтаксис JS, локальні посилання, SEO-теги, структура `data.json`);
3. якщо перевірки пройдено — деплоїть сайт на Vercel (секрети `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).

## Безпека

Сайт статичний, без серверної частини: дані форм і картки нікуди не надсилаються та не зберігаються.
У `localStorage` зберігаються лише тема оформлення та email демо-входу (пароль не зберігається).
Користувацьке введення виводиться лише через `textContent`. Заголовки безпеки (CSP, X-Frame-Options тощо)
задано у `vercel.json`.
