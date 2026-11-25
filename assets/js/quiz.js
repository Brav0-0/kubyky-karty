// Квіз підбору гри «Кубики & Карти».
// 5 питань (гравці, вік, компанія, тривалість, жанр) -> кожна гра з data.json отримує бали
// за збіг з відповідями -> рекомендуємо конкретну гру. Вік наймолодшого гравця — жорсткий фільтр.
// Логіку підрахунку винесено в games.js (KubykyGames.recommend). Код в IIFE.
(function () {
  'use strict';

  const G = window.KubykyGames;
  const form = document.getElementById('quiz-form');
  const steps = form ? Array.prototype.slice.call(form.querySelectorAll('.quiz-step')) : [];
  const prevBtn = document.getElementById('quiz-prev');
  const nextBtn = document.getElementById('quiz-next');
  const errorEl = document.getElementById('quiz-error');
  const stepLabel = document.getElementById('quiz-step-label');
  const progressBar = document.querySelector('.quiz .progress-bar');
  const progress = document.querySelector('.quiz .progress');
  const resultEl = document.getElementById('quiz-result');
  const buyLink = document.getElementById('quiz-buy');
  const restartBtn = document.getElementById('quiz-restart');
  const altList = document.getElementById('quiz-result-alt');
  const matchEl = document.getElementById('quiz-result-match');
  const warningEl = document.getElementById('quiz-result-warning');

  if (!G || !form || steps.length === 0 || !prevBtn || !nextBtn || !resultEl || !buyLink || !restartBtn || !altList) {
    console.warn('Квіз вимкнено: не знайдено потрібні елементи.');
    return;
  }

  // name радіокнопки -> ключ відповіді для KubykyGames.recommend
  const KEYS = { 'q-players': 'players', 'q-age': 'age', 'q-company': 'company', 'q-time': 'time', 'q-mood': 'mood' };

  let current = 0;

  function getAnswer(step) {
    return step.querySelector('input[type="radio"]:checked');
  }

  function setProgress(percent) {
    progress.style.width = percent + '%';
    if (progressBar) progressBar.setAttribute('aria-valuenow', String(percent));
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.toggle('hidden', message === '');
  }

  function render() {
    steps.forEach(function (step, i) { step.hidden = i !== current; });
    prevBtn.disabled = current === 0;
    const isLast = current === steps.length - 1;
    nextBtn.innerHTML = isLast
      ? 'Показати результат <i class="icon icon-inverse fa-solid fa-check" aria-hidden="true"></i>'
      : 'Далі <i class="icon icon-inverse fa-solid fa-arrow-right" aria-hidden="true"></i>';
    stepLabel.textContent = 'Питання ' + (current + 1) + ' з ' + steps.length;
    setProgress(Math.round((current / steps.length) * 100));
    showError('');
  }

  function collectAnswers() {
    const answers = {};
    steps.forEach(function (step) {
      const answer = getAnswer(step);
      if (answer && KEYS[answer.name]) answers[KEYS[answer.name]] = answer.value;
    });
    return answers;
  }

  // Показує картку гри в блоці результату (item = { game, percent, ageOk } з recommend)
  function showGame(item) {
    const game = item.game;
    if (matchEl) matchEl.textContent = 'Збіг з вашими відповідями: ' + item.percent + '%';
    if (warningEl) {
      warningEl.textContent = item.ageOk ? '' : 'Увага: гра розрахована на вік ' + game.age + ', а в каталозі немає ідеального варіанту для наймолодшого гравця.';
      warningEl.classList.toggle('hidden', item.ageOk);
    }
    const img = document.getElementById('quiz-result-img');
    img.src = G.imageUrl(game, 700);
    img.alt = 'Гра ' + game.name;
    document.getElementById('quiz-result-name').textContent = game.name;
    document.getElementById('quiz-result-players').textContent = game.players;
    document.getElementById('quiz-result-time').textContent = game.duration;
    document.getElementById('quiz-result-age').textContent = game.age;
    document.getElementById('quiz-result-text').textContent = game.text;
    document.getElementById('quiz-result-price').textContent = String(game.price);
    buyLink.href = 'checkout.html?game=' + encodeURIComponent(game.id);
    buyLink.setAttribute('aria-label', 'Купити гру ' + game.name);
  }

  // Альтернативи: кнопки, що перемикають картку на іншу гру
  function showAlternatives(items) {
    altList.textContent = '';
    const label = document.getElementById('quiz-result-alt-label');
    if (label) label.hidden = items.length === 0;
    items.forEach(function (item) {
      const game = item.game;
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rounded-full border border-solid border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-1.5 text-sm text-[#1A1D20] dark:text-slate-100 transition hover:border-[#D92534] hover:text-[#D92534]';
      btn.textContent = game.name + ' · ' + item.percent + '% · ' + game.price + ' грн';
      btn.addEventListener('click', function () { showGame(item); });
      li.appendChild(btn);
      altList.appendChild(li);
    });
  }

  // Дані каталогу (data.json) завантажуються асинхронно; результат показуємо лише після завантаження
  async function showResult() {
    nextBtn.disabled = true;
    let ranked;
    try {
      await G.load();
      ranked = G.recommend(collectAnswers());
    } catch (err) {
      console.error(err);
      showError('Не вдалося завантажити каталог ігор. Перевірте з’єднання і натисніть «Показати результат» ще раз.');
      nextBtn.disabled = false;
      return;
    }
    nextBtn.disabled = false;
    showGame(ranked[0]);
    // альтернативи — лише ігри, що підходять за віком
    showAlternatives(ranked.slice(1).filter(function (r) { return r.ageOk; }).slice(0, 2));

    form.hidden = true;
    stepLabel.textContent = 'Готово!';
    setProgress(100);
    resultEl.hidden = false;
    resultEl.focus();
  }

  // «Далі» — це submit форми, тож працює і клавіша Enter
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!getAnswer(steps[current])) {
      showError('Оберіть один із варіантів відповіді.');
      return;
    }
    if (current < steps.length - 1) {
      current += 1;
      render();
      const firstOption = steps[current].querySelector('input');
      if (firstOption) firstOption.focus();
    } else {
      showResult();
    }
  });

  prevBtn.addEventListener('click', function () {
    if (current > 0) {
      current -= 1;
      render();
    }
  });

  // Прибираємо помилку, щойно користувач обрав відповідь
  form.addEventListener('change', function () { showError(''); });

  restartBtn.addEventListener('click', function () {
    form.reset();
    current = 0;
    resultEl.hidden = true;
    form.hidden = false;
    render();
    const firstOption = steps[0].querySelector('input');
    if (firstOption) firstOption.focus();
  });

  render();
  // Починаємо завантажувати data.json заздалегідь, поки користувач відповідає на питання
  G.load().catch(function () { /* помилку покажемо при спробі отримати результат */ });
})();
