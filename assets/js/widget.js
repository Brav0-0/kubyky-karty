// Калькулятор підписки «Кубики & Карти»
// ВЕРСІЯ 2: з валідацією та захистом від Edge Cases (QA-перевірено).
// Весь код в IIFE, щоб змінні не потрапляли в глобальну область.
(function () {
  'use strict';

  // ---------- DOM ----------
  const dialog = document.getElementById('subscription-dialog');
  const openBtn = document.getElementById('open-subscription');
  const closeBtn = document.getElementById('close-subscription');
  const form = document.getElementById('subscription-form');

  const monthsInput = document.getElementById('sub-months');
  const boxSelect = document.getElementById('sub-box');
  const expressCheckbox = document.getElementById('sub-express');
  const giftCheckbox = document.getElementById('sub-gift');

  const monthlyEl = document.getElementById('sub-monthly');
  const totalEl = document.getElementById('sub-total');
  const statusEl = document.getElementById('sub-status');
  const errorMonths = document.getElementById('error-months');
  const submitBtn = document.getElementById('sub-submit');

  const subModal = document.getElementById('subSuccessModal');
  const subModalSum = document.getElementById('subModalSum');
  const subModalClose = document.getElementById('subModalCloseBtn');

  // Захист від відсутніх DOM-елементів: віджет просто не запускається, сторінка не падає
  const required = {
    dialog, openBtn, closeBtn, form, monthsInput, boxSelect, expressCheckbox,
    giftCheckbox, monthlyEl, totalEl, errorMonths, submitBtn,
    subModal, subModalSum, subModalClose
  };
  const missing = Object.keys(required).filter(function (k) { return !required[k]; });
  if (missing.length > 0) {
    console.warn('Калькулятор підписки вимкнено, не знайдено елементи:', missing.join(', '));
    return;
  }

  // ---------- Бізнес-правила ----------
  const BOX_PRICES = { family: 500, party: 650, hardcore: 800 };
  const EXPRESS_PRICE = 100;   // грн на місяць
  const GIFT_PRICE = 150;      // грн одноразово
  const DISCOUNT_FROM = 6;     // місяців
  const DISCOUNT = 0.9;        // знижка 10%
  const MIN_MONTHS = 1;
  const MAX_MONTHS = 36;

  const RANGE_MSG = 'Введіть кількість місяців від ' + MIN_MONTHS + ' до ' + MAX_MONTHS + '.';

  // ---------- Валідація ----------
  function validateMonths() {
    const raw = monthsInput.value.trim();
    let message = '';

    if (raw === '') {
      message = RANGE_MSG;
    } else if (!/^\d+$/.test(raw)) {
      // відсікає "-5", "1e2", "2.5", "+3" тощо
      message = 'Кількість місяців має бути цілим числом без символів. ' + RANGE_MSG;
    } else {
      const n = Number(raw);
      if (n < MIN_MONTHS || n > MAX_MONTHS) {
        message = RANGE_MSG;
      }
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

  // ---------- Розрахунок ----------
  function calculate() {
    if (!validateMonths() || !Object.prototype.hasOwnProperty.call(BOX_PRICES, boxSelect.value)) {
      monthlyEl.textContent = '0 грн';
      totalEl.textContent = '0 грн';
      return false;
    }

    const months = parseInt(monthsInput.value, 10);
    const boxPrice = BOX_PRICES[boxSelect.value];
    const express = expressCheckbox.checked ? EXPRESS_PRICE : 0;
    const gift = giftCheckbox.checked ? GIFT_PRICE : 0;

    const monthly = boxPrice + express;
    let total = monthly * months;
    if (months >= DISCOUNT_FROM) {
      total = total * DISCOUNT;
    }
    total = Math.round(total + gift);

    monthlyEl.textContent = monthly + ' грн';
    totalEl.textContent = total + ' грн';
    return true;
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
  boxSelect.addEventListener('change', calculate);
  expressCheckbox.addEventListener('change', calculate);
  giftCheckbox.addEventListener('change', calculate);

  // ---------- Вікно успіху ----------
  function openSubSuccess(totalText) {
    subModalSum.textContent = totalText;
    subModal.classList.remove('hidden');
    subModal.classList.add('flex');
    subModalClose.focus();
  }

  function closeSubSuccess() {
    subModal.classList.add('hidden');
    subModal.classList.remove('flex');
    form.reset();
    calculate();
  }

  subModalClose.addEventListener('click', closeSubSuccess);
  subModal.addEventListener('click', function (e) {
    if (e.target === subModal) {
      closeSubSuccess();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !subModal.classList.contains('hidden')) {
      closeSubSuccess();
    }
  });

  // ---------- Оформлення підписки ----------
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!calculate()) {
      monthsInput.focus();
      return;               // вікно успіху не відкриється для некоректних даних
    }

    const totalText = totalEl.textContent;
    dialog.close();         // калькулятор у top layer, тому закриваємо його
    openSubSuccess(totalText);
  });

  // ---------- Відкриття та закриття калькулятора ----------
  openBtn.addEventListener('click', function () {
    if (statusEl) {
      statusEl.textContent = '';
    }
    calculate();
    dialog.showModal();
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

  calculate();
})();