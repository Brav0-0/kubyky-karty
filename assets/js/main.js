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
});