// 연두 뷰티샵 랜딩페이지 — 바닐라 ES6, data/content.json fetch → 렌더

let siteData = null;
const menuState = { activeCategory: null };

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
            <div class="img-placeholder">[${esc(pair.beforeLabel)}]</div>
            <div class="img-placeholder">[${esc(pair.afterLabel)}]</div>
          </div>
        </div>
      `
    )
    .join('');
  fill('beforeAfterGrid', html);
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
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      if (result) result.textContent = '이름과 연락처를 입력해 주세요.';
      return;
    }
    if (result) result.textContent = '문의가 접수되었습니다. 빠르게 연락드리겠습니다.';
    form.reset();
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

    if (link.dataset.target === '#pricing') {
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
