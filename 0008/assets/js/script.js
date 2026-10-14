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

function initHeroSwiper(){
  if(typeof Swiper === 'undefined') return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  new Swiper('.hero-swiper', {
    loop: true,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    speed: reduceMotion ? 0 : 650,
    grabCursor: true,
    autoplay: reduceMotion ? false : { delay: 2500, disableOnInteraction: false },
    a11y: { enabled: true }
  });
}

function initCustomCursor(){
  const cursor = document.getElementById('customCursor');
  if(!cursor) return;
  if(window.matchMedia('(hover:none), (pointer:coarse)').matches) return;

  document.body.classList.add('has-custom-cursor');
  window.addEventListener('mousemove', e => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  }, { passive: true });
}

/* ===== 렌더 함수 ===== */

function renderProcess(process){
  const rowSize = Math.ceil(process.length / 2);
  const row1 = process.slice(0, rowSize);
  const row2 = process.slice(rowSize);

  const circle = p => `
    <div class="process-step process-step-${p.step}">
      <div class="process-circle reveal">
        <span class="step-num-ribbon">${p.step}</span>
        <p class="step-label">${esc(p.label)}</p>
        <p class="step-desc">${esc(p.desc)}</p>
      </div>
    </div>`;

  const html = `
    <div class="process-connector process-connector-row1 reveal" aria-hidden="true"></div>
    <div class="process-connector process-connector-vert reveal" aria-hidden="true"></div>
    <div class="process-connector-arrow-wrap reveal" aria-hidden="true">
      <div class="process-connector process-connector-arrow" aria-hidden="true"></div>
    </div>
    <div class="process-callout">
      <p>높은 매출로<br><span class="callout-highlight">안정성 있는</span><br>운영 OK!</p>
    </div>
    ${row1.map(circle).join('')}
    ${row2.map(circle).join('')}`;
  fill('processTrack', html);
}

function renderTrustStats(trustStats){
  const html = trustStats.map(t => `
    <div class="trust-card" data-value="${t.value}">
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

  const headerPhoneNumber = document.getElementById('headerPhoneNumber');
  if(headerPhoneNumber) headerPhoneNumber.textContent = contact.phone;

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

/* ===== 24시간 창업상담 챗봇 ===== */

const CHAT_PLACEHOLDER = {
  location: '상권전략은 지역마다 분석 포인트가 달라 챗봇 답변 대신 상담 시 안내드립니다. 담당자가 직접 입지를 검토해드려요.',
  support: '본사지원(교육·물류·마케팅 등) 세부 항목은 상담 시 안내드립니다.',
  'video-sales1': '매출편1 영상은 준비 중입니다. 공개되면 이 챗봇에서 바로 보실 수 있게 업데이트할게요.',
  'video-sales2': '매출편2 영상은 준비 중입니다. 공개되면 이 챗봇에서 바로 보실 수 있게 업데이트할게요.',
  'video-ops': '운영편 영상은 준비 중입니다. 공개되면 이 챗봇에서 바로 보실 수 있게 업데이트할게요.',
  'video-founder': '창업자편 영상은 준비 중입니다. 공개되면 이 챗봇에서 바로 보실 수 있게 업데이트할게요.'
};

function buildChatReply(topicId, data){
  if(topicId === 'cost'){
    const lines = data.cost.tiers.map(t => {
      const total = t.rows.reduce((sum, r) => sum + r.price, 0);
      return `${esc(t.label)} 합계 ${won(total)}원`;
    });
    return `창업비용은 평수에 따라 달라집니다.<br>${lines.join('<br>')}<br>${esc(data.cost.loanNotice)}`;
  }
  if(topicId === 'profit'){
    const lines = data.profitStores.map(p =>
      `${esc(p.name)}(${esc(p.open)}) 월매출 ${won(p.salesWon)}원 · 순수익률 ${p.netRate}%`);
    return `실제 가맹점 수익 사례입니다.<br>${lines.join('<br>')}`;
  }
  if(topicId === 'ops'){
    const lines = data.process.map(p => `${p.step}.${esc(p.label)}`);
    return `운영은 다음 ${data.process.length}단계로 이어집니다.<br>${lines.join(' → ')}`;
  }
  if(topicId === 'apply'){
    return '네, 상담신청 폼으로 바로 이동할게요! 성함과 연락처만 남겨주시면 담당자가 순차적으로 연락드립니다.';
  }
  return CHAT_PLACEHOLDER[topicId] || '곧 더 자세한 내용으로 안내드릴게요.';
}

// 요소가 패널이 hidden인 동안 DOM에 들어와도(예: 최초 인사말은 패널이 열리기 전에
// 렌더된다) 애니메이션은 실제로 화면에 보일 때까지는 재생되지 않는다 — 처음 보일 때
// 1회 재생 후 animationend에서 클래스를 떼어내, 패널을 닫았다 다시 열어도 과거 대화가
// 또 한 번 다시 애니메이션 재생되지 않게 한다.
function playPopIn(el){
  if(!el) return;
  el.classList.add('chat-pop-in');
  el.addEventListener('animationend', () => el.classList.remove('chat-pop-in'), { once: true });
}

function appendChatBubble(role, html){
  const body = document.getElementById('chatBody');
  if(!body) return;
  if(role === 'bot'){
    const row = document.createElement('div');
    row.className = 'chat-bot-row';
    row.innerHTML = `
      <div class="chat-avatar-sm" aria-hidden="true"><span>든</span></div>
      <div class="chat-bubble chat-bubble-bot">${html}</div>`;
    body.appendChild(row);
    playPopIn(row);
    body.scrollTop = body.scrollHeight;
    return;
  }
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble-${role}`;
  bubble.innerHTML = html;
  body.appendChild(bubble);
  playPopIn(bubble);
  body.scrollTop = body.scrollHeight;
}

function appendTypingIndicator(){
  const body = document.getElementById('chatBody');
  if(!body) return null;
  const row = document.createElement('div');
  row.className = 'chat-bot-row';
  row.innerHTML = `
    <div class="chat-avatar-sm" aria-hidden="true"><span>든</span></div>
    <div class="chat-bubble chat-bubble-bot chat-bubble-typing" aria-label="답변 작성 중">
      <span class="chat-typing-dot"></span><span class="chat-typing-dot"></span><span class="chat-typing-dot"></span>
    </div>`;
  body.appendChild(row);
  playPopIn(row);
  body.scrollTop = body.scrollHeight;
  return row;
}

// 2026-10-14 사용자 요청 — "타이핑 중" 점 로딩도 같이 보이고, 그 다음 실제 답변도
// 페이드인+떠오르는 모션으로 나타나야 한다(둘 다 필요, 하나가 다른 하나를 대체하는
// 게 아님). appendTypingIndicator가 먼저 .chat-pop-in으로 나타났다가 600ms 뒤 제거,
// 실제 답변(appendChatBubble)과 칩(renderChipRow)이 같은 .chat-pop-in으로 새로 나타난다.
function appendBotReply(data, replyHtml, afterCb){
  const typing = appendTypingIndicator();
  setTimeout(() => {
    if(typing) typing.remove();
    appendChatBubble('bot', replyHtml);
    renderChipRow(data);
    if(afterCb) afterCb();
  }, 600);
}

function renderChipRow(data){
  const body = document.getElementById('chatBody');
  if(!body) return;
  const old = body.querySelector('.chat-chip-row');
  if(old) old.remove();
  const row = document.createElement('div');
  row.className = 'chat-chip-row';
  row.innerHTML = data.chatbot.topics.map((t, i) =>
    `<button type="button" class="chat-chip" data-topic="${esc(t.id)}" style="animation-delay:${(i * 0.05).toFixed(2)}s">${esc(t.label)}</button>`).join('');
  body.appendChild(row);
  [...row.children].forEach(playPopIn);
  body.scrollTop = body.scrollHeight;
}

function renderChatGreeting(data){
  const cb = data.chatbot;
  const body = document.getElementById('chatBody');
  if(!body) return;
  body.innerHTML = `
    <div class="chat-intro">
      <div class="chat-avatar-lg" aria-hidden="true"><span>든</span></div>
      <p class="chat-intro-title">${esc(cb.panelTitle)}</p>
      <p class="chat-intro-sub">${esc(cb.panelSubtitle)}</p>
    </div>
    <div class="chat-bot-row" style="animation-delay:0.15s">
      <div class="chat-avatar-sm" aria-hidden="true"><span>든</span></div>
      <div class="chat-bubble chat-bubble-bot">${cb.greeting.map(esc).join('<br>')}</div>
    </div>`;
  playPopIn(body.querySelector('.chat-intro'));
  playPopIn(body.querySelector('.chat-bot-row'));
  renderChipRow(data);
}

function renderChatbot(data){
  const fab = document.getElementById('chatFabBtn');
  const backdrop = document.getElementById('chatBackdrop');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatCloseBtn');
  const resetBtn = document.getElementById('chatResetBtn');
  const body = document.getElementById('chatBody');
  const form = document.getElementById('chatInputForm');
  const input = document.getElementById('chatTextInput');
  if(!fab || !backdrop || !panel || !body || !form || !input) return;

  input.placeholder = data.chatbot.inputPlaceholder;

  // FAB을 눌러 패널을 처음 열 때(그리고 리셋 버튼을 누를 때)도 인사말이 바로 뜨지
  // 않고 "타이핑 중" 표시가 잠깐 먼저 보인 뒤, 인사말이 .chat-pop-in(페이드인+떠오름)
  // 으로 나타난다. 이미 한 번 연 뒤에는(greeted=true) 재오픈마다 반복하지 않는다 —
  // 매번 타이핑 모션이 뜨면 거슬린다.
  let greeted = false;
  function showGreetingWithTyping(){
    body.innerHTML = '';
    const typing = appendTypingIndicator();
    setTimeout(() => {
      if(typing) typing.remove();
      renderChatGreeting(data);
    }, 600);
  }

  function openChat(){
    backdrop.hidden = false;
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    if(!greeted){
      greeted = true;
      showGreetingWithTyping();
    }
    body.scrollTop = body.scrollHeight;
  }
  function closeChat(){
    backdrop.hidden = true;
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
  }

  fab.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);
  backdrop.addEventListener('click', closeChat);
  resetBtn.addEventListener('click', showGreetingWithTyping);
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && !panel.hidden) closeChat();
  });

  // 위임 클릭 리스너 — initMenuTabs의 e.target.closest('[data-cat]') 관용구와 동일
  body.addEventListener('click', e => {
    const chip = e.target.closest('[data-topic]');
    if(!chip) return;
    const topic = data.chatbot.topics.find(t => t.id === chip.dataset.topic);
    if(!topic) return;

    appendChatBubble('user', esc(topic.label));
    appendBotReply(data, buildChatReply(topic.id, data), () => {
      if(topic.id === 'apply'){
        setTimeout(() => {
          closeChat();
          const target = document.querySelector('#inquiry');
          if(target) target.scrollIntoView({ behavior: 'smooth' });
        }, 900);
      }
    });
  });

  // mockSubmit()과 같은 "실제 전송 없음, 친절한 안내만" 원칙의 자유입력 버전
  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    appendChatBubble('user', esc(text));
    input.value = '';
    appendBotReply(data, '자유 입력 상담은 아직 준비 중입니다. 아래 버튼으로 궁금한 항목을 선택해주시면 더 정확히 안내드려요. 급하신 경우 "상담신청 하기"를 눌러주세요.');
  });
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
  renderChatbot(data);
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
  const chatFab = document.getElementById('chatFabBtn');
  if(chatFab) chatFab.setAttribute('hidden', '');
}

function boot(){
  initSmoothScroll();
  initMobileNav();
  initScrollSpy();
  initInquiryForm();
  initHeroSwiper();
  initCustomCursor();

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
