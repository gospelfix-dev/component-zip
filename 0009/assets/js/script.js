// 연두 뷰티샵 랜딩페이지 — 바닐라 ES6, data/content.json fetch → 렌더

let siteData = null;
const menuState = { activeCategory: null };
const homeMenuState = { activeCategory: null };

document.addEventListener('DOMContentLoaded', boot);

function boot() {
  initSmoothScroll();
  initMobileNav();
  initScrollSpy();
  initChatbot();
  initReservationForm();

  fetch('data/content.json')
    .then((res) => {
      if (!res.ok) throw new Error('content.json fetch 실패');
      return res.json();
    })
    .then((data) => {
      siteData = data;
      renderAll(data);
      initMenuCategoryTabs(data);
      initHomeMenuTabs(data);
      initFaqAccordion();
      initScrollReveal('.reveal');
    })
    .catch(showFetchError);
}

function renderAll(data) {
  renderHeader(data);
  renderHero(data);
  renderMenu(data);
  renderBeforeAfter(data);
  renderTeam(data);
  renderReviews(data);
  renderPricing(data);
  renderChatbotContent(data);
  renderFooter(data);
  // 디자인 시안(draft) 페이지 전용 — 해당 컨테이너가 없는 페이지(index.html 등)에서는
  // 각 함수 내부의 요소 존재 체크로 조용히 no-op된다.
  renderHomeMenuCards(data);
  renderReviewQuotes(data);
  renderHomeQuote(data);
  renderDirectorProfile(data);
  renderCaseGrid(data);
  renderServiceCatalog(data);
  renderBookingServicePills(data);
  renderDraftCtaLinks(data);
}

// 공용 유틸

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function fill(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text == null ? '' : text;
}

function won(amount) {
  if (amount === 0) return '무료';
  return `${amount.toLocaleString('ko-KR')}원`;
}

function showFetchError() {
  const el = document.getElementById('fetchError');
  if (!el) return;
  el.hidden = false;
  el.textContent = '콘텐츠를 불러오지 못했습니다. file://로 열람 중이라면 python3 -m http.server 같은 로컬 서버로 열어주세요.';
}

// 렌더 함수

function renderHeader(data) {
  setText('brandWordmark', data.brand.wordmark);

  const navHtml = data.nav
    .map((item) => `<li><a class="nav-link" href="${esc(item.target)}" data-target="${esc(item.target)}">${esc(item.label)}</a></li>`)
    .join('');
  fill('navList', navHtml);
}

function renderHero(data) {
  setText('heroHeadline', data.hero.headline);
  setText('heroDesc', data.hero.desc);
  setText('heroPrimaryBtn', data.hero.primaryLabel);
  setText('heroSecondaryBtn', data.hero.secondaryLabel);
}

function renderMenu(data) {
  if (!menuState.activeCategory) {
    menuState.activeCategory = data.menu.categories[0];
  }

  const tabsHtml = data.menu.categories
    .map((cat) => {
      const count = data.menu.items.filter((item) => item.category === cat).length;
      const activeClass = cat === menuState.activeCategory ? ' is-active' : '';
      return `<button type="button" class="menu-tab${activeClass}" data-category="${esc(cat)}">${esc(cat)}<span class="menu-tab-count">${count}</span></button>`;
    })
    .join('');
  fill('menuTabs', tabsHtml);

  renderMenuList(data);
}

function renderMenuList(data) {
  const items = data.menu.items.filter((item) => item.category === menuState.activeCategory);
  const html = items
    .map((item) => {
      const badge = item.badge ? `<span class="tag">${esc(item.badge)}</span>` : '';
      return `
        <li class="menu-row">
          <div class="img-placeholder menu-row-thumb">[사진]</div>
          <div class="menu-row-body">
            <p class="menu-row-name">${esc(item.name)}${badge}</p>
            <p class="menu-row-desc">${esc(item.desc)}</p>
          </div>
          <p class="menu-row-price">${won(item.price)}</p>
        </li>
      `;
    })
    .join('');
  fill('menuList', html);
}

function initMenuCategoryTabs(data) {
  const tabs = document.getElementById('menuTabs');
  if (!tabs) return;
  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-category]');
    if (!btn) return;
    menuState.activeCategory = btn.dataset.category;
    renderMenu(data);
  });
}

function renderBeforeAfter(data) {
  const html = data.beforeAfter
    .map(
      (pair) => `
        <div class="before-after-pair">
          <p class="before-after-service">${esc(pair.service)}</p>
          <div class="before-after-photos">
            <div class="before-after-photo img-placeholder">
              [사진]
              <span class="before-after-tag">${esc(pair.beforeLabel)}</span>
            </div>
            <div class="before-after-photo before-after-photo--after img-placeholder">
              [사진]
              <span class="before-after-tag before-after-tag--after">${esc(pair.afterLabel)}</span>
            </div>
          </div>
        </div>
      `
    )
    .join('');
  fill('beforeAfterGrid', html);
}

// 디자인 시안(draft) 페이지 전용 렌더 함수 — home.html의 카드형 시그니처 프로그램,
// 후기 인용 밴드, 철학 섹션 인용구. 대상 컨테이너가 없으면(= index.html 등) 조용히 종료한다.

function renderHomeMenuCards(data) {
  const tabsEl = document.getElementById('homeMenuTabs');
  const cardsEl = document.getElementById('homeMenuCards');
  if (!tabsEl || !cardsEl) return;

  if (!homeMenuState.activeCategory) {
    homeMenuState.activeCategory = data.menu.categories[0];
  }

  const tabsHtml = data.menu.categories
    .map((cat) => {
      const activeClass = cat === homeMenuState.activeCategory ? ' is-active' : '';
      return `<button type="button" class="pill-tab${activeClass}" data-category="${esc(cat)}">${esc(cat)}</button>`;
    })
    .join('');
  tabsEl.innerHTML = tabsHtml;

  const items = data.menu.items.filter((item) => item.category === homeMenuState.activeCategory);
  const cardsHtml = items
    .map((item) => {
      const badge = item.badge ? `<span class="tag">${esc(item.badge)}</span>` : '';
      return `
        <div class="program-card">
          <div class="img-placeholder program-card-thumb">[사진]</div>
          <div class="program-card-body">
            <div class="program-card-top">
              <span class="tag tag--neutral">${esc(item.category)}</span>
              ${badge}
            </div>
            <h3 class="program-card-name">${esc(item.name)}</h3>
            <p class="program-card-desc">${esc(item.desc)}</p>
          </div>
          <div class="program-card-footer">
            <span class="program-card-price">${won(item.price)}</span>
            <a class="btn btn-secondary btn-sm" href="contact.html#reservationForm" data-target="#reservationForm">예약 선택</a>
          </div>
        </div>
      `;
    })
    .join('');
  cardsEl.innerHTML = cardsHtml;
}

function initHomeMenuTabs(data) {
  const tabs = document.getElementById('homeMenuTabs');
  if (!tabs) return;
  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-category]');
    if (!btn) return;
    homeMenuState.activeCategory = btn.dataset.category;
    renderHomeMenuCards(data);
  });
}

function renderServiceCatalog(data) {
  const el = document.getElementById('serviceCatalog');
  if (!el) return;
  const html = data.menu.categories
    .map((cat, i) => {
      const items = data.menu.items.filter((item) => item.category === cat);
      const itemsHtml = items
        .map((item) => {
          const badge = item.badge ? `<span class="tag">${esc(item.badge)}</span>` : '';
          return `
            <div class="service-item-card">
              <div class="service-item-top">
                <p class="service-item-name">${esc(item.name)}</p>
                ${badge}
              </div>
              <p class="service-item-desc">${esc(item.desc)}</p>
              <div class="service-item-footer">
                <span>${won(item.price)}</span>
                <a class="btn btn-secondary btn-sm" href="contact.html#reservationForm" data-target="#reservationForm">예약 선택</a>
              </div>
            </div>
          `;
        })
        .join('');
      return `
        <div class="service-category-block">
          <div class="service-category-heading">
            <h3><span class="service-category-number">0${i + 1}</span>${esc(cat)}</h3>
          </div>
          <div class="service-item-grid">${itemsHtml}</div>
        </div>
      `;
    })
    .join('');
  el.innerHTML = html;
}

function renderBookingServicePills(data) {
  const el = document.getElementById('bookingServicePills');
  if (!el) return;
  const html = data.menu.items
    .map(
      (item, i) => `
        <label class="service-pill">
          <span class="service-pill-left">
            <input type="checkbox" name="bookingService" value="${esc(item.name)}" id="bookingService${i}" />
            <span>
              <span class="service-pill-name">${esc(item.name)}</span><br />
              <span class="service-pill-desc">${esc(item.category)}</span>
            </span>
          </span>
          <span class="service-pill-price">${won(item.price)}</span>
        </label>
      `
    )
    .join('');
  el.innerHTML = html;
}

const STAR_SVG = '<svg viewBox="0 0 20 20"><path d="M10 1.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8L10 14.6l-5.2 2.9 1-5.8L1.5 7.6l5.9-.8z"/></svg>';

function renderReviewQuotes(data) {
  const el = document.getElementById('reviewQuoteBand');
  if (!el) return;
  const html = data.reviews
    .map(
      (r) => `
        <div class="review-quote-card">
          <div class="review-quote-stars">${STAR_SVG.repeat(5)}</div>
          <p class="review-quote-text">${esc(r.text)}</p>
          <p class="review-quote-meta">${esc(r.service)} · ${esc(r.author)} · ${esc(r.month)}</p>
        </div>
      `
    )
    .join('');
  el.innerHTML = html;
}

function renderHomeQuote(data) {
  const textEl = document.getElementById('homeQuoteText');
  if (!textEl) return;
  setText('homeQuoteText', data.about.lead);
  const lead = data.team && data.team[0] ? `${data.team[0].name} ${data.team[0].role}` : '';
  setText('homeQuoteAuthor', lead);
}

function renderCaseGrid(data) {
  const el = document.getElementById('caseGrid');
  if (!el) return;
  const html = data.beforeAfter
    .map(
      (pair) => `
        <article class="case-card">
          <div class="case-card-header">
            <span class="tag">${esc(pair.service)}</span>
          </div>
          <p class="case-card-desc">${esc(pair.beforeLabel)} 대비 ${esc(pair.afterLabel)} 상태를 동일한 조명과 각도에서 기록했습니다.</p>
          <div class="case-card-photos">
            <div class="before-after-photo img-placeholder">
              [사진]
              <span class="before-after-tag">${esc(pair.beforeLabel)}</span>
            </div>
            <div class="before-after-photo before-after-photo--after img-placeholder">
              [사진]
              <span class="before-after-tag before-after-tag--after">${esc(pair.afterLabel)}</span>
            </div>
          </div>
        </article>
      `
    )
    .join('');
  el.innerHTML = html;
}

function renderDirectorProfile(data) {
  const nameEl = document.getElementById('directorCaptionName');
  if (!nameEl) return;
  const director = data.team[0];
  setText('directorCaptionName', director.name);
  setText('directorCaptionRole', director.role);
  setText('directorBio', director.bio);
  setText('directorSignatureName', director.name);
}

function renderDraftCtaLinks(data) {
  const callLink = document.getElementById('ctaCallLink');
  if (callLink) {
    callLink.href = `tel:${data.contact.phone}`;
    callLink.textContent = `전화 상담 (${data.contact.phone})`;
  }

  const igLink = document.getElementById('contactInstagram');
  if (igLink) {
    igLink.href = data.contact.instagramUrl;
    igLink.textContent = `인스타그램 ${data.contact.instagram}`;
  }
}

function renderTeam(data) {
  setText('aboutLead', data.about.lead);
  fill('aboutBody', data.about.body);

  const html = data.team
    .map(
      (member) => `
        <div class="team-card">
          <div class="img-placeholder">[팀 사진]</div>
          <p class="team-name">${esc(member.name)}</p>
          <p class="team-role">${esc(member.role)}</p>
          <p class="team-bio">${esc(member.bio)}</p>
        </div>
      `
    )
    .join('');
  fill('teamGrid', html);
}

function renderReviews(data) {
  const photoHtml = data.reviewGallery
    .map((file, i) => {
      const review = data.reviews[i % data.reviews.length];
      return `
        <div class="review-photo-cell">
          <img class="review-photo-img" src="assets/imgs/${esc(file)}" alt="고객 후기 사진" loading="lazy" />
          <div class="review-photo-hover">
            <p class="review-photo-hover-text">${esc(review.text)}</p>
            <p class="review-photo-hover-meta">
              <span class="review-photo-hover-name">${esc(review.author)}</span> ·
              <span class="review-photo-hover-service">${esc(review.service)}</span> ·
              <span class="review-photo-hover-date">${esc(review.month)}</span>
            </p>
          </div>
        </div>
      `;
    })
    .join('');
  fill('reviewPhotoGrid', photoHtml);
}

function renderPricing(data) {
  const rowsHtml = data.pricing.map((row) => `<tr><td>${esc(row.service)}</td><td>${won(row.price)}</td></tr>`).join('');
  const tbody = document.getElementById('priceTableBody');
  if (tbody) tbody.innerHTML = rowsHtml;

  const pairs = [
    ['위치', data.contact.address],
    ['영업시간', data.contact.businessHours],
    ['전화', data.contact.phone],
  ];
  const infoHtml = pairs.map(([label, value]) => `<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`).join('');
  fill('infoList', infoHtml);
}

function renderFooter(data) {
  setText('footerWordmark', data.brand.wordmark);
  setText('footerTagline', data.brand.tagline);

  fill('footerSocial', `<a href="${esc(data.contact.instagramUrl)}" target="_blank" rel="noopener">${esc(data.contact.instagram)}</a>`);
  fill('footerAbout', data.footer.about.map((item) => `<li><a href="#">${esc(item.label)}</a></li>`).join(''));
  fill('footerInfo', data.footer.info.map((item) => `<li><a href="#">${esc(item.label)}</a></li>`).join(''));
  fill('footerOther', data.footer.other.map((item) => `<li><a href="#">${esc(item.label)}</a></li>`).join(''));

  const legal = `${esc(data.brand.name)} · 대표 ${esc(data.contact.owner)} · 사업자등록번호 ${esc(data.contact.bizRegNo)} · ${esc(data.contact.address)} · ${esc(data.contact.phone)}`;
  fill('footerLegal', legal);
}

// 챗봇

function renderChatbotContent(data) {
  setText('chatPanelTitle', data.chatbot.panelTitle);
  setText('chatPanelSubtitle', data.chatbot.panelSubtitle);
  fill('chatGreeting', data.chatbot.greeting.map((line) => `<p>${esc(line)}</p>`).join(''));
  fill('chatTopics', data.chatbot.topics.map((topic) => `<button type="button" class="chat-topic-btn" data-topic="${esc(topic.id)}">${esc(topic.label)}</button>`).join(''));

  const fab = document.getElementById('chatFab');
  if (fab) fab.setAttribute('aria-label', data.chatbot.fabLabel);
}

function buildChatReply(topicId, data) {
  switch (topicId) {
    case 'price': {
      const lines = data.pricing.slice(0, 4).map((row) => `${row.service} ${won(row.price)}`).join(' · ');
      return `${lines} 등이 있어요. 정확한 금액은 상담 시 다시 확인해 드립니다.`;
    }
    case 'reservation':
      return `아래 예약 문의 폼에 성함과 연락처를 남겨주시면 확인 후 연락드려요. 전화(${data.contact.phone})로도 예약하실 수 있습니다.`;
    case 'location':
      return `${data.contact.address}에 있습니다.`;
    case 'hours':
      return `${data.contact.businessHours}`;
    default:
      return '곧 답변 드릴게요.';
  }
}

function initChatbot() {
  const fab = document.getElementById('chatFab');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatCloseBtn');
  const topics = document.getElementById('chatTopics');
  const answer = document.getElementById('chatAnswer');

  if (!fab || !panel) return;

  const closePanel = () => {
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
  };

  fab.addEventListener('click', () => {
    const isOpen = !panel.hidden;
    panel.hidden = isOpen;
    fab.setAttribute('aria-expanded', String(!isOpen));
  });

  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  if (topics) {
    topics.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-topic]');
      if (!btn || !siteData) return;
      answer.hidden = false;
      answer.textContent = buildChatReply(btn.dataset.topic, siteData);
    });
  }
}

// 예약 문의 폼

function initReservationForm() {
  const form = document.getElementById('reservationForm');
  const result = document.getElementById('formResult');
  const success = document.getElementById('bookingSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      if (result) result.textContent = '이름과 연락처를 입력해 주세요.';
      if (success) success.hidden = true;
      return;
    }
    if (result) result.textContent = '문의가 접수되었습니다. 빠르게 연락드리겠습니다.';
    if (success) success.hidden = false;
    form.reset();
  });
}

// FAQ 아코디언 (contact.html 전용 — 요소 없으면 조용히 종료)

function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isOpen = trigger.classList.contains('is-open');
      items.forEach((other) => {
        other.querySelector('.faq-trigger')?.classList.remove('is-open');
        if (other.querySelector('.faq-content')) other.querySelector('.faq-content').hidden = true;
      });
      if (!isOpen) {
        trigger.classList.add('is-open');
        content.hidden = false;
      }
    });
  });
}

// 스무스 스크롤 + 모바일 nav

function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-target]');
    if (!link) return;
    const target = document.querySelector(link.dataset.target);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const nav = document.getElementById('mainNav');
    const hamburger = document.getElementById('hamburgerBtn');
    if (nav && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    }

    if (link.dataset.target === '#pricing' || link.dataset.target === '#reservationForm') {
      window.setTimeout(() => {
        const nameInput = document.getElementById('resName');
        if (nameInput) nameInput.focus();
      }, 450);
    }
  });
}

function initMobileNav() {
  const btn = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('mainNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });
}

function initScrollSpy() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  // 2026-10-16: top/left/right/border-radius/backdrop-filter는 CSS transition
  // 금지 대상(transform/opacity만 허용)이라 motion.dev(Motion)로 FLIP 방식 애니메이션을
  // 건다 — CSS의 .is-scrolled 규칙이 끝 상태를 정하고, Motion은 전/후 계산값을 읽어
  // 그 사이만 부드럽게 보간한다(class 전환 자체는 CSS가 계속 담당, JS 실패 시에도
  // 즉시 전환되어 동작은 보장됨).
  const ANIMATED_PROPS = ['top', 'left', 'right', 'borderRadius', 'backdropFilter'];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isScrolled = false;

  const readProps = () => {
    const cs = getComputedStyle(header);
    const values = {};
    ANIMATED_PROPS.forEach((prop) => {
      const value = cs[prop];
      values[prop] = prop === 'backdropFilter' && value === 'none' ? 'blur(0px)' : value;
    });
    return values;
  };

  window.addEventListener('scroll', () => {
    const shouldScroll = window.scrollY > 8;
    if (shouldScroll === isScrolled) return;
    isScrolled = shouldScroll;

    if (!window.Motion || prefersReducedMotion) {
      header.classList.toggle('is-scrolled', isScrolled);
      return;
    }

    const from = readProps();
    header.classList.toggle('is-scrolled', isScrolled);
    // Motion이 매 animate() 호출 끝에 결과값을 인라인 스타일로 커밋해두기 때문에,
    // class만 바꿔서는 getComputedStyle이 이전 애니메이션의 인라인 값을 그대로
    // 반환한다 — CSS가 정한 진짜 목표값을 읽으려면 먼저 인라인 오버라이드를 지운다.
    ANIMATED_PROPS.forEach((prop) => {
      header.style[prop] = '';
    });
    const to = readProps();

    const keyframes = {};
    ANIMATED_PROPS.forEach((prop) => {
      keyframes[prop] = [from[prop], to[prop]];
    });
    window.Motion.animate(header, keyframes, { duration: 0.3, easing: 'ease-out' });
  });
}

// 1회성 스크롤 리빌

function initScrollReveal(selector) {
  const targets = document.querySelectorAll(selector);
  if (!('IntersectionObserver' in window) || targets.length === 0) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}
