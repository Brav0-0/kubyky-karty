// Сторінка оформлення підписки: підсумок замовлення + валідація форми оплати.
// Усе працює лише в браузері: дані форми (зокрема картки) нікуди не надсилаються і не зберігаються.
(function () {
  'use strict';

  const P = window.KubykyPricing;
  const form = document.getElementById('checkout-form');
  const content = document.getElementById('checkout-content');
  const emptyBlock = document.getElementById('checkout-empty');
  const successDialog = document.getElementById('checkout-success');

  if (!P || !form || !content || !emptyBlock || !successDialog) {
    console.warn('Сторінка оплати вимкнена: не знайдено потрібні елементи.');
    return;
  }

  // ---------- 1. Параметри замовлення з адреси (не довіряємо їм: перевіряємо ще раз) ----------
  // Два типи замовлення: ?game=catan (покупка гри) або ?months=..&box=.. (підписка)
  const params = new URLSearchParams(window.location.search);
  const G = window.KubykyGames;
  const game = G && params.has('game') ? G.byId(params.get('game')) : null;

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  if (game) {
    setupGameOrder(game);
    return;
  }

  const order = {
    months: params.get('months') || '',
    box: params.get('box') || '',
    express: params.get('express') === '1',
    gift: params.get('gift') === '1'
  };
  const price = P.calculate(order.months, order.box, order.express, order.gift);

  if (!price) {
    content.hidden = true;
    emptyBlock.hidden = false;
    return;
  }

  setupForm(function () { return price.total; }, 'Перший бокс приїде', 'Підписку оформлено!');

  function monthsWord(n) {
    const lastTwo = n % 100;
    const last = n % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return 'місяців';
    if (last === 1) return 'місяць';
    if (last >= 2 && last <= 4) return 'місяці';
    return 'місяців';
  }

  const months = Number(order.months);
  setText('sum-box', P.BOXES[order.box].name);
  setText('sum-months', months + ' ' + monthsWord(months));
  setText('sum-box-price', P.BOXES[order.box].price + ' грн/міс');
  setText('sum-express', order.express ? '+' + P.EXPRESS_PRICE + ' грн/міс' : 'ні');
  setText('sum-gift', order.gift ? '+' + P.GIFT_PRICE + ' грн' : 'ні');
  setText('sum-monthly', price.monthly + ' грн');
  setText('sum-total', price.total + ' грн');
  setText('co-submit-sum', price.total + ' грн');
  document.getElementById('sum-discount-row').hidden = months < P.DISCOUNT_FROM;

  // ---------- Покупка однієї гри без підписки ----------
  function setupGameOrder(g) {
    const MIN_QTY = 1;
    const MAX_QTY = 5;
    const qtyInput = document.getElementById('sum-qty');
    let qty = 1;

    document.title = 'Кубики & Карти - Купівля гри ' + g.name;
    setText('co-title', 'Купівля гри «' + g.name + '»');
    setText('co-back-text', 'Повернутися до каталогу');
    document.getElementById('co-back').href = 'index.html#catalog';
    document.getElementById('sum-change').href = 'index.html#catalog';
    document.getElementById('sum-change').lastChild.textContent = ' Обрати іншу гру';
    document.getElementById('sum-subscription').hidden = true;
    document.getElementById('sum-game').hidden = false;

    const img = document.getElementById('sum-game-img');
    img.src = G.imageUrl(g, 300);
    img.alt = 'Гра ' + g.name;
    setText('sum-game-name', g.name);
    setText('sum-game-meta', g.players + ' гравців · ' + g.duration + ' · ' + g.age);
    setText('sum-game-price', g.price + ' грн');

    // Кількість: лише ціле 1–5, інакше повертаємо останнє коректне значення (Fail-Safe)
    function updateTotal() {
      setText('sum-total', g.price * qty + ' грн');
      setText('co-submit-sum', g.price * qty + ' грн');
      qtyInput.value = String(qty);
      document.getElementById('sum-qty-minus').disabled = qty <= MIN_QTY;
      document.getElementById('sum-qty-plus').disabled = qty >= MAX_QTY;
    }
    document.getElementById('sum-qty-minus').addEventListener('click', function () {
      if (qty > MIN_QTY) { qty -= 1; updateTotal(); }
    });
    document.getElementById('sum-qty-plus').addEventListener('click', function () {
      if (qty < MAX_QTY) { qty += 1; updateTotal(); }
    });
    qtyInput.addEventListener('input', function () {
      const n = Number(qtyInput.value.replace(/\D/g, ''));
      if (Number.isInteger(n) && n >= MIN_QTY && n <= MAX_QTY) qty = n;
    });
    qtyInput.addEventListener('blur', updateTotal);
    updateTotal();

    setupForm(function () { return g.price * qty; }, 'Гра «' + g.name + '» приїде', 'Замовлення оформлено!');
  }

  // ---------- 2. Форма: правила перевірки полів, маски, надсилання ----------
  function setupForm(getTotal, deliveryText, successTitle) {
  const NAME_RE = /^[A-Za-zА-ЩЬЮЯҐЄІЇа-щьюяґєії'’\- ]{2,40}$/;

  function luhnOk(digits) {
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      let d = Number(digits[digits.length - 1 - i]);
      if (i % 2 === 1) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    return sum % 10 === 0;
  }

  // Кожне правило повертає '' (все добре) або зрозуміле повідомлення для користувача
  const rules = {
    'co-last-name': function (v) {
      if (!v) return 'Введіть прізвище.';
      return NAME_RE.test(v) ? '' : 'Прізвище може містити лише літери, апостроф і дефіс (від 2 символів).';
    },
    'co-first-name': function (v) {
      if (!v) return "Введіть ім'я.";
      return NAME_RE.test(v) ? '' : "Ім'я може містити лише літери, апостроф і дефіс (від 2 символів).";
    },
    'co-phone': function (v) {
      if (!v) return 'Введіть номер телефону.';
      return /^\+380\d{9}$/.test(v.replace(/[\s()-]/g, '')) ? '' : 'Формат номера: +380XXXXXXXXX.';
    },
    'co-email': function (v) {
      if (!v) return 'Введіть email.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Перевірте email, наприклад: name@mail.com.';
    },
    'co-city': function (v) {
      if (!v) return 'Введіть місто.';
      return NAME_RE.test(v) ? '' : 'Назва міста може містити лише літери.';
    },
    'co-branch': function (v) {
      if (!v) return 'Вкажіть номер відділення.';
      return /^\d{1,5}$/.test(v) && Number(v) > 0 ? '' : 'Номер відділення має бути числом більше 0.';
    },
    'co-card-number': function (v) {
      const digits = v.replace(/\s/g, '');
      if (!digits) return 'Введіть номер картки.';
      if (!/^\d{16}$/.test(digits)) return 'Номер картки має містити 16 цифр.';
      return luhnOk(digits) ? '' : 'Номер картки недійсний. Перевірте цифри.';
    },
    'co-card-expiry': function (v) {
      if (!v) return 'Введіть термін дії картки.';
      const m = /^(\d{2})\/(\d{2})$/.exec(v);
      if (!m) return 'Формат: ММ/РР, наприклад 08/28.';
      const month = Number(m[1]);
      const year = 2000 + Number(m[2]);
      if (month < 1 || month > 12) return 'Місяць має бути від 01 до 12.';
      const now = new Date();
      const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
      if (expired) return 'Термін дії картки минув.';
      return year > now.getFullYear() + 15 ? 'Перевірте рік терміну дії.' : '';
    },
    'co-card-cvv': function (v) {
      if (!v) return 'Введіть CVV.';
      return /^\d{3}$/.test(v) ? '' : 'CVV — це 3 цифри на звороті картки.';
    },
    'co-card-holder': function (v) {
      if (!v) return "Введіть ім'я власника картки.";
      return /^[A-Za-z][A-Za-z .'-]{1,39}$/.test(v) ? '' : "Ім'я власника вводиться латиницею, як на картці.";
    }
  };

  function validateField(id) {
    const input = document.getElementById(id);
    const errorEl = document.getElementById(id + '-error');
    if (!input || !errorEl) return true;
    const message = rules[id](input.value.trim());
    const ok = message === '';
    errorEl.textContent = message;
    errorEl.classList.toggle('hidden', ok);
    input.setAttribute('aria-invalid', String(!ok));
    input.classList.toggle('border-red-500', !ok);
    input.classList.toggle('border-gray-300', ok);
    return ok;
  }

  function validateAgreement() {
    const box = document.getElementById('co-agree');
    const errorEl = document.getElementById('co-agree-error');
    const ok = box.checked;
    errorEl.textContent = ok ? '' : 'Потрібна ваша згода з умовами оферти.';
    errorEl.classList.toggle('hidden', ok);
    box.setAttribute('aria-invalid', String(!ok));
    return ok;
  }

  // ---------- 3. Маски введення (форматування під час набору) ----------
  function onlyDigits(input, max) {
    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '').slice(0, max);
    });
  }

  const cardInput = document.getElementById('co-card-number');
  const brandIcon = document.getElementById('co-card-brand');
  cardInput.addEventListener('input', function () {
    const digits = cardInput.value.replace(/\D/g, '').slice(0, 16);
    cardInput.value = digits.replace(/(\d{4})(?=\d)/g, '$1 '); // 0000 0000 0000 0000
    let icon = 'fa-regular fa-credit-card';
    if (/^4/.test(digits)) icon = 'fa-brands fa-cc-visa';
    else if (/^(5[1-5]|2[2-7])/.test(digits)) icon = 'fa-brands fa-cc-mastercard';
    brandIcon.className = icon + ' pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400';
  });

  const expiryInput = document.getElementById('co-card-expiry');
  expiryInput.addEventListener('input', function (e) {
    let digits = expiryInput.value.replace(/\D/g, '').slice(0, 4);
    // при стиранні не додаємо «/» знову
    if (digits.length >= 3 || (digits.length === 2 && e.inputType !== 'deleteContentBackward')) {
      digits = digits.slice(0, 2) + '/' + digits.slice(2);
    }
    expiryInput.value = digits;
  });

  onlyDigits(document.getElementById('co-card-cvv'), 3);
  onlyDigits(document.getElementById('co-branch'), 5);

  const holderInput = document.getElementById('co-card-holder');
  holderInput.addEventListener('input', function () {
    holderInput.value = holderInput.value.toUpperCase();
  });

  // Перевірка поля, коли користувач з нього виходить, і повторна — під час виправлення
  Object.keys(rules).forEach(function (id) {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', function () { validateField(id); });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') validateField(id);
    });
  });
  document.getElementById('co-agree').addEventListener('change', validateAgreement);

  // ---------- 4. Надсилання ----------
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const results = Object.keys(rules).map(validateField);
    const agreeOk = validateAgreement();
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (results.indexOf(false) !== -1 || !agreeOk) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const orderNo = 'KK-' + Math.floor(100000 + Math.random() * 900000);
    setText('success-title', successTitle);
    setText('success-what', deliveryText);
    setText('success-name', document.getElementById('co-first-name').value.trim());
    setText('success-order', '№' + orderNo);
    setText('success-sum', getTotal() + ' грн');
    setText('success-branch', document.getElementById('co-branch').value.trim());
    setText('success-city', document.getElementById('co-city').value.trim());

    // Дані картки одразу стираємо з полів — вони ніде не зберігаються
    ['co-card-number', 'co-card-expiry', 'co-card-cvv'].forEach(function (id) {
      document.getElementById(id).value = '';
    });

    successDialog.showModal();
  });
  } // кінець setupForm
})();
