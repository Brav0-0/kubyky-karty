// Ініціалізація JS-бібліотек, підключених через CDN (Swiper, Fancybox, Typed.js)
document.addEventListener('DOMContentLoaded', function () {

  // 1. Typed.js: ефект друкування тексту в Hero-блоці
  if (document.querySelector('#typed-text') && typeof Typed !== 'undefined') {
    new Typed('#typed-text', {
      strings: [
        'Персональний підбір ігор для друзів з AI-підбором',
        'Ідеальний вечір за настільною грою',
        'Знайдіть свою гру за кілька хвилин'
      ],
      typeSpeed: 45,     // швидкість друку, мс
      backSpeed: 25,     // швидкість стирання, мс
      backDelay: 1800,   // пауза перед стиранням, мс
      loop: true
    });
  }

  // 2. Swiper.js: слайдер відгуків
  if (document.querySelector('.reviews-swiper') && typeof Swiper !== 'undefined') {
    new Swiper('.reviews-swiper', {
      loop: true,
      spaceBetween: 24,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true   // зупинка автопрогортання при наведенні миші
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      breakpoints: {
        320:  { slidesPerView: 1 },   // мобільні
        768:  { slidesPerView: 2 },   // планшети
        1024: { slidesPerView: 3 }    // десктопи
      }
    });
  }

  // 3. Fancybox v5: галерея зображень (один альбом через data-fancybox)
  if (typeof Fancybox !== 'undefined') {
    Fancybox.bind("[data-fancybox='games-gallery']", {
      Carousel: { transition: 'fade' },        // ефект переходу
      Images: { Panzoom: { maxScale: 3 } }     // зум до 3x
    });
  }

  // 4. Кнопка «Пройти квіз» у шапці: на головній — прокрутка до квізу, на інших сторінках — перехід
  document.querySelectorAll('.btn-quiz').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const quiz = document.getElementById('quiz');
      if (quiz) {
        quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.href = 'index.html#quiz';
      }
    });
  });

  // 5. Підписка на новини у футері (перевірка email без перезавантаження сторінки)
  document.querySelectorAll('footer form').forEach(function (form) {
    const input = form.querySelector('input[type="email"]');
    if (!input) return;
    const message = document.createElement('p');
    message.className = 'text-xs font-medium';
    message.setAttribute('role', 'status');
    input.closest('div').parentNode.appendChild(message);

    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = input.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      message.textContent = ok
        ? 'Дякуємо! Ви підписалися на новини: ' + email
        : 'Введіть коректний email, наприклад name@mail.com.';
      message.classList.toggle('text-emerald-400', ok);
      message.classList.toggle('text-red-400', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      if (ok) input.value = '';
    });
  });

  // 6. Вхід в акаунт: у localStorage браузера зберігається лише email, пароль нікуди не зберігається й не надсилається
  setupLogin();
});

function setupLogin() {
  'use strict';
  const buttons = document.querySelectorAll('.btn-login');
  if (buttons.length === 0) return;

  const STORAGE_KEY = 'kk-user-email';

  function readUser() {
    try { return localStorage.getItem(STORAGE_KEY) || ''; } catch (err) { return ''; }
  }
  function writeUser(email) {
    try {
      if (email) localStorage.setItem(STORAGE_KEY, email);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (err) { /* приватний режим: просто не запамʼятовуємо */ }
  }

  // Вікно входу створюється з JS, щоб не дублювати розмітку на кожній сторінці
  const dialog = document.createElement('dialog');
  dialog.id = 'login-dialog';
  dialog.setAttribute('aria-labelledby', 'login-title');
  dialog.className = 'm-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl p-0 shadow-2xl backdrop:bg-black/50';
  dialog.innerHTML =
    '<div class="p-6">' +
      '<div class="mb-5 flex items-start justify-between gap-4">' +
        '<h2 id="login-title" class="text-xl font-bold text-[#1A1D20]">Вхід в акаунт</h2>' +
        '<button type="button" data-close class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200" aria-label="Закрити"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>' +
      '</div>' +
      '<form data-login-form class="space-y-4" novalidate>' +
        '<div class="space-y-1">' +
          '<label for="login-email" class="block text-sm font-medium text-[#1A1D20]">Email</label>' +
          '<input id="login-email" type="email" autocomplete="email" placeholder="name@mail.com" class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#D92534] focus:outline-none focus:ring-1 focus:ring-[#D92534]">' +
        '</div>' +
        '<div class="space-y-1">' +
          '<label for="login-password" class="block text-sm font-medium text-[#1A1D20]">Пароль</label>' +
          '<input id="login-password" type="password" autocomplete="current-password" placeholder="Щонайменше 6 символів" class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#D92534] focus:outline-none focus:ring-1 focus:ring-[#D92534]">' +
        '</div>' +
        '<p data-login-error class="hidden text-xs font-medium text-red-600" role="alert"></p>' +
        '<button type="submit" class="min-h-[44px] w-full rounded-xl bg-[#D92534] px-4 py-3 font-semibold text-white hover:bg-[#b51d2a]">Увійти</button>' +
      '</form>' +
      '<div data-login-done hidden class="space-y-4 text-center">' +
        '<p class="text-[#1A1D20]">Ви увійшли як <strong data-login-user></strong></p>' +
        '<button type="button" data-logout class="min-h-[44px] w-full rounded-xl border border-solid border-gray-300 px-4 py-3 font-semibold text-[#1A1D20] hover:border-[#D92534]">Вийти</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(dialog);

  const form = dialog.querySelector('[data-login-form]');
  const done = dialog.querySelector('[data-login-done]');
  const errorEl = dialog.querySelector('[data-login-error]');
  const emailInput = dialog.querySelector('#login-email');
  const passwordInput = dialog.querySelector('#login-password');

  function render() {
    const email = readUser();
    buttons.forEach(function (btn) {
      btn.textContent = email ? email.split('@')[0] : 'Увійти';
      btn.title = email ? 'Акаунт: ' + email : '';
    });
    form.hidden = Boolean(email);
    done.hidden = !email;
    dialog.querySelector('[data-login-user]').textContent = email;
    dialog.querySelector('#login-title').textContent = email ? 'Ваш акаунт' : 'Вхід в акаунт';
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      errorEl.classList.add('hidden');
      dialog.showModal();
    });
  });
  dialog.querySelector('[data-close]').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = emailInput.value.trim();
    let message = '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) message = 'Введіть коректний email.';
    else if (passwordInput.value.length < 6) message = 'Пароль має містити щонайменше 6 символів.';

    errorEl.textContent = message;
    errorEl.classList.toggle('hidden', message === '');
    if (message) return;

    writeUser(email);
    passwordInput.value = '';
    render();
    dialog.close();
  });

  dialog.querySelector('[data-logout]').addEventListener('click', function () {
    writeUser('');
    form.reset();
    render();
    dialog.close();
  });

  render();
}