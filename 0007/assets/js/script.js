// ===== 고품격대패 랜딩페이지 — ES6 스크립트 =====
//
// 화면에 뿌리는 콘텐츠(메뉴·셀프바·수익·창업비용·매장 등)는 전부 data/content.json 에 있다.
// 이 파일에는 데이터를 두지 않는다 — 값을 바꾸려면 JSON 만 고치면 된다.
//
// ⚠ fetch 를 쓰므로 index.html 을 file:// 로 더블클릭해 열면 CORS 로 막힌다.
//   반드시 로컬 서버로 볼 것:  python3 -m http.server 8765

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

/** 01 경쟁력 — 3대 핵심경쟁력 카드 */
const renderCompetency = (list = []) => fill('compGrid', list.map(({ num, title, desc }) => `
  <div class="comp-card">
    <div class="comp-num">${esc(num)}</div>
    <h3>${esc(title)}</h3>
    <p>${desc ?? ''}</p>
  </div>`).join(''));

/** 01 경쟁력 — 하단 트러스트 스트립 (번호는 데이터가 아니라 순서에서 생성) */
const renderTrust = (list = []) => fill('trustStrip', list.map(({ label, desc }, i) => `
  <div class="trust-item">
    <span class="trust-num">${String(i + 1).padStart(2, '0')}</span>
    <h5>${esc(label)}</h5>
    <p>${esc(desc)}</p>
  </div>`).join(''));

/** 02 메뉴 — 고기 그리드 */
const renderMeat = (list = []) => fill('meatGrid', list.map(({ image, name }) => `
  <div class="meat-card">
    <img src="${esc(image)}" alt="${esc(name)}">
    <div class="meat-label">${esc(name)}</div>
  </div>`).join(''));

/** 02 메뉴 — 셀프바 원형 그리드 */
const renderSelfbar = (list = []) => fill('selfbarGrid', list.map(({ image, name }) => `
  <div class="sb-item">
    <div class="circle"><img src="${esc(image)}" alt="${esc(name)}"></div>
    <span>${esc(name)}</span>
  </div>`).join(''));

/** 03 수익분석 — 매장별 수익을 영수증(리시트) 롤 스타일 카드로 렌더링한다 */
const renderProfitCards = (list = []) => fill('profitCards', list.map(({ name, open, salesWon, rate, tall }, i) => `
  <div class="receipt-col${tall ? ' center' : ''}" style="--d:${i * 140}ms">
    <div class="printer-bar">
      <div class="printer-slot"></div>
    </div>
    <div class="receipt-mask">
      <div class="receipt-body">
        <div class="receipt-paper">
          <div class="r-label">운영형태 [ 홀 / 셀프바 ]</div>
          <div class="r-store">${esc(name)}</div>
          <div class="r-sales">${formatWon(salesWon)}</div>
          <div class="r-divider"></div>
          <div class="r-sub">순수익률 <b>${esc(rate)}%</b></div>
          <div class="r-divider"></div>
          <div class="r-date">${esc(open)} 기준</div>
          <div class="r-barcode"></div>
        </div>
        <div class="receipt-scallop"></div>
      </div>
    </div>
  </div>`).join(''));

/** 04 창업비용 — 항목표 */
const renderCost = ({ head, rows = [] } = {}) => {
  const headRow = head
    ? `<div class="cost-row cost-head"><span>${esc(head.item)}</span><span>${esc(head.detail)}</span><span>${esc(head.price)}</span></div>`
    : '';
  const body = rows.map(({ item, detail, price }) => `
    <div class="cost-row"><span>${esc(item)}</span><span>${esc(detail)}</span><span>${esc(price)}</span></div>`).join('');
  fill('costTable', headRow + body);
};

/** 05 매장위치 — 매장 카드 + 지점별 네이버 지도 버튼 */
const PIN_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';

/**
 * 05 매장위치 — 카드는 사진만 담고, 이름·오픈일·지도 버튼은 좌측 컬럼의 .store-caption 으로
 * 옮겼다(2026-09-03). 캐러셀이 넘어갈 때마다 initStoreSwiper 가 이 마크업을 다시 그린다 —
 * 슬라이드 쪽 data-name/date/map-url 속성을 그대로 읽어서 쓰므로 데이터 형태가 여기 하나뿐이다.
 */
const storeCaptionHTML = ({ name, date, mapUrl }) => `
  <h4>${esc(name)}</h4>
  <div class="date">${esc(date)}</div>
  ${mapUrl ? `<a class="map-btn" href="${esc(mapUrl)}" target="_blank" rel="noopener noreferrer"
     aria-label="${esc(name)} 네이버 지도에서 보기 (새 창)">${PIN_SVG} 네이버 지도로 보기</a>` : ''}`;

const renderStores = (list = []) => fill('storeGrid', list.map(({ name, date, image, mapUrl }) => `
  <div class="swiper-slide" data-name="${esc(name)}" data-date="${esc(date)}" data-map-url="${esc(mapUrl || '')}">
    <div class="store-card">
      <div class="photo"><img src="${esc(image)}" alt="${esc(name)}"></div>
    </div>
  </div>`).join(''));

/** 05 매장위치 — 연락처 라인 */
const renderContact = ({ phone, instagram, instagramUrl } = {}) => fill('contactLines', `
  <div class="contact-line"><span class="k">창업문의</span><span class="v">${esc(phone)}</span></div>
  <div class="contact-line"><span class="k">Instagram</span><span class="v">${
    instagramUrl ? `<a href="${esc(instagramUrl)}" target="_blank" rel="noopener noreferrer">${esc(instagram)}</a>` : esc(instagram)
  }</span></div>`);

// ---- 인터랙션 ----

/**
 * 수익분석 섹션이 화면에 들어오면 영수증이 프린터에서 뽑혀나오듯 애니메이션한다.
 * "03. 수익분석" 섹션(#profit) 상단이 뷰포트 상단에 맞닿는 순간 재생하고,
 * 다시 그 지점 위로 스크롤이 올라가면 되감는다 — 섹션에 들어올 때마다 반복 재생한다.
 * rootMargin 을 '0px 0px -100% 0px' 로 줘서 관찰 영역을 뷰포트 최상단 한 줄로
 * 좁혀두면, isIntersecting 은 정확히 섹션 상단이 그 줄을 지나는 동안만 true 가 된다.
 */
const initReceiptReveal = () => {
  const section = document.getElementById('profit');
  if (!section) return;
  const cols = [...section.querySelectorAll('.receipt-col')];
  if (!cols.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        cols.forEach((col) => col.classList.toggle('in-view', entry.isIntersecting));
      });
    },
    { threshold: 0, rootMargin: '0px 0px -100% 0px' }
  );

  observer.observe(section);
};

/**
 * 01 경쟁력 섹션의 카드/트러스트 항목을 스크롤로 처음 들어올 때 한 번만 떠오르게 한다
 * (수익분석 영수증과 달리 반복 재생할 필요는 없어 한 번 보이면 관찰을 끊는다).
 */
const initGridReveal = () => {
  const targets = [
    ...document.querySelectorAll('#compGrid .comp-card'),
    ...document.querySelectorAll('#trustStrip .trust-item'),
  ];
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  targets.forEach((el) => observer.observe(el));
};

/**
 * 05 매장위치 — Swiper 캐러셀. prefers-reduced-motion 을 존중해 자동재생을 아예 켜지 않고,
 * 일시정지 토글 버튼은 클릭할 때마다 swiper.autoplay 를 멈추고/다시 시작한다.
 * 2026-09-03: 자동재생은 #location 섹션이 30% 이상 뷰포트에 들어왔을 때만 돈다 — 화면 밖
 * 캐러셀이 계속 넘어가는 걸 막기 위해 IntersectionObserver 로 진입/이탈에 맞춰 시작/정지한다.
 * "뷰포트 안에 있음"과 "사용자가 일시정지 버튼을 누르지 않음" 둘 다 만족해야 재생되고,
 * 토글 버튼 아이콘/aria-label 은 사용자의 의도(userPaused)만 반영한다 — 화면 밖으로 나가서
 * 조용히 멈춘 것까지 아이콘에 반영하면(예: 스크롤만 했는데 재생 아이콘이 바뀜) 오히려 헷갈린다.
 */
const initStoreSwiper = () => {
  const track = document.getElementById('storeGrid');
  if (!track || typeof Swiper === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toggleBtn = document.getElementById('storeAutoplayToggle');

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

  const ring = document.querySelector('.store-nav-toggle__ring');
  if (ring && swiper.autoplay) {
    swiper.on('autoplayTimeLeft', (_s, _timeLeft, percentage) => {
      ring.style.setProperty('--store-timer', percentage);
    });
  }

  /* 카드 안에 있던 이름·오픈일·지도 버튼을 좌측 컬럼(.store-caption)으로 옮겼다(2026-09-03) —
     loop:true 라 activeIndex 는 복제된 슬라이드를 가리킬 수도 있지만, Swiper 가 복제할 때
     원본 슬라이드의 data-* 속성까지 그대로 복사하므로 realIndex 를 따로 계산할 필요 없이
     swiper.slides[activeIndex] 에서 바로 읽으면 된다. */
  const captionEl = document.getElementById('storeCaption');
  const syncCaption = () => {
    const slide = captionEl && swiper.slides[swiper.activeIndex];
    if (!slide) return;
    captionEl.innerHTML = storeCaptionHTML({
      name: slide.dataset.name,
      date: slide.dataset.date,
      mapUrl: slide.dataset.mapUrl,
    });
  };
  syncCaption();
  swiper.on('slideChange', syncCaption);

  if (!toggleBtn || !swiper.autoplay) return;

  let userPaused = reduceMotion;
  let inView = false;
  const syncAutoplay = () => {
    if (inView && !userPaused) swiper.autoplay.start();
    else swiper.autoplay.stop();
  };

  swiper.autoplay.stop();   // 관찰자가 진입을 감지하기 전까지는 재생하지 않는다
  toggleBtn.classList.toggle('is-paused', userPaused);
  toggleBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    toggleBtn.classList.toggle('is-paused', userPaused);
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
    nav.classList.toggle('nav-open');
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

/** 문의 폼 (목업 제출) */
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
    el.innerHTML = `<p style="color:#B3A995; font-size:18px; line-height:1.8;">${msg}</p>`;
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
  renderContact(data.contact);
};

const boot = async () => {
  // 데이터와 무관한 인터랙션은 먼저 붙인다 — JSON 로드가 실패해도 동작해야 한다
  initSmoothScroll();
  initMobileNav();
  initScrollSpy();
  initInquiryForm();

  try {
    const res = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    renderAll(await res.json());
  } catch (err) {
    showDataError(err);
    return;
  }

  // 카드가 DOM 에 올라온 뒤에 관찰을 시작해야 한다
  initReceiptReveal();
  initGridReveal();
  initStoreSwiper();
};

document.addEventListener('DOMContentLoaded', boot);
