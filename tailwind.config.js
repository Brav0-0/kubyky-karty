/** Tailwind CSS: збірка готового файлу css/tailwind.css замість CDN-скрипта.
 *  Сканує всі HTML-сторінки та JS-файли (класи, які JS додає динамічно, теж потрапляють у збірку).
 *  Команда: npm run build:css
 *  @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './assets/js/**/*.js'],
  theme: {
    extend: {}
  },
  plugins: []
};
