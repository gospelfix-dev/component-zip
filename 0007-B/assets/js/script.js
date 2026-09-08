// ===== 고품격대패 랜딩페이지 시안B(카탈로그 라이트) — ES6 스크립트 =====
//
// 화면에 뿌리는 콘텐츠(경쟁력·메뉴·셀프바·수익·창업비용·매장 등)는 전부 data/content.json 에
// 있다. 이 파일에는 데이터를 두지 않는다 — 값을 바꾸려면 JSON 만 고치면 된다.
//
// ⚠ fetch 를 쓰므로 index.html 을 file:// 로 더블클릭해 열면 CORS 로 막힌다.
//   반드시 로컬 서버로 볼 것:  python3 -m http.server 8765
//
// A안(0007)과 콘텐츠 계약은 같지만, 인터랙션은 "절제된" 방향으로 다시 설계했다 — 스크롤
// 리빌은 전부 1회 재생이고, 문의 모달은 클릭으로만 연다(섹션 진입 시 자동으로 열리지 않는다).

const DATA_URL = 'data/content.json';

// ---- 공통 유틸 ----

/** 숫자를 3자리 콤마 형식으로 변환한다 */
const formatWon = (n) => n.toLocaleString('ko-KR');

/** 사용자 데이터를 HTML 에 넣기 전 이스케이프한다 (desc 계열 필드는 예외) */
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

/** id 로 엘리먼트를 찾아 html 을 채운다. 대상이 없으면 조용히 넘어간다 */
const fill = (id, html) => {
  const target = document.getElementById(id);
  if (target) target.innerHTML = html;
};

// ---- 섹션별 렌더러 ----

/** 01 경쟁력 — 특집 리스트 (드롭캡 넘버 + 헤어라인 룰) */
const renderCompetency = (list = []) => fill('featureList', list.map(({ num, title, desc }, i) => `
  <div class="feature-row">
    <div class="feature-num">0${i + 1}</div>
    <div class="feature-body">
      <div class="feature-eyebrow">${esc(num)}</div>
      <h3>${esc(title)}</h3>
      <p>${desc ?? ''}</p>
    </div>
  </div>`).join(''));

/** 01 경쟁력 — 하단 트러스트 배지 (사각/라운드사각, HACCP 인증배지 문법) */
const renderTrust = (list = []) => fill('trustGrid', list.map(({ label, desc }) => `
  <div class="trust-badge">
    <div class="trust-badge-icon"><span>${esc(label)}</span></div>
    <p>${esc(desc)}</p>
  </div>`).join(''));

/** 02 메뉴 — 원형 크롭 + 검정 링 ("검정 원형 접시" 실측 재현) */
const renderMeat = (list = []) => fill('meatGrid', list.map(({ image, name }) => `
  <figure class="meat-card">
    <div class="meat-frame"><img src="${esc(image)}" alt="${esc(name)}" loading="lazy"></div>
    <figcaption class="meat-label">${esc(name)}</figcaption>
  </figure>`).join(''));

/** 02 메뉴 — 셀프바 원형 크롭 + 브론즈 링 그리드 */
const renderSelfbar = (list = []) => fill('selfbarGrid', list.map(({ image, name }) => `
  <div class="selfbar-card">
    <div class="selfbar-frame"><img src="${esc(image)}" alt="${esc(name)}" loading="lazy"></div>
    <span class="selfbar-label">${esc(name)}</span>
  </div>`).join(''));

/** 03 수익분석 — 매장별 수익을 스탯카드 그리드로 렌더링한다. 매출 숫자는
 *  data-count-to 에 목표값을 심어두고 initScrollReveal 진입 시 0에서 카운트업한다. */
const renderProfitCards = (list = []) => fill('revenueList', list.map(({ name, open, salesWon, rate, tall }) => `
  <div class="revenue-card${tall ? ' revenue-card--feature' : ''}">
    <div class="revenue-date"><span>OPEN</span><span>${esc(open).replace(' 오픈', '')}</span></div>
    <div class="revenue-main">
      <div class="revenue-label">MONTHLY SALES</div>
      <div class="revenue-name">${esc(name)}</div>
    </div>
    <div class="revenue-figures">
      <span class="revenue-figure" data-count-to="${salesWon}">0</span>
      <span class="revenue-rate">순수익률 <b>${esc(rate)}%</b></span>
    </div>
  </div>`).join(''));

/** 04 창업비용 — 점선 리더 가격표 */
const renderCost = ({ head, rows = [] } = {}) => {
  const headRow = head ? `
    <div class="price-row price-row--head">
      <div class="price-label"><span class="price-item">${esc(head.item)}</span><span class="price-detail">${esc(head.detail)}</span></div>
      <span class="price-leader" aria-hidden="true"></span>
      <span class="price-value">${esc(head.price)}</span>
    </div>` : '';
  const body = rows.map(({ item, detail, price }) => `
    <div class="price-row">
      <div class="price-label"><span class="price-item">${esc(item)}</span><span class="price-detail">${esc(detail)}</span></div>
      <span class="price-leader" aria-hidden="true"></span>
      <span class="price-value">${esc(price)}</span>
    </div>`).join('');
  fill('costTable', headRow + body);
};

/** 05 매장위치 — 매장 카드 + 지점별 네이버 지도 버튼 */
const PIN_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';

/**
 * 05 매장위치 — 카드는 사진만 담고, 이름·오픈일·지도 버튼은 좌측 컬럼의 .store-caption 으로
 * 옮긴다(A안과 동일한 구조). 캐러셀이 넘어갈 때마다 initStoreSwiper 가 이 마크업을 다시 그린다.
 */
const storeCaptionHTML = ({ name, date, mapUrl }) => `
  <h4>${esc(name)}</h4>
  <div class="date">${esc(date)}</div>
  ${mapUrl ? `<a class="map-btn" href="${esc(mapUrl)}" target="_blank" rel="noopener noreferrer"
     aria-label="${esc(name)} 네이버 지도에서 보기 (새 창)">${PIN_SVG} 네이버 지도로 보기</a>` : ''}`;

const renderStores = (list = []) => {
  const track = document.getElementById('storeGrid');
  fill('storeGrid', list.map(({ name, date, image, mapUrl }) => `
    <div class="swiper-slide" data-name="${esc(name)}" data-date="${esc(date)}" data-map-url="${esc(mapUrl || '')}">
      <div class="store-card">
        <div class="photo"><img src="${esc(image)}" alt="${esc(name)}" loading="lazy"></div>
      </div>
    </div>`).join(''));
  if (track) track.dataset.count = String(list.length);
};

/** 05 매장위치 — 오픈일 확장 타임라인. stores[].date/name 을 그대로 재사용한다(신규 필드 없음).
 *  h2 카피("확장을 증명하는 기록")를 뒷받침하는 시각 요소가 없던 공백을 메운다. */
const renderStoreTimeline = (list = []) => fill('storeTimeline', `
  <div class="timeline-track">
    ${list.map(({ name, date }) => `
      <div class="timeline-node">
        <span class="timeline-dot" aria-hidden="true"></span>
        <span class="timeline-date">${esc(date).replace(' OPEN', '')}</span>
        <span class="timeline-name">${esc(name)}</span>
      </div>`).join('')}
  </div>`);

/** 05 매장위치 — 연락처 라인 */
const renderContact = ({ phone, instagram, instagramUrl } = {}) => fill('contactLines', `
  <div class="contact-line"><span class="k">창업문의</span><span class="v">${esc(phone)}</span></div>
  <div class="contact-line"><span class="k">Instagram</span><span class="v">${
    instagramUrl ? `<a href="${esc(instagramUrl)}" target="_blank" rel="noopener noreferrer">${esc(instagram)}</a>` : esc(instagram)
  }</span></div>`);

// ---- 인터랙션 ----

/**
 * 매출 숫자를 0 → target 으로 부드럽게 올린다. 03 수익분석 전용 — 정보를 가리는 3D
 * 플립카드 대신 채택한 장치라, 정보(target 값)는 시작부터 data-count-to 로 DOM 에
 * 존재하고 시각적 카운팅만 진행된다. prefers-reduced-motion 이면 즉시 최종값을 넣는다.
 */
const animateCount = (el, target, duration = 1100) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = formatWon(target);
    return;
  }
  const start = performance.now();
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = formatWon(Math.round(target * easeOutCubic(p)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

/**
 * 01/02/03/04 공용 1회성 스크롤 리빌. A안의 initGridReveal/initReceiptReveal 을 하나로
 * 통합했다 — B는 "절제된 인터랙션"이 원칙이라 반복 재생되는 리빌을 쓰지 않는다. 진입 시
 * .in-view 를 한 번만 붙이고 바로 unobserve 한다. 03 수익분석 행에는 같은 콜백 안에서
 * 매출 숫자 카운트업도 함께 시작한다(새 옵저버를 만들지 않는다).
 */
const initScrollReveal = () => {
  const targets = [
    ...document.querySelectorAll('#featureList .feature-row'),
    ...document.querySelectorAll('#trustGrid .trust-badge'),
    ...document.querySelectorAll('#meatGrid .meat-card'),
    ...document.querySelectorAll('#selfbarGrid .selfbar-card'),
    ...document.querySelectorAll('#revenueList .revenue-card'),
    ...document.querySelectorAll('#costTable .price-row'),
    ...document.querySelectorAll('#storeTimeline .timeline-node'),
  ];
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty('--d', `${(i % 6) * 70}ms`);
        entry.target.classList.add('in-view');
        const figure = entry.target.querySelector('.revenue-figure[data-count-to]');
        if (figure) animateCount(figure, Number(figure.dataset.countTo));
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
};

/**
 * 05 매장위치 — Swiper 캐러셀. A안(0007)의 initStoreSwiper 로직을 그대로 재사용하되,
 * 컨트롤을 Lucide 아이콘 대신 텍스트(← / → / AUTO·PAUSE / "01 / 03" 분수 인디케이터)로
 * 바꿨다. prefers-reduced-motion 을 존중해 자동재생을 아예 켜지 않는다.
 */
const initStoreSwiper = () => {
  const track = document.getElementById('storeGrid');
  if (!track || typeof Swiper === 'undefined') return;

  const total = Number(track.dataset.count || 0);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toggleBtn = document.getElementById('storeAutoplayToggle');
  const fractionEl = document.getElementById('storeFraction');

  const swiper = new Swiper('.store-swiper', {
    slidesPerView: 1.08,
    spaceBetween: 20,
    loop: true,
    speed: reduceMotion ? 0 : 550,
    autoplay: reduceMotion ? false : { delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true },
    navigation: { prevEl: '.store-nav-prev', nextEl: '.store-nav-next' },
    a11y: { enabled: true },
    breakpoints: { 1025: { slidesPerView: 1.35, spaceBetween: 28 } },
  });

  const captionEl = document.getElementById('storeCaption');
  const syncCaption = () => {
    const slide = captionEl && swiper.slides[swiper.activeIndex];
    if (!slide) return;
    captionEl.innerHTML = storeCaptionHTML({
      name: slide.dataset.name,
      date: slide.dataset.date,
      mapUrl: slide.dataset.mapUrl,
    });
    if (fractionEl && total) {
      const n = ((swiper.realIndex % total) + total) % total;
      fractionEl.textContent = `${String(n + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }
  };
  syncCaption();
  swiper.on('slideChange', syncCaption);

  if (!toggleBtn || !swiper.autoplay) return;

  let userPaused = reduceMotion;
  let inView = false;
  const syncAutoplay = () => {
    if (inView && !userPaused) swiper.autoplay.start();
    else swiper.autoplay.stop();
    toggleBtn.textContent = userPaused ? 'AUTO' : 'PAUSE';
  };

  swiper.autoplay.stop();   // 관찰자가 진입을 감지하기 전까지는 재생하지 않는다
  toggleBtn.textContent = userPaused ? 'AUTO' : 'PAUSE';
  toggleBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    toggleBtn.setAttribute('aria-label', userPaused ? '자동 재생 시작' : '자동 재생 일시정지');
    syncAutoplay();
  });

  if (reduceMotion) return;   // autoplay 자체가 꺼져 있으므로 관찰할 필요가 없다
  const section = document.getElementById('location');
  if (!section) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        inView = entry.isIntersecting;
        syncAutoplay();
      });
    },
    { threshold: 0.3 }
  );
  observer.observe(section);
};

/** 네비게이션 스크롤 이동 */
const initSmoothScroll = () => {
  const links = document.querySelectorAll('[data-target]');
  const nav = document.getElementById('siteNav');

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetEl = document.getElementById(link.dataset.target);
      if (!targetEl) return;

      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      nav.classList.remove('nav-open');   // 모바일 메뉴 열려있으면 닫기
    });
  });
};

/** 모바일 메뉴 토글 */
const initMobileNav = () => {
  const nav = document.getElementById('siteNav');
  const toggle = document.getElementById('navToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
};

/** 스크롤 시 헤더 배경 + 스크롤스파이(active 표시) */
const initScrollSpy = () => {
  const nav = document.getElementById('siteNav');
  const sections = [...document.querySelectorAll('main section[id], section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-links a[data-target]')];

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.dataset.target === id);
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
};

/**
 * 문의하기 모달 — [data-open-inquiry] 트리거(헤더/히어로/창업비용/05 매장위치 CTA) 클릭으로만
 * 열린다. A안과 달리 02 메뉴 섹션 진입 시 자동으로 열리는 로직은 없다 — "절제된 인터랙션"
 * 원칙 위반이라 B에서는 의도적으로 제거했다. hidden 을 뗀 다음 프레임에 .is-open 을 붙여야
 * CSS transition 이 시작값을 인식한다.
 */
const initInquirySheet = () => {
  const backdrop = document.getElementById('inquirySheetBackdrop');
  if (!backdrop) return;

  const form = document.getElementById('inquirySheetForm');
  const closeBtn = document.getElementById('inquirySheetClose');
  const openers = document.querySelectorAll('[data-open-inquiry]');

  let lastFocused = null;

  const open = () => {
    lastFocused = document.activeElement;
    backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => backdrop.classList.add('is-open'));
    form?.querySelector('input, select, textarea')?.focus();
  };

  const close = () => {
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    lastFocused?.focus();
    setTimeout(() => { backdrop.hidden = true; }, 350);
  };

  openers.forEach((btn) => btn.addEventListener('click', open));
  closeBtn?.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('is-open')) close();
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('inquirySheetSubmit');
    btn.textContent = '접수되었습니다 (시안 예시)';
    btn.disabled = true;
  });
};

/** 05 매장위치 맨 아래 문의 폼 (목업 제출) */
const initInquiryForm = () => {
  const form = document.getElementById('inquiryForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.submit-btn');
    btn.textContent = '접수되었습니다 (시안 예시)';
    btn.disabled = true;
  });
};

// ---- 부팅 ----

/** JSON 을 못 읽었을 때(대개 file:// 로 연 경우) 화면에 이유를 남긴다 */
const showDataError = (err) => {
  const isFile = location.protocol === 'file:';
  const msg = isFile
    ? 'data/content.json 을 file:// 에서는 읽을 수 없습니다. 로컬 서버로 열어주세요 — python3 -m http.server 8765'
    : `data/content.json 을 불러오지 못했습니다 (${err.message}).`;

  console.error('[고품격대패]', msg, err);
  document.querySelectorAll('[data-content]').forEach((el) => {
    el.innerHTML = `<p style="color:#8C8371; font-size:16px; line-height:1.8;">${msg}</p>`;
  });
};

const renderAll = (data) => {
  renderCompetency(data.competency);
  renderTrust(data.trust);
  renderMeat(data.meat);
  renderSelfbar(data.selfbar);
  renderProfitCards(data.profit);
  renderCost(data.cost);
  renderStores(data.stores);
  renderStoreTimeline(data.stores);
  renderContact(data.contact);
};

const boot = async () => {
  // 데이터와 무관한 인터랙션은 먼저 붙인다 — JSON 로드가 실패해도 동작해야 한다
  initSmoothScroll();
  initMobileNav();
  initScrollSpy();
  initInquiryForm();
  initInquirySheet();

  try {
    const res = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    renderAll(await res.json());
  } catch (err) {
    showDataError(err);
    return;
  }

  // 카드가 DOM 에 올라온 뒤에 관찰을 시작해야 한다
  initScrollReveal();
  initStoreSwiper();
};

document.addEventListener('DOMContentLoaded', boot);
