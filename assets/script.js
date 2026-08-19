/* ================================================================
   5ZVEZD.BY — логика компонентов (ванильный JS, без jQuery)
   Модульные секции для лёгкого переноса в WP-тему.
   ================================================================ */

(function () {
  'use strict';

  /* ---------- 0. Хелперы ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = (n) => Number(n).toLocaleString('ru-RU');
  const plural = (n, f) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return f[0];
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return f[1];
    return f[2];
  };

  /* ================================================================
     0.1. ФОЛЛБЕК ИЗОБРАЖЕНИЙ
     Если стоковый сервер недоступен — подставляем тематическую
     SVG-заглушку (data-URI, 0 запросов, грузится мгновенно).
     Тип заглушки задаётся атрибутом data-ph: city|house|sea|biz
     ================================================================ */
  const PH_SVG = {
    city: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#002B4B'/><stop offset='1' stop-color='#00729E'/></linearGradient></defs><rect width='640' height='480' fill='url(#g)'/><g fill='rgba(255,255,255,.14)'><rect x='70' y='200' width='90' height='280'/><rect x='190' y='140' width='110' height='340'/><rect x='330' y='230' width='80' height='250'/><rect x='440' y='170' width='120' height='310'/></g><g fill='rgba(212,160,23,.85)'><circle cx='540' cy='80' r='5'/><circle cx='556' cy='80' r='4'/><circle cx='570' cy='80' r='3'/><circle cx='582' cy='80' r='2.5'/><circle cx='592' cy='80' r='2'/></g><text x='320' y='430' font-family='Arial' font-size='20' fill='rgba(255,255,255,.6)' text-anchor='middle'>5 ЗВЁЗД · недвижимость Минска</text></svg>",
    house: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#0B3D2E'/><stop offset='1' stop-color='#002B4B'/></linearGradient></defs><rect width='640' height='480' fill='url(#g)'/><path d='M200 300l120-110 120 110v130H200z' fill='rgba(255,255,255,.16)'/><rect x='290' y='330' width='60' height='100' fill='rgba(212,160,23,.8)'/><circle cx='110' cy='100' r='40' fill='rgba(212,160,23,.5)'/><text x='320' y='460' font-family='Arial' font-size='20' fill='rgba(255,255,255,.6)' text-anchor='middle'>Загородная недвижимость · МКАД + 50 км</text></svg>",
    sea: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#00AEEF'/><stop offset='1' stop-color='#002B4B'/></linearGradient></defs><rect width='640' height='480' fill='url(#g)'/><circle cx='500' cy='110' r='46' fill='rgba(212,160,23,.9)'/><path d='M0 300q80-24 160 0t160 0 160 0 160 0v180H0z' fill='rgba(255,255,255,.14)'/><path d='M0 330q80-20 160 0t160 0 160 0 160 0v150H0z' fill='rgba(255,255,255,.10)'/><text x='320' y='450' font-family='Arial' font-size='20' fill='rgba(255,255,255,.7)' text-anchor='middle'>Северный Кипр · эксклюзив 5 ЗВЁЗД</text></svg>",
    biz: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#001D33'/><stop offset='1' stop-color='#002B4B'/></linearGradient></defs><rect width='640' height='480' fill='url(#g)'/><g fill='rgba(212,160,23,.8)'><rect x='150' y='300' width='60' height='120'/><rect x='240' y='250' width='60' height='170'/><rect x='330' y='200' width='60' height='220'/><rect x='420' y='150' width='60' height='270'/></g><text x='320' y='110' font-family='Arial' font-size='20' fill='rgba(255,255,255,.6)' text-anchor='middle'>Готовый бизнес · конфиденциально</text></svg>"
  };
  const phUri = (type) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(PH_SVG[type] || PH_SVG.city);

  // Подмена при ошибке загрузки (ловим и всплывающие ошибки img)
  document.addEventListener('error', (e) => {
    const el = e.target;
    if (el.tagName === 'IMG' && !el.dataset.phDone) {
      el.dataset.phDone = '1';
      el.src = phUri(el.dataset.ph);
    }
  }, true);

  // Проверяем изображения, которые не успели загрузиться до старта JS
  const applyFallbacks = () => {
    $$('img').forEach((img) => {
      if (img.complete && img.naturalWidth === 0 && !img.dataset.phDone) {
        img.dataset.phDone = '1';
        img.src = phUri(img.dataset.ph);
      }
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFallbacks);
  } else {
    applyFallbacks();
  }

  /* ================================================================
     1. ШАПКА: тень при прокрутке
     ================================================================ */
  const header = $('#siteHeader');
  const onScrollHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ================================================================
     2. STICKY-ПОИСК: тень при «прилипании»
     ================================================================ */
  const quickSearch = $('#quickSearch');
  const sentinel = $('#heroSentinel');
  if (sentinel && quickSearch) {
    new IntersectionObserver(([entry]) => {
      quickSearch.classList.toggle('is-stuck', !entry.isIntersecting);
    }).observe(sentinel);
  }

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
     4. СЧЁТЧИКИ СТАТИСТИКИ
     ================================================================ */
  const counters = $$('.js-count');
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    if (REDUCED) { el.textContent = fmt(target) + suffix; return; }
    const t0 = performance.now(), dur = 1300;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3)))) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => cio.observe(el));
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

  /* ================================================================
     6. ВКЛАДКИ ПОИСКА
     ================================================================ */
  const searchForm = $('#heroSearchForm');
  const searchInput = $('#searchQuery');
  const searchBtnLabel = $('#searchBtnLabel');
  const TAB_COPY = {
    buy:      { ph: 'Район Минска, ЖК, улица, метро…',       btn: 'Найти' },
    rent:     { ph: 'Район или станция метро…',              btn: 'Снять' },
    invest:   { ph: 'Бюджет инвестиций, USD…',               btn: 'Рассчитать' },
    business: { ph: 'Тип бизнеса: кафе, салон, СТО…',        btn: 'Оценить' }
  };
  $$('.search-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.search-tab').forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const mode = tab.dataset.mode;
      searchForm.dataset.mode = mode;
      searchInput.placeholder = TAB_COPY[mode].ph;
      searchBtnLabel.textContent = TAB_COPY[mode].btn;
    });
  });

  $$('.js-chip').forEach((chip) => {
    chip.addEventListener('click', () => chip.classList.toggle('is-active'));
  });

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $('#catalog').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
  });

  /* ================================================================
     7. КАРУСЕЛЬ «ГОРЯЧИЕ ПРЕДЛОЖЕНИЯ»
     ================================================================ */
  const hotViewport = $('#hotViewport');
  if (hotViewport) {
    const track = $('#hotTrack');
    const slides = $$('.hot-slide', track);
    const dotsWrap = $('#hotDots');
    const GAP = 20;

    const stepWidth = () => slides[0].offsetWidth + GAP;
    const visibleCount = () => Math.max(1, Math.floor(hotViewport.clientWidth / stepWidth()));
    const pagesCount = () => Math.ceil(slides.length / visibleCount());
    const currentPage = () => Math.min(pagesCount() - 1, Math.round(hotViewport.scrollLeft / (stepWidth() * visibleCount())));

    const renderDots = () => {
      dotsWrap.innerHTML = '';
      for (let i = 0; i < pagesCount(); i++) {
        const dot = document.createElement('button');
        dot.className = 'hot-dot' + (i === currentPage() ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Страница карусели ' + (i + 1));
        dot.addEventListener('click', () => {
          hotViewport.scrollTo({ left: i * stepWidth() * visibleCount(), behavior: REDUCED ? 'auto' : 'smooth' });
        });
        dotsWrap.appendChild(dot);
      }
    };
    const updateDots = () => {
      const cur = currentPage();
      $$('.hot-dot', dotsWrap).forEach((d, i) => d.classList.toggle('is-active', i === cur));
    };

    renderDots();
    hotViewport.addEventListener('scroll', updateDots, { passive: true });
    window.addEventListener('resize', renderDots);

    const scrollToPage = (page) => {
      const maxPage = pagesCount() - 1;
      const target = page > maxPage ? 0 : page < 0 ? maxPage : page;
      hotViewport.scrollTo({ left: target * stepWidth() * visibleCount(), behavior: REDUCED ? 'auto' : 'smooth' });
    };

    $('#hotNext').addEventListener('click', () => scrollToPage(currentPage() + 1));
    $('#hotPrev').addEventListener('click', () => scrollToPage(currentPage() - 1));

    // Автопрокрутка 4 с, пауза при взаимодействии
    let timer = null;
    const start = () => { if (REDUCED || timer) return; timer = setInterval(() => scrollToPage(currentPage() + 1), 4000); };
    const stop = () => { clearInterval(timer); timer = null; };
    start();
    hotViewport.addEventListener('pointerenter', stop);
    hotViewport.addEventListener('pointerleave', start);
    hotViewport.addEventListener('focusin', stop);
    hotViewport.addEventListener('focusout', start);
  }

  /* ================================================================
     8. КАТАЛОГ: фильтры + имитация подгрузки
     ================================================================ */
  const grid = $('#catalogGrid');
  const TOTAL_CATALOG = 14;
  const counterEl = $('#catalogCounter');
  const emptyEl = $('#catalogEmpty');
  const btnMore = $('#btnMore');

  // Данные «подгрузки» — в WP это ответ REST /wp-json/wp/v2/property
  const EXTRA_CARDS = [
    { id: 107, cat: 'share',      badge: '',             badgeCls: '',            ph: 'city',  img: 'minsk-share-zavodskoy',      catLabel: 'Доли · Минск',   stars: '★★★☆☆', rate: '3.6', title: 'Доля 1/2 в 2-комн. квартире', loc: 'Заводской р-н · раздельные лицевые счета', spec: ['1/2 доли', '52 м² общ.', '2/5 эт.'], price: '$27 000',  area: '26', rooms: 'доля 1/2', district: 'Заводской', year: '1978' },
    { id: 108, cat: 'flat',       badge: 'Новостройка',  badgeCls: 'badge-navy',  ph: 'city',  img: 'minsk-grushevka-newbuild',   catLabel: 'Квартиры · Минск', stars: '★★★★☆', rate: '4.4', title: '1-комн., ЖК «Грушевский сквер»', loc: 'Московский р-н · м. Грушевка', spec: ['42 м²', '1 комн.', '12/16 эт.'], price: '$68 900', area: '42', rooms: '1 комн.', district: 'Московский', year: '2023' },
    { id: 109, cat: 'house',      badge: '',             badgeCls: '',            ph: 'house', img: 'dacha-borovaya-snt-minsk',   catLabel: 'Дома и дачи',   stars: '★★★☆☆', rate: '3.8', title: 'Дача, СТ «Боровая»',            loc: '12 км от МКАД · лес рядом', spec: ['68 м²', '5 сот.', 'баня'], price: '$54 000', area: '68', rooms: 'дача', district: 'Минский р-н', year: '2005' },
    { id: 110, cat: 'commercial', badge: 'Аренда',       badgeCls: 'badge-terra', ph: 'city',  img: 'minsk-street-retail-rent',   catLabel: 'Коммерческая',  stars: '★★★★☆', rate: '4.2', title: 'Помещение 120 м², ул. Маяковского', loc: 'Октябрьский р-н · 1-я линия', spec: ['120 м²', 'стрит-ритейл', 'витрины'], price: '12 €/м²/мес', area: '120', rooms: 'свободная', district: 'Октябрьский', year: '2012' },
    { id: 111, cat: 'cyprus',     badge: 'VIP · Кипр',   badgeCls: 'badge-gold',  ph: 'sea',   img: 'girne-villa-pool-seaview',   catLabel: 'Северный Кипр', stars: '★★★★★', rate: '5.0', title: 'Вилла с бассейном, Гирне',      loc: 'Эсентепе · вид на море', spec: ['210 м²', '3 спальни', 'бассейн'], price: '€345 000', area: '210', rooms: '3 спальни', district: 'Гирне, Кипр', year: '2023' },
    { id: 112, cat: 'business',   badge: 'NDA',          badgeCls: 'badge-navy',  ph: 'biz',   img: 'minsk-cafe-central-sale',    catLabel: 'Готовый бизнес', stars: '★★★★☆', rate: '4.6', title: 'Кафе с арендой, Центральный',   loc: 'прибыль 12 000 BYN/мес', spec: ['6 лет', '38 мест', 'оборудование'], price: '$95 000', area: '140', rooms: 'кафе', district: 'Центральный', year: '2020' },
    { id: 113, cat: 'flat',       badge: 'Эксклюзив',    badgeCls: 'badge-gold',  ph: 'city',  img: 'minsk-lebiazhy-waterfront',  catLabel: 'Квартиры · Минск', stars: '★★★★★', rate: '4.9', title: '4-комн., ул. Ратомская (Лебяжий)', loc: 'Центральный р-н · у водохранилища', spec: ['118 м²', '4 комн.', '15/24 эт.'], price: '$197 000', area: '118', rooms: '4 комн.', district: 'Центральный', year: '2020' },
    { id: 114, cat: 'plot',       badge: '',             badgeCls: '',            ph: 'house', img: 'plot-minskoe-more-garden',   catLabel: 'Участки',       stars: '★★★★☆', rate: '4.3', title: 'Садовый участок, Минское море',  loc: '16 км от МКАД · вода рядом', spec: ['8 сот.', 'садовое', 'электричество'], price: '$22 500', area: '8 сот.', rooms: 'садовое', district: 'Минский р-н', year: '—' }
  ];

  // Сборка карточки (аналог template-parts/card-object.php)
  function createCard(d) {
    const wrap = document.createElement('div');
    wrap.className = 'col-sm-6 col-xl-4 catalog-item';
    wrap.dataset.cat = d.cat;
    wrap.innerHTML =
      '<article class="obj-card reveal is-in" data-id="' + d.id + '" data-title="' + d.title + '" data-price="' + d.price +
      '" data-area="' + d.area + '" data-rooms="' + d.rooms + '" data-district="' + d.district + '" data-year="' + d.year + '" data-rating="' + d.rate + '">' +
        '<div class="obj-card__media">' +
          '<img src="https://picsum.photos/seed/' + d.img + '/640/480" width="640" height="480" loading="lazy" decoding="async" data-ph="' + d.ph + '" alt="' + d.title + '">' +
          (d.badge ? '<span class="' + d.badgeCls + '">' + d.badge + '</span>' : '') +
          '<div class="obj-card__acts">' +
            '<button class="obj-act js-fav" type="button" aria-pressed="false" aria-label="Добавить в избранное"><i class="bi bi-heart"></i></button>' +
            '<button class="obj-act js-compare" type="button" aria-pressed="false" aria-label="Добавить к сравнению"><i class="bi bi-columns-gap"></i></button>' +
          '</div>' +
        '</div>' +
        '<div class="obj-card__body">' +
          '<div class="obj-meta"><span class="obj-cat">' + d.catLabel + '</span><span class="stars" aria-label="Рейтинг ' + d.rate + ' из 5">' + d.stars + ' <b>' + d.rate + '</b></span></div>' +
          '<h3 class="obj-title"><a href="#">' + d.title + '</a></h3>' +
          '<p class="obj-loc"><i class="bi bi-geo-alt"></i> ' + d.loc + '</p>' +
          '<ul class="obj-spec">' + d.spec.map((s) => '<li>' + s + '</li>').join('') + '</ul>' +
          '<div class="obj-foot"><span class="obj-price">' + d.price + '</span><a class="obj-link" href="#">Подробнее <i class="bi bi-arrow-right"></i></a></div>' +
        '</div>' +
      '</article>';
    // Фоллбек на случай, если src уже сломан к моменту вставки
    const img = wrap.querySelector('img');
    img.addEventListener('error', () => {
      if (!img.dataset.phDone) { img.dataset.phDone = '1'; img.src = phUri(d.ph); }
    }, { once: true });
    return wrap;
  }

  const visibleCount = () => $$('.catalog-item:not(.is-hidden)', grid).length;
  const updateCounter = () => {
    counterEl.textContent = 'Показано ' + visibleCount() + ' из ' + TOTAL_CATALOG;
    emptyEl.hidden = visibleCount() !== 0;
  };

  // Фильтрация по категориям
  $('#filterChips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('#filterChips .chip').forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    const filter = chip.dataset.filter;
    $$('.catalog-item', grid).forEach((item) => {
      item.classList.toggle('is-hidden', filter !== 'all' && item.dataset.cat !== filter);
    });
    updateCounter();
  });

  // Имитация подгрузки: кнопка «Показать ещё»
  btnMore.addEventListener('click', () => {
    const batch = EXTRA_CARDS.splice(0, 4);
    batch.forEach((d) => grid.appendChild(createCard(d)));

    const active = $('#filterChips .chip.is-active');
    if (active && active.dataset.filter !== 'all') {
      $$('.catalog-item', grid).forEach((item) => {
        if (item.dataset.cat !== active.dataset.filter) item.classList.add('is-hidden');
      });
    }
    updateCounter();

    if (EXTRA_CARDS.length === 0) {
      btnMore.disabled = true;
      btnMore.innerHTML = 'Каталог обновляется — загляните завтра <i class="bi bi-stars"></i>';
    }
  });

  /* ================================================================
     9. ИЗБРАННОЕ
     ================================================================ */
  const favCountEl = $('#favCount');
  document.addEventListener('click', (e) => {
    const favBtn = e.target.closest('.js-fav');
    if (!favBtn) return;
    const on = favBtn.classList.toggle('is-fav');
    favBtn.setAttribute('aria-pressed', String(on));
    favCountEl.textContent = $$('.js-fav.is-fav').length;
  });

  /* ================================================================
     10. СРАВНЕНИЕ ОБЪЕКТОВ (до 4)
     ================================================================ */
  const compareSet = new Map();
  const compareBar = $('#compareBar');
  const compareBarText = $('#compareBarText');
  const cmpBadge = $('#cmpBadge');
  const compareTable = $('#compareTable');
  const MAX_COMPARE = 4;

  const updateCompareBar = () => {
    const n = compareSet.size;
    compareBar.classList.toggle('is-open', n > 0);
    cmpBadge.textContent = n;
    compareBarText.textContent = n + ' ' + plural(n, ['объект', 'объекта', 'объектов']);
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-compare');
    if (!btn) return;
    const card = btn.closest('.obj-card');
    const id = card.dataset.id;

    if (compareSet.has(id)) {
      compareSet.delete(id);
      btn.classList.remove('is-on');
      btn.setAttribute('aria-pressed', 'false');
    } else {
      if (compareSet.size >= MAX_COMPARE) {
        compareBarText.textContent = 'Максимум 4 объекта';
        setTimeout(updateCompareBar, 1600);
        return;
      }
      compareSet.set(id, { ...card.dataset });
      btn.classList.add('is-on');
      btn.setAttribute('aria-pressed', 'true');
    }
    updateCompareBar();
  });

  $$('.js-compare-clear').forEach((b) => b.addEventListener('click', () => {
    compareSet.clear();
    $$('.js-compare.is-on').forEach((x) => { x.classList.remove('is-on'); x.setAttribute('aria-pressed', 'false'); });
    updateCompareBar();
  }));

  // Таблица сравнения перед открытием модалки
  $('#compareModal').addEventListener('show.bs.modal', () => {
    const items = Array.from(compareSet.values());
    if (!items.length) {
      compareTable.innerHTML = '<tbody><tr><td class="text-muted py-4">Добавьте объекты кнопкой сравнения на карточках.</td></tr></tbody>';
      return;
    }
    const rows = [
      ['Цена', 'price'], ['Площадь', 'area'], ['Тип / комнатность', 'rooms'],
      ['Район / локация', 'district'], ['Год', 'year'], ['Рейтинг', 'rating']
    ];
    let html = '<thead><tr><th scope="col">Параметр</th>';
    items.forEach((it) => { html += '<th scope="col">' + it.title + '</th>'; });
    html += '</tr></thead><tbody>';
    rows.forEach(([label, key]) => {
      html += '<tr><th scope="row">' + label + '</th>';
      items.forEach((it) => {
        const val = key === 'area' ? it.area + ' м²' : key === 'rating' ? '★ ' + it.rating : it[key];
        html += '<td>' + (key === 'price' ? '<b>' + val + '</b>' : val) + '</td>';
      });
      html += '</tr>';
    });
    compareTable.innerHTML = html + '</tbody>';
  });

  /* ================================================================
     11. КАЛЬКУЛЯТОР КОМИССИИ
     ================================================================ */
  const commRange = $('#commRange');
  if (commRange) {
    const BYN_RATE = 3.27; // демо-курс; в WP — из опции темы
    const commVal = $('#commVal'), commValByn = $('#commValByn'), commRate = $('#commRate'), commFee = $('#commFee');
    const checks = { exclusive: $('#commExclusive'), alt: $('#commAlt'), urgent: $('#commUrgent') };

    const recalcCommission = () => {
      const price = parseInt(commRange.value, 10);
      let rate = 2.0;
      if (checks.exclusive.checked) rate -= 0.3;
      if (checks.alt.checked) rate += 0.3;
      if (checks.urgent.checked) rate += 0.5;

      const fee = price * rate / 100;
      commVal.textContent = '$' + fmt(price);
      commValByn.textContent = '≈ ' + fmt(Math.round(price * BYN_RATE)) + ' BYN';
      commRate.textContent = rate.toFixed(1).replace('.', ',') + '%';
      commFee.textContent = '$' + fmt(Math.round(fee));
    };

    commRange.addEventListener('input', recalcCommission);
    Object.values(checks).forEach((c) => c.addEventListener('change', recalcCommission));
    recalcCommission();
  }

  /* ================================================================
     12. ИНВЕСТ-КАЛЬКУЛЯТОР «МИНСК → КИПР»
     ================================================================ */
  const cyInput = $('#cyprusInput');
  if (cyInput) {
    const USD_TO_EUR = 0.92;
    const cyObject = $('#cyObject'), cyIncome = $('#cyIncome'), cyForecast = $('#cyForecast');
    const barDep = $('#barDep'), barCy = $('#barCy');

    const pickObject = (eur) => {
      if (eur < 75000)  return 'Студия на этапе котлована, Искеле';
      if (eur < 130000) return 'Апартаменты 1+1 у моря, Искеле';
      if (eur < 230000) return 'Апартаменты 2+1 или таунхаус, Гирне';
      return 'Вилла с бассейном, Гирне / Эсентепе';
    };

    const recalcCyprus = () => {
      const usd = Math.max(20000, parseInt(cyInput.value, 10) || 0);
      const eur = Math.round(usd * USD_TO_EUR);
      cyObject.textContent = pickObject(eur);
      cyIncome.textContent = '≈ €' + fmt(Math.round(eur * 0.07)) + ' / год';
      cyForecast.textContent = '≈ €' + fmt(eur * 2) + ' (×2)';
      // Ширины полос — только через CSS-классы (без инлайн-стилей)
      barDep.className = 'cmp-bar__fill cmp-bar__fill--dep wp-20';
      barCy.className = 'cmp-bar__fill cmp-bar__fill--cy wp-100';
    };

    cyInput.addEventListener('input', recalcCyprus);
    recalcCyprus();
  }

  /* ================================================================
     13. ЛЕНТА СДЕЛОК: фильтр по периоду
     ================================================================ */
  const dealsFilter = $('#dealsFilter');
  if (dealsFilter) {
    const RANK = { today: 1, week: 2, month: 3 };
    dealsFilter.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (!pill) return;
      $$('.pill', dealsFilter).forEach((p) => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      const limit = pill.dataset.period === 'all' ? Infinity : RANK[pill.dataset.period];
      $$('#dealsRow .deal-card').forEach((card) => {
        card.classList.toggle('is-hidden', RANK[card.dataset.period] > limit);
      });
    });
  }

  /* ================================================================
     14. ФОРМА ЗАЯВКИ (демо; в WP — CF7/WPForms)
     ================================================================ */
  const contactForm = $('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.classList.add('was-validated');
        return;
      }
      contactForm.classList.add('is-sent');
      contactForm.reset();
      contactForm.classList.remove('was-validated');
      $('#formSuccess').hidden = false;
    });
  }

  /* ================================================================
     15. МЕЛОЧИ
     ================================================================ */
  $('#yearNow').textContent = new Date().getFullYear();

})();
