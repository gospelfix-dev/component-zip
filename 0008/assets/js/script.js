// 든든김밥 랜딩 — ES6, 모듈 없음, data/content.json fetch 후 렌더

const ICONS = {
  sealer: '<svg class="equip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 7l3-4h12l3 4"/><path d="M8 7v13M16 7v13"/></svg>',
  roller: '<svg class="equip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4v5h5"/><path d="M20 20v-5h-5"/><path d="M5 14a8 8 0 0 0 14 4M19 10A8 8 0 0 0 5 6"/></svg>',
  pos: '<svg class="equip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  rice: '<svg class="equip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 11h16a8 6 0 0 1-16 0Z"/><path d="M4 11c0-3 3.5-6 8-6s8 3 8 6"/></svg>'
};

const menuState = { categories: [], items: [], active: '' };
const costState = { tiers: [], active: 0, loanNotice: '' };
const storesState = { all: [], activeRegion: '전체', swiper: null };

function esc(str){
  if(str === undefined || str === null) return '';
  return String(str).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
}

function fill(id, html){
  const el = document.getElementById(id);
  if(el) el.innerHTML = html;
}

function getIcon(key){
  return ICONS[key] || ICONS.pos;
}

function won(n){
  return Number(n).toLocaleString('ko-KR');
}

/* ===== 데이터 무관 인터랙션 ===== */

function closeMobileNav(){
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('navToggle');
  if(nav) nav.classList.remove('is-open');
  if(toggle) toggle.setAttribute('aria-expanded', 'false');
}

function initMobileNav(){
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if(!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function initSmoothScroll(){
  document.querySelectorAll('[data-target]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(el.dataset.target);
      if(target) target.scrollIntoView({ behavior: 'smooth' });
      closeMobileNav();
    });
  });
}

function initScrollSpy(){
  const header = document.getElementById('siteHeader');
  if(!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  });
}

function mockSubmit(form, onDone){
  if(!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button');
    if(!btn) return;
    const original = btn.textContent;
    btn.textContent = '문의 접수 완료';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      form.reset();
      if(onDone) onDone();
    }, 2000);
  });
}

function initInquiryForm(){
  mockSubmit(document.getElementById('inquiryForm'));
}

function initStickyInquiryBar(){
  mockSubmit(document.getElementById('stickyForm'));
}

function initInquiryFab(){
  const fab = document.getElementById('inquiryFab');
  const modal = document.getElementById('inquiryModal');
  const closeBtn = document.getElementById('inquiryModalClose');
  if(!fab || !modal) return;

  const openModal = () => { modal.hidden = false; };
  const closeModal = () => { modal.hidden = true; };

  fab.addEventListener('click', openModal);
  if(closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && !modal.hidden) closeModal();
  });

  mockSubmit(document.getElementById('inquiryModalForm'), closeModal);
}

/* ===== 렌더 함수 ===== */

function renderProcess(process){
  const rowSize = Math.ceil(process.length / 2);
  const row1 = process.slice(0, rowSize);
  const row2 = process.slice(rowSize);

  const circle = p => `
    <div class="process-step process-step-${p.step}">
      <div class="process-circle">
        <span class="step-num-ribbon">${p.step}</span>
        <p class="step-label">${esc(p.label)}</p>
        <p class="step-desc">${esc(p.desc)}</p>
      </div>
    </div>`;

  const html = `
    <div class="process-connector process-connector-row1" aria-hidden="true"></div>
    <div class="process-connector process-connector-row2" aria-hidden="true"></div>
    <div class="process-connector process-connector-vert" aria-hidden="true"></div>
    <div class="process-connector-arrow" aria-hidden="true"></div>
    <div class="process-callout">
      <p>높은 매출로<br><span class="callout-highlight">안정성 있는</span><br>운영 OK!</p>
    </div>
    ${row1.map(circle).join('')}
    ${row2.map(circle).join('')}`;
  fill('processTrack', html);
}

function renderTrustStats(trustStats){
  const html = trustStats.map(t => `
    <div class="trust-card">
      <div class="trust-value-row">
        <span class="trust-value" data-count-to="${t.value}">0</span>
        <span class="trust-suffix">${esc(t.suffix)}</span>
      </div>
      <p class="trust-label">${esc(t.label)}</p>
    </div>`).join('');
  fill('trustGrid', html);
}

function renderEquipment(equipment){
  const html = equipment.map(e => `
    <div class="equip-card">
      ${getIcon(e.icon)}
      <p class="equip-name">${esc(e.name)}</p>
      <div class="equip-compare">
        <span class="equip-before">${esc(e.before)}</span>
        <span>→</span>
        <span class="equip-after">${esc(e.after)}</span>
      </div>
      <p class="equip-desc">${e.desc}</p>
    </div>`).join('');
  fill('equipGrid', html);
}

function renderMenuTabs(){
  const html = menuState.categories.map(c => `
    <button class="menu-tab${c === menuState.active ? ' is-active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>
  `).join('');
  fill('menuTabs', html);
}

function renderMenuGrid(){
  const items = menuState.items.filter(i => i.category === menuState.active);
  const html = items.map(i => {
    const initial = esc(i.name.slice(0, 1));
    const badge = i.badge ? `<span class="menu-badge">${esc(i.badge)}</span>` : '';
    return `
      <div class="menu-card">
        <div class="menu-ph">${badge}<span class="menu-ph-initial">${initial}</span></div>
        <p class="menu-name">${esc(i.name)}</p>
        <p class="menu-price">${won(i.price)}원</p>
      </div>`;
  }).join('');
  fill('menuGrid', html);
}

function initMenuTabs(){
  const tabs = document.getElementById('menuTabs');
  if(!tabs) return;
  tabs.addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if(!btn) return;
    menuState.active = btn.dataset.cat;
    renderMenuTabs();
    renderMenuGrid();
  });
}

function renderMenu(menu){
  menuState.categories = menu.categories;
  menuState.items = menu.items;
  menuState.active = menu.categories[0];
  renderMenuTabs();
  renderMenuGrid();
}

function renderProfitCards(profitStores){
  const html = profitStores.map(p => `
    <div class="profit-card">
      <p class="profit-name">${esc(p.name)}</p>
      <p class="profit-open">${esc(p.open)}</p>
      <div>
        <span class="revenue-figure" data-count-to="${p.salesWon}">0</span>
        <span class="revenue-unit">원</span>
      </div>
      <p class="profit-rate">순수익률 ${p.netRate}%</p>
    </div>`).join('');
  fill('profitGrid', html);
}

function renderCostTabs(){
  const html = costState.tiers.map((t, i) => `
    <button class="cost-tab${i === costState.active ? ' is-active' : ''}" data-idx="${i}">${esc(t.label)}</button>
  `).join('');
  fill('costTabs', html);
}

function renderCostTable(){
  const tier = costState.tiers[costState.active];
  const rowsHtml = tier.rows.map(r => `
    <tr><td>${esc(r.item)}</td><td>${esc(r.detail)}</td><td>${won(r.price)}원</td></tr>
  `).join('');
  fill('costTableBody', rowsHtml);
  const total = tier.rows.reduce((sum, r) => sum + r.price, 0);
  fill('costTableFoot', `<tr><td colspan="2">합계</td><td>${won(total)}원</td></tr>`);
}

function initCostTierToggle(){
  const tabs = document.getElementById('costTabs');
  if(!tabs) return;
  tabs.addEventListener('click', e => {
    const btn = e.target.closest('[data-idx]');
    if(!btn) return;
    costState.active = Number(btn.dataset.idx);
    renderCostTabs();
    renderCostTable();
  });
}

function renderCost(cost){
  costState.tiers = cost.tiers;
  costState.active = 0;
  costState.loanNotice = cost.loanNotice;
  renderCostTabs();
  renderCostTable();
  fill('costLoanNotice', esc(cost.loanNotice));
}

function initStoreSwiper(){
  if(storesState.swiper){
    storesState.swiper.destroy(true, true);
    storesState.swiper = null;
  }
  if(typeof Swiper === 'undefined') return;
  storesState.swiper = new Swiper('.store-swiper', {
    slidesPerView: 1,
    spaceBetween: 16,
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: { 1025: { slidesPerView: 3 } }
  });
}

function renderStoreSlides(){
  const filtered = storesState.activeRegion === '전체'
    ? storesState.all
    : storesState.all.filter(s => s.region === storesState.activeRegion);

  const html = filtered.map(s => `
    <div class="swiper-slide">
      <div class="store-card">
        <p class="store-region">${esc(s.region)}</p>
        <p class="store-name">${esc(s.name)}</p>
        <p class="store-date">${esc(s.date)}</p>
        <a class="store-map-link" href="${esc(s.mapUrl)}" target="_blank" rel="noopener">지도에서 보기</a>
      </div>
    </div>`).join('');

  fill('storeSwiperWrapper', html || '<p class="fetch-error">해당 지역에 매장이 없습니다.</p>');
  initStoreSwiper();
}

function initStoreFilter(){
  const select = document.getElementById('storeRegionFilter');
  if(!select) return;
  select.addEventListener('change', () => {
    storesState.activeRegion = select.value;
    renderStoreSlides();
  });
}

function renderStores(stores, regions){
  storesState.all = stores;
  storesState.activeRegion = regions[0];
  const select = document.getElementById('storeRegionFilter');
  if(select){
    select.innerHTML = regions.map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join('');
  }
  renderStoreSlides();
}

function renderContact(contact){
  const telHref = 'tel:' + String(contact.phone).replace(/[^0-9]/g, '');

  const headerPhone = document.getElementById('headerPhone');
  if(headerPhone) headerPhone.href = telHref;

  const stickyPhone = document.getElementById('stickyPhone');
  if(stickyPhone){
    stickyPhone.href = telHref;
    stickyPhone.textContent = contact.phone;
  }

  fill('footerContact', `TEL. ${esc(contact.phone)} ・ Instagram <a href="${esc(contact.instagramUrl)}" target="_blank" rel="noopener">${esc(contact.instagram)}</a>`);
}

function initCountdown(inquiry){
  const el = document.getElementById('inquiryDeadline');
  if(!el) return;
  const target = new Date(inquiry.deadlineDate).getTime();

  function tick(){
    const diff = target - Date.now();
    if(diff <= 0){
      el.textContent = '이달 상담이 마감되었습니다';
      return;
    }
    const days = Math.floor(diff / 86400000);
    el.textContent = `${inquiry.deadlineText} D-${days}`;
  }

  tick();
  setInterval(tick, 60000);
}

/* ===== 스크롤 리빌 / 카운트업 (IntersectionObserver 1회성) ===== */

function initScrollReveal(selector){
  const els = document.querySelectorAll(selector);
  if(!('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));
}

function animateCount(el){
  const target = Number(el.dataset.countTo);
  const duration = 1200;
  const start = performance.now();

  function frame(now){
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = won(Math.floor(progress * target));
    if(progress < 1){
      requestAnimationFrame(frame);
    } else {
      el.textContent = won(target);
    }
  }
  requestAnimationFrame(frame);
}

function initCountUp(selector){
  const els = document.querySelectorAll(selector);
  if(!('IntersectionObserver' in window)){
    els.forEach(el => { el.textContent = won(Number(el.dataset.countTo)); });
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        animateCount(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  els.forEach(el => io.observe(el));
}

/* ===== 렌더 총괄 + fetch 오류 처리 ===== */

function renderAll(data){
  renderProcess(data.process);
  renderTrustStats(data.trustStats);
  renderEquipment(data.equipment);
  renderMenu(data.menu);
  initMenuTabs();
  renderProfitCards(data.profitStores);
  renderCost(data.cost);
  initCostTierToggle();
  renderStores(data.stores, data.regions);
  initStoreFilter();
  renderContact(data.contact);
  initCountdown(data.inquiry);
}

function showFetchError(){
  const msg = '콘텐츠를 불러오지 못했습니다. 로컬 서버(python3 -m http.server)로 실행해주세요.';
  ['processTrack', 'trustGrid', 'equipGrid', 'menuTabs', 'menuGrid', 'profitGrid', 'storeSwiperWrapper'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.innerHTML = `<p class="fetch-error">${msg}</p>`;
  });
  fill('costTableBody', `<tr><td colspan="3">${msg}</td></tr>`);
  const footerContact = document.getElementById('footerContact');
  if(footerContact) footerContact.textContent = msg;
}

function boot(){
  initSmoothScroll();
  initMobileNav();
  initScrollSpy();
  initInquiryForm();
  initStickyInquiryBar();
  initInquiryFab();

  fetch('data/content.json')
    .then(res => {
      if(!res.ok) throw new Error('fetch failed');
      return res.json();
    })
    .then(data => {
      renderAll(data);
    })
    .catch(() => {
      showFetchError();
    })
    .finally(() => {
      initScrollReveal('.reveal');
      initCountUp('[data-count-to]');
    });
}

document.addEventListener('DOMContentLoaded', boot);
