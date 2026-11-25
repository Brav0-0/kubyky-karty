// Vercel Web Analytics (безкоштовний тариф): збирає анонімну статистику переглядів без cookies.
// Скрипт /_vercel/insights/script.js існує лише на хостингу Vercel, тому локально (localhost,
// Live Server) його не завантажуємо — інакше в консолі була б помилка 404.
(function () {
  'use strict';
  if (!/\.vercel\.app$/.test(window.location.hostname)) return;

  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  const script = document.createElement('script');
  script.src = '/_vercel/insights/script.js';
  script.defer = true;
  document.head.appendChild(script);
})();
