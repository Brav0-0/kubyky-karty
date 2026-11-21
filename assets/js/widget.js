// Калькулятор підписки «Кубики & Карти»
// ВЕРСІЯ 3: валідація та захист від Edge Cases (QA-перевірено) + перехід до сторінки оплати.
// Весь код в IIFE, щоб змінні не потрапляли в глобальну область.
(function () {
  'use strict';

  const P = window.KubykyPricing;

  // ---------- DOM ----------
  const dialog = document.getElementById('subscription-dialog');
  const closeBtn = document.getElementById('close-subscription');
  const form = document.getElementById('subscription-form');

  const monthsInput = document.getElementById('sub-months');
  const boxGroup = document.getElementById('sub-box'); // fieldset з трьома radio-кнопками
  const expressCheckbox = document.getElementById('sub-express');
  const giftCheckbox = document.getElementById('sub-gift');

  const monthlyEl = document.getElementById('sub-monthly');
  const totalEl = document.getElementById('sub-total');
  const noteEl = document.getElementById('sub-note');
  const errorMonths = document.getElementById('error-months');
  const submitBtn = document.getElementById('sub-submit');

  // Захист від відсутніх DOM-елементів і правил цін: віджет не запускається, сторінка не падає
  const required = {
    pricing: P, dialog, closeBtn, form, monthsInput, boxGroup, expressCheckbox,
    giftCheckbox, monthlyEl, totalEl, errorMonths, submitBtn
  };
  const missing = Object.keys(required).filter(function (k) { return !required[k]; });
  if (missing.length > 0) {
    console.warn('Калькулятор підписки вимкнено, не знайдено:', missing.join(', '));
    return;
  }

  const RANGE_MSG = 'Введіть кількість місяців від ' + P.MIN_MONTHS + ' до ' + P.MAX_MONTHS + '.';

  // ---------- Валідація ----------
  function validateMonths() {
    const raw = monthsInput.value.trim();
    let message = '';

    if (raw === '') {
      message = RANGE_MSG;
    } else if (!/^\d+$/.test(raw)) {
      // відсікає "-5", "1e2", "2.5", "+3" тощо
      message = 'Кількість місяців має бути цілим числом без символів. ' + RANGE_MSG;
    } else if (!P.isValidMonths(raw)) {
      message = RANGE_MSG;
    }

    const isValid = message === '';
    errorMonths.textContent = message;
    errorMonths.classList.toggle('hidden', isValid);
    monthsInput.setAttribute('aria-invalid', String(!isValid));
    monthsInput.classList.toggle('border-red-500', !isValid);
    monthsInput.classList.toggle('border-gray-300', isValid);
    submitBtn.disabled = !isValid;
    submitBtn.classList.toggle('opacity-50', !isValid);
    submitBtn.classList.toggle('cursor-not-allowed', !isValid);
    return isValid;
  }

  // Значення обраної кнопки боксу ('' якщо нічого не обрано)
  function getBoxValue() {
    const checked = boxGroup.querySelector('input[name="box"]:checked');
    return checked ? checked.value : '';
  }

  function setBox(box) {
    if (!P.isValidBox(box)) return;
    const radio = boxGroup.querySelector('input[name="box"][value="' + box + '"]');
    if (radio) radio.checked = true;
  }

  // ---------- Розрахунок ----------
  function calculate() {
    const monthsOk = validateMonths();
    const result = monthsOk
      ? P.calculate(monthsInput.value, getBoxValue(), expressCheckbox.checked, giftCheckbox.checked)
      : null;

    if (!result) {
      monthlyEl.textContent = '0 грн';
      totalEl.textContent = '0 грн';
      return null;
    }
    monthlyEl.textContent = result.monthly + ' грн';
    totalEl.textContent = result.total + ' грн';
    return result;
  }

  // ---------- Захист поля місяців ----------
  // Забороняємо вводити символи, які не є цифрами
  monthsInput.addEventListener('keydown', function (e) {
    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
      e.preventDefault();
    }
  });

  // Очищаємо вставлений текст від усього, крім цифр
  monthsInput.addEventListener('paste', function (e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    monthsInput.value = text.replace(/\D/g, '');
    calculate();
  });

  // Автоматичний перерахунок при будь-якій зміні
  monthsInput.addEventListener('input', calculate);
  boxGroup.addEventListener('change', calculate); // подія change від radio спливає до fieldset
  expressCheckbox.addEventListener('change', calculate);
  giftCheckbox.addEventListener('change', calculate);

  // ---------- Оформлення: перехід на сторінку оплати ----------
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!calculate()) {
      monthsInput.focus();
      return;               // некоректні дані — на оплату не переходимо
    }

    // Параметри замовлення передаються в URL; checkout.js перевіряє їх ще раз
    const params = new URLSearchParams({
      months: monthsInput.value.trim(),
      box: getBoxValue(),
      express: expressCheckbox.checked ? '1' : '0',
      gift: giftCheckbox.checked ? '1' : '0'
    });
    window.location.href = 'checkout.html?' + params.toString();
  });

  // ---------- Відкриття та закриття калькулятора ----------
  // Будь-яка кнопка з атрибутом data-open-subscription відкриває калькулятор.
  // data-box — який бокс обрати, data-game — назва гри для підказки.
  function openCalculator(trigger) {
    const box = trigger.getAttribute('data-box');
    const game = trigger.getAttribute('data-game');
    setBox(box);

    if (noteEl) {
      if (game && P.isValidBox(box)) {
        noteEl.textContent = 'Гра «' + game + '» входить до боксу «' + P.BOXES[box].name + '». Його вже обрано нижче.';
        noteEl.classList.remove('hidden');
      } else {
        noteEl.textContent = '';
        noteEl.classList.add('hidden');
      }
    }

    calculate();
    dialog.showModal();
  }

  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-open-subscription]');
    if (trigger) openCalculator(trigger);
  });

  closeBtn.addEventListener('click', function () {
    dialog.close();
  });
  // Клік по затемненому фону закриває вікно
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) {
      dialog.close();
    }
  });

  // Відкриття калькулятора за посиланням index.html#subscribe (наприклад, з каталогу).
  // Необов'язкові параметри ?box=...&game=... обирають бокс і показують підказку про гру.
  if (window.location.hash === '#subscribe') {
    const params = new URLSearchParams(window.location.search);
    const fake = document.createElement('button');
    if (P.isValidBox(params.get('box'))) fake.setAttribute('data-box', params.get('box'));
    if (params.get('game')) fake.setAttribute('data-game', params.get('game').slice(0, 40));
    openCalculator(fake);
  }

  calculate();
})();
