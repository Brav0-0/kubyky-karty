// Перемикач теми Dark/Light. Підключається в <head> БЕЗ defer, щоб клас .dark з'явився
// на <html> ще до першої відмальовки (інакше сторінка на мить «блимає» світлою темою).
// Вибір користувача зберігається в localStorage; якщо вибору ще немає — беремо системну тему.
(function () {
  'use strict';

  const STORAGE_KEY = 'kk-theme';
  const root = document.documentElement;
  const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function readSaved() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'dark' || value === 'light' ? value : null; // інші значення ігноруємо
    } catch (err) {
      return null; // localStorage недоступний (приватний режим, заборона cookies)
    }
  }

  function save(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (err) { /* тему просто не запам'ятаємо */ }
  }

  function currentTheme() {
    return readSaved() || (media && media.matches ? 'dark' : 'light');
  }

  function apply(theme) {
    const isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light'; // темні скролбари та нативні поля форм
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#0f172a' : '#D92534');
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему');
      btn.title = btn.getAttribute('aria-label');
    });
  }

  apply(currentTheme());

  // Якщо користувач ще не обирав тему вручну — реагуємо на зміну системної теми
  if (media && media.addEventListener) {
    media.addEventListener('change', function (e) {
      if (!readSaved()) apply(e.matches ? 'dark' : 'light');
    });
  }

  // Кнопка-перемикач є в розмітці шапки кожної сторінки (щоб не зсувати макет при завантаженні)
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const next = root.classList.contains('dark') ? 'light' : 'dark';
        save(next);
        apply(next);
      });
    });
    apply(currentTheme());
  });
})();
