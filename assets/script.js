/* ================================================================
   5ZVEZD.BY — логика компонентов (ванильный JS, без jQuery)
   Модульные секции для лёгкого переноса в WP-тему.
   ================================================================ */

(function () {
  'use strict';
  /* ================================================================
     3. REVEAL-АНИМАЦИЯ
     ================================================================ */
  if (!REDUCED && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('is-in'));
  }

  /* ================================================================
     5. HERO: live-счётчик просмотров
     ================================================================ */
  const watchNow = $('#watchNow');
  if (watchNow && !REDUCED) {
    let viewers = 14;
    setInterval(() => {
      viewers = Math.min(27, Math.max(8, viewers + Math.floor(Math.random() * 5) - 2));
      watchNow.textContent = viewers;
    }, 4000);
  }

})();
