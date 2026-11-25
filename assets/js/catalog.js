// Каталог ігор (catalog.html): картки будуються з data.json, який асинхронно завантажує games.js.
// Фільтри (назва, кількість гравців, вік, ціна) застосовуються миттєво без перезавантаження.
// При наведенні (або фокусі з клавіатури) на картку поверх фото з'являється короткий опис гри.
// Кожна картка має дві дії: «Купити гру» (разова покупка) та «Або в підписці» (калькулятор на головній).
(function () {
  'use strict';

  const G = window.KubykyGames;
  const P = window.KubykyPricing;
  const grid = document.getElementById('catalog-grid');
  const status = document.getElementById('catalog-status');
  const filters = document.getElementById('catalog-filters');
  const countEl = document.getElementById('catalog-count');
  if (!grid) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function showStatus(message, isError) {
    if (!status) return;
    status.textContent = message;
    status.hidden = message === '';
    status.classList.toggle('text-red-600', Boolean(isError));
    status.classList.toggle('dark:text-red-400', Boolean(isError));
  }

  function buildCard(game, index) {
    // group — щоб опис реагував на наведення на будь-яку частину картки
    const card = el('article', 'group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden flex flex-col');
    card.dataset.id = game.id;
    const descId = 'game-desc-' + game.id;

    // Фото + опис, що проявляється поверх нього
    const media = el('div', 'relative h-44 overflow-hidden');
    const img = el('img', 'h-full w-full object-cover transition duration-300 group-hover:scale-105');
    img.src = G.imageUrl(game, 400);
    img.alt = 'Гра ' + game.name;
    // перші картки видно одразу (LCP) — їх не відкладаємо, решту вантажимо ліниво
    if (index < 4) {
      if (index === 0) img.setAttribute('fetchpriority', 'high');
    } else {
      img.loading = 'lazy';
    }
    img.width = 400;
    img.height = 176;
    media.appendChild(img);

    const overlay = el('div', 'absolute inset-0 flex flex-col justify-end bg-[#1A1D20]/85 p-4 text-white opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100');
    overlay.id = descId;
    overlay.appendChild(el('p', 'text-sm leading-snug', game.text));
    overlay.appendChild(el('p', 'mt-2 text-xs text-gray-300', 'Вік: ' + game.age + ' · ' + game.genre));
    media.appendChild(overlay);
    card.appendChild(media);

    const body = el('div', 'p-5 flex flex-col flex-grow');
    body.appendChild(el('h2', 'text-lg font-bold text-[#1A1D20] dark:text-slate-100', game.name));

    const meta = el('div', 'mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-slate-400');
    meta.appendChild(el('span', '', 'Гравці: ' + game.players));
    meta.appendChild(el('span', '', 'Час: ' + game.duration));
    meta.appendChild(el('span', '', 'Вік: ' + game.age));
    body.appendChild(meta);

    body.appendChild(el('p', 'mt-3 mb-4 text-xl font-bold text-[#D92534] dark:text-red-400', game.price + ' грн'));

    const actions = el('div', 'mt-auto flex flex-col gap-2');

    const buy = el('a', 'inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#D92534] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#b51d2a] active:bg-[#961521] focus:outline-none focus:ring-2 focus:ring-red-400');
    buy.href = 'checkout.html?game=' + encodeURIComponent(game.id);
    const cartIcon = el('i', 'fa-solid fa-cart-shopping mr-2');
    cartIcon.setAttribute('aria-hidden', 'true');
    buy.appendChild(cartIcon);
    buy.appendChild(document.createTextNode('Купити гру'));
    buy.setAttribute('aria-label', 'Купити гру ' + game.name);
    buy.setAttribute('aria-describedby', descId);
    actions.appendChild(buy);

    if (P && P.isValidBox(game.box)) {
      // Калькулятор живе на головній: передаємо бокс і назву гри через адресу
      const sub = el('a', 'inline-flex min-h-[40px] w-full items-center justify-center rounded-xl border border-solid border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-[#1A1D20] dark:text-slate-100 transition hover:border-[#D92534] focus:outline-none focus:ring-2 focus:ring-red-400',
        'Або в підписці');
      sub.href = 'index.html?' + new URLSearchParams({ box: game.box, game: game.name }).toString() + '#subscribe';
      sub.title = 'Схожі ігри приходять у боксі «' + P.BOXES[game.box].name + '»';
      sub.setAttribute('aria-label', 'Або в підписці: схожі ігри в боксі «' + P.BOXES[game.box].name + '»');
      actions.appendChild(sub);
    }

    body.appendChild(actions);
    card.appendChild(body);
    return card;
  }

  // ---------- Фільтрація ----------
  function readFilters() {
    if (!filters) return null;
    const priceInput = document.getElementById('f-price');
    const price = Number(priceInput.value);
    return {
      // Пошуковий рядок нормалізуємо й обрізаємо: користувацьке введення не потрапляє в HTML
      search: document.getElementById('f-search').value.trim().toLowerCase().slice(0, 40),
      players: Number(document.getElementById('f-players').value) || 0,
      age: Number(document.getElementById('f-age').value) || 0,
      maxPrice: Number.isFinite(price) ? price : Infinity
    };
  }

  function matches(game, f) {
    if (!f) return true;
    if (f.search && game.name.toLowerCase().indexOf(f.search) === -1) return false;
    if (f.players && game.tags.players.indexOf(f.players) === -1) return false;
    if (f.age && game.minAge > f.age) return false;
    return game.price <= f.maxPrice;
  }

  function gamesWord(n) {
    const lastTwo = n % 100;
    const last = n % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return 'ігор';
    if (last === 1) return 'гра';
    if (last >= 2 && last <= 4) return 'гри';
    return 'ігор';
  }

  function applyFilters() {
    const f = readFilters();
    if (f) document.getElementById('f-price-value').textContent = String(f.maxPrice);
    let shown = 0;
    Array.prototype.forEach.call(grid.children, function (card) {
      const game = G.byId(card.dataset.id);
      const visible = Boolean(game) && matches(game, f);
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    if (countEl) countEl.textContent = 'Знайдено: ' + shown + ' ' + gamesWord(shown) + ' з ' + G.list.length;
    grid.classList.toggle('min-h-[8rem]', shown === 0); // місце під повідомлення «нічого не знайдено»
    showStatus(shown === 0 ? 'Жодна гра не відповідає фільтрам. Спробуйте змінити умови або скиньте фільтри.' : '', false);
  }

  async function init() {
    if (!G) {
      showStatus('Каталог тимчасово недоступний.', true);
      return;
    }
    try {
      const games = await G.load();
      const fragment = document.createDocumentFragment();
      games.forEach(function (game, i) { fragment.appendChild(buildCard(game, i)); });
      grid.appendChild(fragment);
      grid.classList.remove('min-h-[75vh]'); // місце під картки більше не резервуємо
      showStatus('', false);

      if (filters) {
        filters.addEventListener('input', applyFilters);
        filters.addEventListener('submit', function (e) { e.preventDefault(); });
        // reset спрацьовує до того, як поля очистяться, тому застосовуємо фільтри в наступному кадрі
        filters.addEventListener('reset', function () { window.requestAnimationFrame(applyFilters); });
      }
      applyFilters();
    } catch (err) {
      console.error(err);
      if (filters) filters.hidden = true;
      grid.classList.replace('min-h-[75vh]', 'min-h-[8rem]');
      showStatus('Не вдалося завантажити каталог. Перевірте з’єднання з інтернетом і оновіть сторінку.', true);
    }
  }

  init();
})();
