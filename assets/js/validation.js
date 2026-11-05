/**
 * Лабораторна робота: Клієнтська валідація вебформ
 * Файл: validation.js
 * Стек: Vanilla JavaScript + Tailwind CSS
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Елементи форми та полів
    const form = document.getElementById('feedbackForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    const agreementInput = document.getElementById('agreement');

    // Елементи модального вікна
    const modal = document.getElementById('successModal');
    const modalCard = document.getElementById('modalCard');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    if (!form) return;

    // 2. Регулярні вирази (RegEx) та конфігурація
    // Ім'я: мінімум 2 символи, літери (включаючи українські), дефіс, пробіл, апостроф
    const REGEX_NAME = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ'’\s\-]{2,}$/;

    // Email: стандартний формат user@domain.tld
    const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Телефон: строго український формат +380XXXXXXXXX (рівно 9 цифр після коду)
    const REGEX_PHONE = /^\+380\d{9}$/;

    // Класи станів Tailwind CSS
    const UI_CLASSES = {
        errorBorder: ['border-red-500', 'focus:border-red-500', 'focus:ring-red-500', 'ring-1', 'ring-red-500'],
        successBorder: ['border-emerald-500', 'focus:border-emerald-500', 'focus:ring-emerald-500', 'ring-1', 'ring-emerald-500'],
        normalBorder: ['border-gray-300', 'focus:border-[#D92534]', 'focus:ring-[#D92534]']
    };

    // 3. Допоміжні UI-функції відображення станів
    const showError = (input, errorElId, message) => {
        const errorEl = document.getElementById(errorElId);
        
        // Оновлюємо стилі поля (червона рамка)
        input.classList.remove(...UI_CLASSES.normalBorder, ...UI_CLASSES.successBorder);
        input.classList.add(...UI_CLASSES.errorBorder);
        input.setAttribute('aria-invalid', 'true');

        // Показуємо повідомлення про помилку
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
        }
    };

    const showSuccess = (input, errorElId) => {
        const errorEl = document.getElementById(errorElId);

        // Оновлюємо стилі поля (зелена рамка)
        input.classList.remove(...UI_CLASSES.normalBorder, ...UI_CLASSES.errorBorder);
        input.classList.add(...UI_CLASSES.successBorder);
        input.setAttribute('aria-invalid', 'false');

        // Ховаємо повідомлення про помилку
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.add('hidden');
        }
    };

    const resetFieldUI = (input, errorElId) => {
        const errorEl = document.getElementById(errorElId);
        input.classList.remove(...UI_CLASSES.errorBorder, ...UI_CLASSES.successBorder);
        input.classList.add(...UI_CLASSES.normalBorder);
        input.setAttribute('aria-invalid', 'false');

        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.add('hidden');
        }
    };

    // 4. Окремі функції валідації полів
    const validateName = () => {
        const val = nameInput.value.trim();
        if (!val) {
            showError(nameInput, 'nameError', "Будь ласка, введіть ваше ім'я.");
            return false;
        }
        if (val.length < 2) {
            showError(nameInput, 'nameError', "Ім'я повинно містити щонайменше 2 символи.");
            return false;
        }
        if (!REGEX_NAME.test(val)) {
            showError(nameInput, 'nameError', "Ім'я може містити лише літери, дефіс або апостроф.");
            return false;
        }
        showSuccess(nameInput, 'nameError');
        return true;
    };

    const validateEmail = () => {
        const val = emailInput.value.trim();
        if (!val) {
            showError(emailInput, 'emailError', 'Будь ласка, введіть email.');
            return false;
        }
        if (!REGEX_EMAIL.test(val)) {
            showError(emailInput, 'emailError', 'Введіть коректну електронну адресу (наприклад, user@gmail.com).');
            return false;
        }
        showSuccess(emailInput, 'emailError');
        return true;
    };

    const validatePhone = () => {
        // Очищаємо від зайвих випадкових пробілів
        let val = phoneInput.value.trim().replace(/\s+/g, '');

        // Розумний UX: якщо користувач почав вводити з 0 (наприклад, 050...), пропонуємо/додаємо +38
        if (val.startsWith('0') && val.length === 10) {
            val = '+38' + val;
            phoneInput.value = val;
        }

        if (!val) {
            showError(phoneInput, 'phoneError', 'Будь ласка, введіть номер телефону.');
            return false;
        }
        if (!REGEX_PHONE.test(val)) {
            showError(phoneInput, 'phoneError', 'Формат номера повинен бути: +380XXXXXXXXX (рівно 9 цифр після +380).');
            return false;
        }
        showSuccess(phoneInput, 'phoneError');
        return true;
    };

    const validateMessage = () => {
        const val = messageInput.value.trim();
        if (!val) {
            showError(messageInput, 'messageError', 'Будь ласка, напишіть текст повідомлення.');
            return false;
        }
        if (val.length < 10) {
            showError(messageInput, 'messageError', `Повідомлення занадто коротке (зараз ${val.length}/10 символів).`);
            return false;
        }
        showSuccess(messageInput, 'messageError');
        return true;
    };

    const validateAgreement = () => {
        if (!agreementInput.checked) {
            showError(agreementInput, 'agreementError', 'Необхідно дати згоду на обробку персональних даних.');
            return false;
        }
        showSuccess(agreementInput, 'agreementError');
        return true;
    };

    // 5. Динамічна валідація (blur та input)
    // Помилки не з'являються при першому завантаженні; активуються після blur або під час вводу після першої взаємодії
    const attachDynamicValidation = (input, validatorFn) => {
        let hasInteracted = false;

        input.addEventListener('blur', () => {
            hasInteracted = true;
            validatorFn();
        });

        input.addEventListener('input', () => {
            if (hasInteracted) {
                validatorFn();
            }
        });
    };

    attachDynamicValidation(nameInput, validateName);
    attachDynamicValidation(emailInput, validateEmail);
    attachDynamicValidation(phoneInput, validatePhone);
    attachDynamicValidation(messageInput, validateMessage);

    agreementInput.addEventListener('change', () => {
        validateAgreement();
    });

    // 6. Керування доступним модальним вікном
    const openModal = () => {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden'); // блокуємо скрол фону
        modalCloseBtn.focus(); // фокус на кнопку закриття для Accessibility
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    };

    // Закриття кліком по кнопці
    modalCloseBtn.addEventListener('click', closeModal);

    // Закриття кліком по фоновому оверлею (запобігаємо закриттю при кліку на картку)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Закриття клавішею Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // 7. Обробка відправки форми (Submit Event)
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Запобігаємо перезавантаженню сторінки

        // Перевіряємо всі поля
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isMessageValid = validateMessage();
        const isAgreementValid = validateAgreement();

        const isFormValid = isNameValid && isEmailValid && isPhoneValid && isMessageValid && isAgreementValid;

        if (isFormValid) {
            // Імітація успішного надсилання
            openModal();

            // Очищення форми
            form.reset();

            // Скидання UI рамок полів
            resetFieldUI(nameInput, 'nameError');
            resetFieldUI(emailInput, 'emailError');
            resetFieldUI(phoneInput, 'phoneError');
            resetFieldUI(messageInput, 'messageError');
            resetFieldUI(agreementInput, 'agreementError');
        } else {
            // UX-покращення: фокус на перше поле з помилкою
            const firstInvalid = form.querySelector('[aria-invalid="true"]');
            if (firstInvalid) {
                firstInvalid.focus();
            }
        }
    });
});