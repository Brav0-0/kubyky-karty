// Каталог ігор «Кубики & Карти» — ті самі 10 ігор, що й у галереї.
// Використовується каталогом (catalog.js), квізом (quiz.js) та сторінкою оплати (checkout.js).
// Поля tags описують гру мовою відповідей квізу:
//   players: 1 = 1–2 гравці, 2 = 3–4, 3 = 5–6, 4 = 7+
//   company: family | party | hardcore | couple
//   time:    short (до 30 хв) | medium (30–60 хв) | long (1–3 год)
//   mood:    fun | easy | strategy | luck
window.KubykyGames = (function () {
  'use strict';

  const U = 'https://images.unsplash.com/photo-';

  const list = [
    {
      id: 'catan', name: 'Катан', price: 1650, box: 'hardcore',
      players: '3–4', duration: '60–120 хв', age: '10+',
      image: 'assets/images/catan',
      text: 'Освоюйте острів: будуйте дороги й поселення, торгуйте ресурсами з іншими гравцями та першими наберіть 10 очок перемоги.',
      tags: { players: [2], company: ['hardcore', 'family'], time: ['long'], mood: ['strategy'] }
    },
    {
      id: 'domino', name: 'Доміно', price: 350, box: 'family',
      players: '2–4', duration: '15–30 хв', age: '6+',
      image: 'assets/images/domino',
      text: 'Класична гра з кістками: прикладайте плитки з однаковою кількістю точок і позбудьтеся своїх першим.',
      tags: { players: [1], company: ['couple', 'family'], time: ['short'], mood: ['easy'] }
    },
    {
      id: 'carcassonne', name: 'Каркассон', price: 1100, box: 'family',
      players: '2–5', duration: '30–45 хв', age: '7+',
      image: 'assets/images/carcassonne',
      text: 'Викладайте тайли й разом будуйте середньовічну Францію: міста, дороги та монастирі, займаючи їх своїми мiплами.',
      tags: { players: [2, 3], company: ['family'], time: ['medium'], mood: ['easy', 'strategy'] }
    },
    {
      id: 'mafia', name: 'Мафія', price: 300, box: 'party',
      players: '6–15', duration: '30–60 хв', age: '14+',
      image: 'assets/images/mafia',
      text: 'Рольова гра на блеф і дедукцію: мирні жителі шукають мафію, а мафія намагається не видати себе до ранку.',
      tags: { players: [4], company: ['party'], time: ['medium'], mood: ['fun'] }
    },
    {
      id: 'chess', name: 'Шахи', price: 800, box: 'hardcore',
      players: '2', duration: '30–90 хв', age: '6+',
      image: U + '1695480542225-bc22cac128d0',
      text: "Дерев'яний набір для гри, де все вирішує стратегія: жодної удачі, лише ваш розрахунок на кілька ходів уперед.",
      tags: { players: [1], company: ['couple', 'hardcore'], time: ['long'], mood: ['strategy'] }
    },
    {
      id: 'monopoly', name: 'Монополія', price: 1200, box: 'family',
      players: '2–6', duration: '60–180 хв', age: '8+',
      image: U + '1677188010559-0667a1ed33a0',
      text: 'Купуйте вулиці, будуйте будинки й готелі та збирайте орендну плату, доки суперники не збанкрутують.',
      tags: { players: [2, 3], company: ['family', 'party'], time: ['long'], mood: ['luck'] }
    },
    {
      id: 'ludo', name: 'Лудо', price: 400, box: 'family',
      players: '2–4', duration: '20–40 хв', age: '5+',
      image: U + '1629760946220-5693ee4c46ac',
      text: 'Кидайте кубик і проведіть усі свої фішки по колу до будиночка, збиваючи фішки суперників на шляху.',
      tags: { players: [2], company: ['family'], time: ['short'], mood: ['luck'] }
    },
    {
      id: 'risk', name: 'Ризик', price: 1500, box: 'hardcore',
      players: '3–5', duration: '2–3 год', age: '10+',
      image: U + '1761716475708-ef98183ccb62',
      text: 'Стратегія завоювання світу на великому полі: розставляйте армії, укладайте союзи й захоплюйте континенти.',
      tags: { players: [3], company: ['hardcore', 'party'], time: ['long'], mood: ['strategy', 'luck'] }
    },
    {
      id: 'yahtzee', name: 'Яцзи', price: 450, box: 'party',
      players: '1–10', duration: '20–30 хв', age: '8+',
      image: U + '1547638375-ebf04735d792',
      text: "Гра з п'ятьма кубиками: за три кидки збирайте комбінації на кшталт покеру та заповнюйте таблицю очок.",
      tags: { players: [3, 4], company: ['party', 'family'], time: ['short'], mood: ['luck', 'fun'] }
    },
    {
      id: 'poker', name: 'Покер', price: 700, box: 'party',
      players: '2–10', duration: '60+ хв', age: '18+',
      image: U + '1541278107931-e006523892df',
      text: 'Набір із двох колод карт і фішок для покеру: блефуйте, оцінюйте шанси та забирайте банк.',
      tags: { players: [3, 4], company: ['party', 'hardcore'], time: ['medium'], mood: ['luck', 'strategy'] }
    }
  ];

  // Розмір картинки: Unsplash віддає потрібну ширину у WebP/AVIF (auto=format),
  // для локальних фото є дві WebP-версії: мініатюра -400 і повна -full
  function imageUrl(game, width) {
    if (game.image.indexOf(U) === 0) {
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

  // answers = { players: '1'..'4', company, time, mood }.
  // Повертає всі ігри, відсортовані від найкращого збігу до найгіршого.
  function recommend(answers) {
    const scored = list.map(function (game, index) {
      let score = 0;
      Object.keys(WEIGHTS).forEach(function (key) {
        const value = key === 'players' ? Number(answers[key]) : answers[key];
        const tags = game.tags[key];
        if (tags.indexOf(value) !== -1) {
          score += WEIGHTS[key];
        } else if (key === 'players' && tags.some(function (t) { return Math.abs(t - value) === 1; })) {
          score += 1; // сусідня кількість гравців — частковий збіг
        }
      });
      // Вузькоспеціалізована гра (менше варіантів у тегах) при рівних балах точніша
      const breadth = game.tags.players.length + game.tags.company.length + game.tags.time.length + game.tags.mood.length;
      return { game: game, score: score, breadth: breadth, index: index };
    });

    scored.sort(function (a, b) {
      return (b.score - a.score) || (a.breadth - b.breadth) || (a.index - b.index);
    });
    return scored.map(function (s) { return s.game; });
  }

  return { list: list, byId: byId, imageUrl: imageUrl, recommend: recommend };
})();
