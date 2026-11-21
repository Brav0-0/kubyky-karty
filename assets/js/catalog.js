// Каталог ігор (catalog.html): картки будуються з даних games.js.
// При наведенні (або фокусі з клавіатури) на картку поверх фото з'являється короткий опис гри.
// Кожна картка має дві дії: «Купити гру» (разова покупка) та «Або в підписці» (калькулятор на головній).
(function () {
  'use strict';

  const G = window.KubykyGames;
  const P = window.KubykyPricing;
  const grid = document.getElementById('catalog-grid');
  if (!G || !grid) {
    if (grid) console.warn('Каталог вимкнено: немає даних ігор.');
    return;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  G.list.forEach(function (game) {
    // group — щоб опис реагував на наведення на будь-яку частину картки
    const card = el('article', 'group bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden flex flex-col');
    const descId = 'game-desc-' + game.id;

    // Фото + опис, що проявляється поверх нього
    const media = el('div', 'relative h-44 overflow-hidden');
    const img = el('img', 'h-full w-full object-cover transition duration-300 group-hover:scale-105');
    img.src = G.imageUrl(game, 600);
    img.alt = 'Гра ' + game.name;
    img.loading = 'lazy';
    media.appendChild(img);

    const overlay = el('div', 'absolute inset-0 flex flex-col justify-end bg-[#1A1D20]/85 p-4 text-white opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100');
    overlay.id = descId;
    overlay.appendChild(el('p', 'text-sm leading-snug', game.text));
    overlay.appendChild(el('p', 'mt-2 text-xs text-gray-300', 'Вік: ' + game.age));
    media.appendChild(overlay);
    card.appendChild(media);

    const body = el('div', 'p-5 flex flex-col flex-grow');
    body.appendChild(el('h3', 'text-lg font-bold text-[#1A1D20]', game.name));

    const meta = el('div', 'mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500');
    meta.appendChild(el('span', '', 'Гравці: ' + game.players));
    meta.appendChild(el('span', '', 'Час: ' + game.duration));
    body.appendChild(meta);

    body.appendChild(el('p', 'mt-3 mb-4 text-xl font-bold text-[#D92534]', game.price + ' грн'));

    const actions = el('div', 'mt-auto flex flex-col gap-2');

    const buy = el('a', 'inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#D92534] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#b51d2a] active:bg-[#961521] focus:outline-none focus:ring-2 focus:ring-red-400');
    buy.href = 'checkout.html?game=' + encodeURIComponent(game.id);
    buy.innerHTML = '<i class="fa-solid fa-cart-shopping mr-2" aria-hidden="true"></i>Купити гру';
    buy.setAttribute('aria-label', 'Купити гру ' + game.name);
    buy.setAttribute('aria-describedby', descId);
    actions.appendChild(buy);

    if (P && P.isValidBox(game.box)) {
      // Калькулятор живе на головній: передаємо бокс і назву гри через адресу
      const sub = el('a', 'inline-flex min-h-[40px] w-full items-center justify-center rounded-xl border border-solid border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#1A1D20] transition hover:border-[#D92534] focus:outline-none focus:ring-2 focus:ring-red-400',
        'Або в підписці');
      sub.href = 'index.html?' + new URLSearchParams({ box: game.box, game: game.name }).toString() + '#subscribe';
      sub.title = 'Схожі ігри приходять у боксі «' + P.BOXES[game.box].name + '»';
      sub.setAttribute('aria-label', 'Отримати схожу гру в підписці «' + P.BOXES[game.box].name + '»');
      actions.appendChild(sub);
    }

    body.appendChild(actions);
    card.appendChild(body);
    grid.appendChild(card);
  });
})();
