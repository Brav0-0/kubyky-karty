// Дані ігор «Кубики & Карти»: асинхронне завантаження з data.json + алгоритм рекомендації квізу.
// Використовується каталогом (catalog.js), квізом (quiz.js) та сторінкою оплати (checkout.js).
// Кожна сторінка викликає KubykyGames.load() і чекає Promise, перш ніж малювати ігри.
//
// Поля tags у data.json описують гру мовою відповідей квізу:
//   players: 1 = 1–2 гравці, 2 = 3–4, 3 = 5–6, 4 = 7+
//   company: family | party | hardcore | couple
//   time:    short (до 30 хв) | medium (30–60 хв) | long (1–3 год)
//   mood:    fun | easy | strategy | luck  (жанр / що головне в грі)
//   minAge:  мінімальний вік гравця (з поля age, напр. "10+")
window.KubykyGames = (function () {
  'use strict';

  const DATA_URL = 'data.json';
  const UNSPLASH = 'https://images.unsplash.com/photo-';
  const TAG_KEYS = ['players', 'company', 'time', 'mood'];

  let list = [];
  let loading = null;

  // Перевіряємо кожен запис: некоректна гра відкидається, а не ламає всю сторінку
  function isValidGame(g) {
    return Boolean(g) &&
      typeof g.id === 'string' && /^[a-z0-9-]+$/.test(g.id) &&
      typeof g.name === 'string' && g.name.length > 0 &&
      Number.isFinite(g.price) && g.price > 0 &&
      Number.isInteger(g.minAge) && g.minAge >= 0 &&
      typeof g.image === 'string' &&
      g.tags && TAG_KEYS.every(function (k) { return Array.isArray(g.tags[k]); });
  }

  // Асинхронне завантаження: fetch не блокує сторінку, а результат кешується —
  // повторні виклики load() повертають той самий Promise без нового запиту.
  async function fetchGames() {
    const response = await fetch(DATA_URL, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Не вдалося завантажити каталог (HTTP ' + response.status + ')');
    const data = await response.json();
    if (!data || !Array.isArray(data.games)) throw new Error('Файл data.json має неочікуваний формат');

    const valid = data.games.filter(isValidGame);
    if (valid.length !== data.games.length) {
      console.warn('data.json: пропущено некоректних записів — ' + (data.games.length - valid.length));
    }
    if (valid.length === 0) throw new Error('У каталозі немає жодної гри');
    list = valid;
    return list;
  }

  function load() {
    if (!loading) {
      loading = fetchGames().catch(function (err) {
        loading = null; // наступний виклик зможе спробувати ще раз
        throw err;
      });
    }
    return loading;
  }

  // Розмір картинки: Unsplash віддає потрібну ширину у WebP/AVIF (auto=format),
  // для локальних фото є дві WebP-версії: мініатюра -400 і повна -full
  function imageUrl(game, width) {
    if (game.image.indexOf(UNSPLASH) === 0) {
      return game.image + '?w=' + width + '&q=70&fit=crop&auto=format';
    }
    return game.image + (width <= 600 ? '-400.webp' : '-full.webp');
  }

  function byId(id) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  // Ваги питань квізу: що важливіше для вибору гри
  const WEIGHTS = { players: 3, company: 3, time: 2, mood: 3 };
  const MAX_SCORE = WEIGHTS.players + WEIGHTS.company + WEIGHTS.time + WEIGHTS.mood;

  // answers = { players: '1'..'4', age: '5'|'8'|'12'|'18', company, time, mood }.
  // Повертає всі ігри від найкращого збігу до найгіршого у вигляді
  // { game, score, percent, ageOk }. Вік — жорсткий критерій: ігри, що не підходять
  // наймолодшому гравцю, завжди йдуть після тих, що підходять.
  function recommend(answers) {
    const youngest = Number(answers.age);
    const hasAge = Number.isFinite(youngest) && youngest > 0;

    const scored = list.map(function (game, index) {
      let score = 0;
      TAG_KEYS.forEach(function (key) {
        const value = key === 'players' ? Number(answers[key]) : answers[key];
        const tags = game.tags[key];
        if (key === 'time' && value === 'any') {
          score += WEIGHTS.time; // «Не важливо» — тривалість підходить будь-яка
        } else if (tags.indexOf(value) !== -1) {
          score += WEIGHTS[key];
        } else if (key === 'players' && tags.some(function (t) { return Math.abs(t - value) === 1; })) {
          score += 1; // сусідня кількість гравців — частковий збіг
        }
      });
      // Вузькоспеціалізована гра (менше варіантів у тегах) при рівних балах точніша
      const breadth = TAG_KEYS.reduce(function (sum, k) { return sum + game.tags[k].length; }, 0);
      const ageOk = !hasAge || game.minAge <= youngest;
      return {
        game: game,
        score: score,
        percent: Math.round((score / MAX_SCORE) * 100),
        ageOk: ageOk,
        breadth: breadth,
        index: index
      };
    });

    scored.sort(function (a, b) {
      return (Number(b.ageOk) - Number(a.ageOk)) ||
        (b.score - a.score) || (a.breadth - b.breadth) || (a.index - b.index);
    });
    return scored;
  }

  return {
    get list() { return list; },
    load: load,
    byId: byId,
    imageUrl: imageUrl,
    recommend: recommend
  };
})();
