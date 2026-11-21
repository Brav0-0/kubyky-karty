// Спільні бізнес-правила підписки «Кубики & Карти».
// Використовуються калькулятором (widget.js), квізом (quiz.js) та сторінкою оплати (checkout.js),
// тому ціна рахується однаково всюди. Назовні виходить лише один обʼєкт KubykyPricing.
window.KubykyPricing = (function () {
  'use strict';

  const BOXES = {
    family:   { name: 'Сімейний',    price: 500 },
    party:    { name: 'Для вечірок', price: 650 },
    hardcore: { name: 'Хардкор',     price: 800 }
  };
  const EXPRESS_PRICE = 100;   // грн на місяць
  const GIFT_PRICE = 150;      // грн одноразово
  const DISCOUNT_FROM = 6;     // місяців
  const DISCOUNT = 0.9;        // знижка 10%
  const MIN_MONTHS = 1;
  const MAX_MONTHS = 36;

  function isValidBox(box) {
    return Object.prototype.hasOwnProperty.call(BOXES, box);
  }

  // Приймає рядок або число; true лише для цілого числа 1–36 без зайвих символів
  function isValidMonths(value) {
    const raw = String(value).trim();
    if (!/^\d+$/.test(raw)) return false;
    const n = Number(raw);
    return n >= MIN_MONTHS && n <= MAX_MONTHS;
  }

  // Повертає { monthly, total } або null, якщо дані некоректні (Fail-Safe: без NaN)
  function calculate(months, box, express, gift) {
    if (!isValidMonths(months) || !isValidBox(box)) return null;
    const m = Number(months);
    const monthly = BOXES[box].price + (express ? EXPRESS_PRICE : 0);
    let total = monthly * m;
    if (m >= DISCOUNT_FROM) total = total * DISCOUNT;
    total = Math.round(total + (gift ? GIFT_PRICE : 0));
    return { monthly: monthly, total: total };
  }

  return {
    BOXES: BOXES,
    EXPRESS_PRICE: EXPRESS_PRICE,
    GIFT_PRICE: GIFT_PRICE,
    DISCOUNT_FROM: DISCOUNT_FROM,
    MIN_MONTHS: MIN_MONTHS,
    MAX_MONTHS: MAX_MONTHS,
    isValidBox: isValidBox,
    isValidMonths: isValidMonths,
    calculate: calculate
  };
})();
