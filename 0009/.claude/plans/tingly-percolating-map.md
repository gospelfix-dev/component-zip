# "24시간 창업상담" 플로팅 버튼 + 분기식 FAQ 챗봇 팝업

## Context

사용자가 레퍼런스 사이트(grandmabuttumak.com)의 "우측 하단 플로팅 버튼 → 클릭 시
분기식 채팅 팝업" UX를 보여주며, 사용자가 버튼 클릭만으로 창업 관련 정보를 빠르게
확인할 수 있는 기능을 요청했다. 실제 AI/백엔드 없이, 토픽 칩을 클릭하면 미리 정해진
답변이 나오는 **정적 스크립트 FAQ 챗봇**이다.

이 세션 바로 앞 단계에서 데스크톱 하단 고정 상담바(`.sticky-inquiry`)와 모바일
FAB+모달(`.inquiry-fab`/`.inquiry-modal`)을 사용자 요청으로 **완전히 삭제**했고,
CLAUDE.md에 "사용자가 다시 요청하지 않는 한 되살리지 않는다"고 기록해뒀다. 지금
사용자가 새로 요청한 이 기능은 **같은 자리(우측 하단 고정)에 다시 뭔가를 띄운다는
점에서 형태는 비슷하지만, 목적(단순 문의 폼 중복 노출 vs. 클릭형 FAQ 챗봇)이 달라
별개 기능**이다. 과거에 삭제된 클래스/id(`.inquiry-fab`, `.inquiry-modal`,
`.sticky-inquiry`, `#inquiryFab`, `#inquiryModal`, `#stickyForm`,
`initStickyInquiryBar`, `initInquiryFab`)는 전혀 재사용하지 않고, 전부 새 이름
(`chat-*` 네임스페이스)으로 만든다. CLAUDE.md의 "되살리면 안 되는 것" 섹션에는 이
구분을 명시하는 안내 문단을 추가해 다음 세션이 두 기능을 혼동하지 않게 한다.

레퍼런스의 갈색 팔레트·"Powered by 프차톡" 푸터·영상 콘텐츠 4종은 그대로 베끼지
않는다 — 색상은 프로젝트의 `--red`/`--yellow` 토큰으로 바꾸고, 벤더 어트리뷰션은
해당 사항이 없어 뺀다. 비용/수익성/운영구조 3개 토픽은 `data/content.json`에 이미
있는 `cost`/`profitStores`/`process`를 그 자리에서 포맷해 답한다(숫자를 두 곳에
중복 저장하지 않음). 실제 데이터가 없는 상권전략/본사지원/영상보기 4종(총 6개
토픽)은 사용자가 명시적으로 확인한 대로 "상담 시 안내/준비 중" 톤의 솔직한
플레이스홀더 문구로 채운다(가짜 숫자를 지어내지 않음).

## 1. `data/content.json` — 새 `chatbot` 키 추가

마지막 키 `inquiry` 바로 뒤에 추가(현재 키 순서: `_readme, contact, process,
trustStats, equipment, menu, profitStores, cost, regions, stores, inquiry`).
UI 카피만 담고, 답변 본문(숫자 등)은 넣지 않는다:

```json
"chatbot": {
  "fabLabel": "24시간 창업상담",
  "panelTitle": "든든김밥 창업상담",
  "panelSubtitle": "자주 묻는 질문에 바로 답해드리는 챗봇입니다",
  "greeting": [
    "안녕하세요! 든든김밥 창업상담봇입니다.",
    "아래 버튼을 눌러 궁금한 항목을 바로 확인해보세요."
  ],
  "inputPlaceholder": "궁금한 점을 입력해보세요",
  "topics": [
    { "id": "apply",         "label": "상담신청 하기" },
    { "id": "cost",          "label": "창업비용" },
    { "id": "profit",        "label": "수익성" },
    { "id": "ops",           "label": "운영구조" },
    { "id": "location",      "label": "상권전략" },
    { "id": "support",       "label": "본사지원" },
    { "id": "video-sales1",  "label": "영상보기-매출편1" },
    { "id": "video-sales2",  "label": "영상보기-매출편2" },
    { "id": "video-ops",     "label": "영상보기-운영편" },
    { "id": "video-founder", "label": "영상보기-창업자편" }
  ]
}
```

## 2. `.claude/rules/04-data-contract.md` 업데이트

스키마 블록에 `"inquiry"` 다음 항목으로 추가:

```jsonc
  "chatbot": {                                                                  // UI 카피만 — 답변 본문은 JS 하드코딩
    "fabLabel": "string", "panelTitle": "string", "panelSubtitle": "string",
    "greeting": ["string"],                                                     // 봇 인사 1~2줄
    "inputPlaceholder": "string",
    "topics": [ { "id": "string(kebab-case)", "label": "string" } ]             // 10개, 배열 순서=칩 노출 순서
  }
```

규칙 bullet 추가:
> - **`chatbot.topics[].id`는 JS `buildChatReply()`의 분기 키로만 쓰인다.** 비용/수익성/
>   운영구조 답변은 `data.cost`/`data.profitStores`/`data.process`를 그 자리에서 포맷해
>   만든다(같은 숫자를 `chatbot` 아래 다시 하드코딩하지 않는다 — 두 곳에 두면 싱크가
>   깨진다). 소스 데이터가 없는 `location`/`support`/`video-*` 6개 토픽은 지어낸 숫자
>   없이 "상담 시 안내/준비 중" 톤의 플레이스홀더 문자열을 `script.js`에 직접 쓴다.

## 3. `index.html` — 새 마크업

`.custom-cursor` 블록(삭제 전 마지막 fixed 요소) 바로 뒤, Swiper `<script>` 앞에 삽입:

```html
<button type="button" class="chat-fab" id="chatFabBtn" aria-haspopup="dialog" aria-controls="chatPanel" aria-expanded="false">
  <svg class="chat-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
  <span class="chat-fab-label">24시간 창업상담</span>
</button>

<div class="chat-backdrop" id="chatBackdrop" hidden></div>

<div class="chat-panel" id="chatPanel" role="dialog" aria-modal="true" aria-labelledby="chatPanelTitle" hidden>
  <header class="chat-panel-head">
    <div class="chat-avatar-sm" aria-hidden="true"><span>든</span></div>
    <div class="chat-head-text">
      <p class="chat-head-title" id="chatPanelTitle">든든김밥 창업상담</p>
      <p class="chat-head-sub">자주 묻는 질문 챗봇</p>
    </div>
    <button type="button" class="chat-icon-btn" id="chatResetBtn" aria-label="처음으로">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/></svg>
    </button>
    <button type="button" class="chat-icon-btn" id="chatCloseBtn" aria-label="닫기">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </header>

  <div class="chat-body" id="chatBody"></div>

  <form class="chat-input-row" id="chatInputForm">
    <input type="text" id="chatTextInput" name="chatText" placeholder="궁금한 점을 입력해보세요" autocomplete="off" required>
    <button type="submit" class="chat-send-btn" aria-label="전송">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/></svg>
    </button>
  </form>
</div>
```

아이콘 3종(`message-circle`/`rotate-ccw`/`x`) + 전송 아이콘(`send`)은 기존
`.header-phone-label svg`와 동일하게 lucide.dev path만 복사한 인라인 SVG — CDN
추가 없음. `chatTextInput`의 placeholder는 정적 폴백이고, JS가 렌더 시
`data.chatbot.inputPlaceholder`로 덮어써 소스가 하나로 유지된다.

## 4. `assets/css/style.css` 추가

**위치**: `.custom-cursor`의 `@media (hover:none), (pointer:coarse){ ... }` 블록
(약 74-76번째 줄) 바로 뒤, `.section-head{...}` 전역 규칙 앞 — "플로팅/전역 오버레이는
파일 앞쪽에 모아둔다"는 `.custom-cursor` 배치 관례를 그대로 따른다.

**z-index**: 기존 스케일(`.site-header` 40, `.custom-cursor` 999 — 과거 삭제된
`.inquiry-fab`/`.sticky-inquiry`는 50, `.inquiry-modal`은 60)을 그대로 계승한다
(Plan 에이전트 초안의 900대는 기존 스케일과 동떨어져 수정함): `chat-fab` 50,
`chat-backdrop` 55, `chat-panel` 60.

```css
/* ===== 24시간 창업상담 챗봇(FAB+패널) =====
   .inquiry-fab/.inquiry-modal/.sticky-inquiry(2026-10-14 삭제)와는 다른 신규 기능 —
   클래스/id를 전부 새로 만든다(CLAUDE.md "되살리면 안 되는 것" 참고). FAB은 정적이다
   (펄스 등 반복 애니메이션 없음 — 승인된 무한반복 예외는 이미 2건이라 3번째를 추가하지
   않는다, 추가하려면 사용자 확인 필요). 패널 오픈 전환은 transform/opacity만 쓴다.
   z-index는 기존 스케일을 따른다(.site-header 40 < 여기 50/55/60 < .custom-cursor 999). */
.chat-fab{
  position:fixed; right:clamp(16px,3vw,32px); bottom:clamp(16px,3vw,32px); z-index:50;
  display:inline-flex; align-items:center; gap:8px;
  background:var(--red); color:var(--white); font-weight:700;
  font-size:clamp(13px,1.3vw,15px);
  padding:14px 22px; border-radius:var(--radius-pill);
  box-shadow:0 10px 24px rgba(0,0,0,0.22);
  border:none; cursor:pointer;
  transition:transform 0.2s ease, background 0.2s ease;
}
.chat-fab:hover{ background:var(--red-deep); transform:translateY(-2px); }
.chat-fab-icon{ width:20px; height:20px; flex-shrink:0; }

.chat-backdrop{ position:fixed; inset:0; z-index:55; background:rgba(11,61,32,0.45); animation:fade-in 0.2s ease; }
.chat-backdrop[hidden]{ display:none; }

.chat-panel{
  position:fixed; right:clamp(16px,3vw,32px); bottom:clamp(88px,10vw,116px); z-index:60;
  width:min(380px, calc(100vw - 32px)); height:min(600px, calc(100vh - 140px));
  background:var(--bg-card); border-radius:var(--radius-card);
  box-shadow:0 20px 48px rgba(0,0,0,0.28);
  display:flex; flex-direction:column; overflow:hidden;
  animation:chatPanelIn 0.25s ease;
}
.chat-panel[hidden]{ display:none; }

.chat-panel-head{
  display:flex; align-items:center; gap:10px;
  background:var(--bg-dark); color:var(--text-invert);
  padding:14px 16px; flex-shrink:0;
}
.chat-head-text{ flex:1; min-width:0; }
.chat-head-title{ font-size:15px; font-weight:800; }
.chat-head-sub{ font-size:12px; color:var(--muted); }
.chat-icon-btn{
  width:32px; height:32px; border-radius:var(--radius-pill); /* 정사각 박스+pill → 시각적 원 */
  display:inline-flex; align-items:center; justify-content:center;
  background:rgba(251,243,227,0.1); color:var(--text-invert);
  border:none; cursor:pointer; flex-shrink:0;
}
.chat-icon-btn svg{ width:16px; height:16px; }

/* 아바타 원: .menu-ph(그라디언트+이니셜 placeholder) 패턴 재사용(assets/css/style.css
   의 .menu-ph/.menu-ph-initial) — 새 그라디언트를 만들지 않는다. */
.chat-avatar-sm{
  width:28px; height:28px; border-radius:var(--radius-circle); flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  background:linear-gradient(145deg, var(--yellow), var(--red));
}
.chat-avatar-sm span{ font-size:13px; font-weight:800; color:var(--white); }
.chat-avatar-lg{
  width:clamp(56px,6vw,72px); height:clamp(56px,6vw,72px); border-radius:var(--radius-circle);
  display:flex; align-items:center; justify-content:center; margin:0 auto 10px;
  background:linear-gradient(145deg, var(--yellow), var(--red));
}
.chat-avatar-lg span{ font-size:clamp(22px,2.4vw,28px); font-weight:800; color:var(--white); }

.chat-body{
  flex:1; overflow-y:auto; padding:18px 16px; display:flex; flex-direction:column; gap:10px;
  background:var(--bg-card-2);
}
.chat-intro{ text-align:center; margin-bottom:6px; }
.chat-intro-title{ font-size:15px; font-weight:800; }
.chat-intro-sub{ font-size:12px; color:var(--text-dim); margin-top:4px; }

.chat-bubble{ max-width:88%; padding:10px 14px; border-radius:var(--radius-card); font-size:13px; line-height:1.5; }
.chat-bubble-bot{ align-self:flex-start; background:var(--white); color:var(--text); }
.chat-bubble-user{ align-self:flex-end; background:var(--red); color:var(--white); }

.chat-chip-row{ display:flex; flex-wrap:wrap; gap:8px; margin-top:4px; }
.chat-chip{
  font-size:12px; font-weight:700; padding:8px 14px; border-radius:var(--radius-pill);
  background:var(--white); border:1px solid var(--line); color:var(--text);
  cursor:pointer; transition:transform 0.2s ease, background 0.2s ease;
}
.chat-chip:hover{ background:var(--bg-card-2); transform:translateY(-1px); }

.chat-input-row{
  display:flex; align-items:center; gap:8px; padding:12px; flex-shrink:0;
  border-top:1px solid var(--line); background:var(--bg-card);
}
.chat-input-row input{
  flex:1; min-width:0; padding:10px 16px; border-radius:var(--radius-pill);
  border:1px solid var(--line); font-size:13px; background:var(--bg);
}
/* 원형 전송 버튼: --radius-circle 대신 "정사각형 박스(width=height)+--radius-pill"
   트릭을 쓴다. 999px가 38px 박스의 어느 변보다 커서 네 모서리가 전부 반원으로
   수렴해 시각적으로 완전한 원이 되지만, 토큰 자체는 "버튼→pill" 규칙을 그대로
   따른다(--radius-circle은 아바타/아이콘/프로세스 원 전용으로 남긴다,
   .claude/rules/02-css.md 참고). */
.chat-send-btn{
  width:38px; height:38px; flex-shrink:0; border-radius:var(--radius-pill);
  display:flex; align-items:center; justify-content:center;
  background:var(--red); color:var(--white); border:none; cursor:pointer;
  transition:background 0.2s ease;
}
.chat-send-btn:hover{ background:var(--red-deep); }
.chat-send-btn svg{ width:16px; height:16px; }

@media (max-width:1024px){
  .chat-panel{ right:0; left:0; top:0; bottom:0; width:100%; height:100%; border-radius:0; }
}
```

FAB은 모바일에서도 같은 pill+라벨 형태를 유지한다(아이콘 전용 축소 변형 없음) —
`max-width:1024px`에서 바뀌는 건 패널이 전체화면 시트가 되는 것뿐, "레이아웃이 실제로
바뀌어야 하는 곳에만" 단일 브레이크포인트를 쓴다는 원칙과 일치.

**`prefers-reduced-motion` 블록**(파일 끝 기존 블록에 2줄 추가):

```css
  .chat-panel{ animation:none; }
  .chat-backdrop{ animation:none; }
```

## 5. `assets/css/animations.css` 추가

새 1회성 키프레임(삭제된 `modal-sheet-in`과 같은 기법이지만 이름은 새로 지음 —
"되살리기"로 오인되지 않도록):

```css
/* .chat-panel 전용 오픈 전환. 예전 삭제된 .inquiry-modal-sheet의 modal-sheet-in과 같은
   "translateY+opacity, 0.25s ease, 1회성" 기법을 재사용하지만, 삭제된 코드를 되살리는
   것으로 오인되지 않도록 새 키프레임 이름(chatPanelIn)을 쓴다. infinite 키워드가 없어
   회귀 스윕("grep infinite" 2건 예외) 대상이 아니다. */
@keyframes chatPanelIn{
  from{ opacity:0; transform:translateY(16px); }
  to{ opacity:1; transform:translateY(0); }
}
```

파일 헤더의 "승인된 무한 반복 예외" 목록(현재 2건: marquee-scroll, cursorBadgeSpin)은
건드리지 않는다 — `chatPanelIn`은 무한반복이 아니므로 3번째 예외가 아니다.

## 6. `assets/js/script.js` — 새 함수

기존 `fill()`/`esc()`/`won(n){ return Number(n).toLocaleString('ko-KR'); }` 재사용.
`initMenuTabs`의 `e.target.closest('[data-cat]')` 위임 클릭 관용구와 동일한 패턴으로
토픽 칩을 처리. `initSmoothScroll`과 동일하게
`target.scrollIntoView({behavior:'smooth'})`로 상담신청 토픽에서 `#inquiry`로 이동.

```js
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

function appendChatBubble(role, html){
  const body = document.getElementById('chatBody');
  if(!body) return;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble-${role}`;
  bubble.innerHTML = html;
  body.appendChild(bubble);
  body.scrollTop = body.scrollHeight;
}

function renderChipRow(data){
  const body = document.getElementById('chatBody');
  if(!body) return;
  const old = body.querySelector('.chat-chip-row');
  if(old) old.remove();
  const row = document.createElement('div');
  row.className = 'chat-chip-row';
  row.innerHTML = data.chatbot.topics.map(t =>
    `<button type="button" class="chat-chip" data-topic="${esc(t.id)}">${esc(t.label)}</button>`).join('');
  body.appendChild(row);
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
    <div class="chat-bubble chat-bubble-bot">${cb.greeting.map(esc).join('<br>')}</div>`;
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
  renderChatGreeting(data);

  function openChat(){
    backdrop.hidden = false;
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
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
  resetBtn.addEventListener('click', () => renderChatGreeting(data));
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
    appendChatBubble('bot', buildChatReply(topic.id, data));
    renderChipRow(data);

    if(topic.id === 'apply'){
      setTimeout(() => {
        closeChat();
        const target = document.querySelector('#inquiry');
        if(target) target.scrollIntoView({ behavior: 'smooth' });
      }, 900);
    }
  });

  // mockSubmit()과 같은 "실제 전송 없음, 친절한 안내만" 원칙의 자유입력 버전
  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    appendChatBubble('user', esc(text));
    input.value = '';
    setTimeout(() => {
      appendChatBubble('bot', '자유 입력 상담은 아직 준비 중입니다. 아래 버튼으로 궁금한 항목을 선택해주시면 더 정확히 안내드려요. 급하신 경우 "상담신청 하기"를 눌러주세요.');
      renderChipRow(data);
    }, 600);
  });
}
```

**호출 위치**:
- `renderAll(data)` — 맨 마지막 줄에 `renderChatbot(data);` 추가(`data.cost`/
  `data.profitStores`/`data.process`/`data.chatbot`가 전부 fetch 완료 후에만 쓸 수
  있으므로 `boot()`가 아니라 `renderAll()`에 둔다 — `initMenuTabs`/`initCostTierToggle`과
  같은 이유).
- `boot()` — 변경 없음.
- `showFetchError()` — fetch 실패 시 FAB이 죽은 버튼으로 남지 않도록
  `document.getElementById('chatFabBtn')?.setAttribute('hidden','')` 한 줄 추가.

## 7. `CLAUDE.md` 업데이트

**아키텍처 다이어그램** — `renderContact / initCountdown` 줄 다음, `↓ DOM 반영 후` 전에 추가:

```
 ├─ renderContact / initCountdown(상담 마감 D-day, 실제 Date 계산)
 └─ renderChatbot(data)    24시간 창업상담 플로팅 챗봇(.chat-fab/.chat-panel) — 초기
                           인사+토픽칩 렌더, FAB/닫기/배경클릭/ESC 핸들러, 칩 클릭 위임
                           리스너로 FAQ 분기, 자유입력 mock 답변, "상담신청 하기" 선택 시
                           패널을 닫고 #inquiry로 스크롤. data.cost/profitStores/process/
                           chatbot을 씀 — 정적 스크립트 FAQ 트리이며 실제 AI/백엔드
                           연동이 아니다(나중에 실제 API로 착각해 연결하지 않도록 명시).
```

**되살리면 안 되는 것** — 기존 항목은 유지하고, 혼동 방지 문단 추가:

> **참고(혼동 방지)**: 위에서 삭제된 `.sticky-inquiry`/`.inquiry-fab`/`.inquiry-modal`과,
> 같은 날(2026-10-14) 이후 새로 추가된 **"24시간 창업상담" 플로팅 챗봇
> (`.chat-fab`/`.chat-panel`, `renderChatbot`)은 서로 다른 기능이다** — 혼동하지 말 것.
> 전자는 단순 문의 폼을 하단에 중복 노출하던 위젯으로 사용자가 명시적으로 삭제를
> 요청했고, 후자는 그와 무관하게 사용자가 **새로** 요청한 FAQ형 챗봇(클릭형 분기
> 응답, 실제 백엔드 없음)이다. 두 기능은 클래스/id가 전혀 겹치지 않는다. "하단 고정
> FAB"이라는 이유만으로 이 챗봇을 이 규칙에 묶어 삭제하지 않는다 — 삭제 대상은 오직
> 위에 명시된 옛 클래스/id들뿐이다.

## 8. `.claude/rules/03-javascript.md` 업데이트

구조 다이어그램에 `renderContact / initCountdown()` 다음 줄로 추가:

```
 ├─ renderContact / initCountdown()  inquiry.deadlineDate 기준 실제 Date 계산
 ├─ renderChatbot(data)   24시간 창업상담 FAB+패널(.chat-fab/.chat-panel) — FAB 클릭으로만
 │                        열림(자동 오픈 없음), 칩 클릭은 e.target.closest('[data-topic]')
 │                        위임 리스너(initMenuTabs와 동일 관용구) 1개로 처리. 정적 FAQ
 │                        트리이지 실제 AI/백엔드 호출이 아니다.
 ├─ initScrollReveal(sel)  공용 1회성 스크롤 리빌 유틸(IntersectionObserver, threshold 0.15)
 └─ initCountUp(sel)       공용 1회성 카운트업 유틸(threshold 0.4) — 신뢰지표/매출 숫자
```

## 9. `docs/design.md` 업데이트 (3곳)

**(a) 새 컴포넌트 13번** — 기존 `12. 푸터` 다음에 추가:

```
13. **24시간 창업상담 챗봇**(`.chat-fab`/`.chat-panel`): 데스크톱 고정폭 카드(380×600,
   `--radius-card`), 모바일(`max-width:1024px`)은 전체화면 시트. FAB은 `--red` 배경+
   `--radius-pill`의 정적 버튼(반복 애니메이션 없음). 헤더바는 `--bg-dark`+
   `--text-invert`, 아바타 원(`.chat-avatar-sm/-lg`)은 `.menu-ph`와 같은 그라디언트
   (`--yellow`→`--red`)+이니셜 placeholder 패턴 재사용. 말풍선은 봇=`--white`/
   사용자=`--red` 2변형. 전송 버튼은 `--radius-circle`이 아니라 "정사각형 박스+
   `--radius-pill`" 트릭으로 원형을 낸다(circle 토큰은 아바타/아이콘 전용 유지). 오픈
   전환은 `@keyframes chatPanelIn`(translateY+opacity, 0.25s, 1회성) — 삭제된
   `modal-sheet-in`과 기법은 같지만 이름은 새로 지었다. 토픽 칩 10개 중 비용/수익성/
   운영구조는 `data.cost`/`data.profitStores`/`data.process`를 그 자리에서 포맷해
   답하고, 상권전략·본사지원·영상 4종은 소스 데이터가 없어 "상담 시 안내/준비 중"
   톤의 플레이스홀더 문구를 쓴다(사용자 확인된 선택). "상담신청 하기" 선택 시 패널을
   닫고 `#inquiry`로 스무스 스크롤한다. 실제 AI/백엔드 연동이 아닌 정적 스크립트 FAQ다.
```

**(b) `Animation` 섹션의 stale 줄 교체** — "문의 모달(바텀시트) 오픈은 `modal-sheet-in`
1회 재생." (이미 삭제된 모달을 가리켜 코드와 어긋남) →

```
- 챗봇 패널(`.chat-panel`) 오픈은 `chatPanelIn` 1회 재생(translateY+opacity).
```

**(c) 컴포넌트 `11. 창업문의`의 stale 서술 정리** — 현재 삭제된 `#stickyForm`/
`#inquiryFab`/`#inquiryModal`을 존재하는 것처럼 적어 코드와 어긋난다. 다음으로 교체:

```
11. **창업문의**: 인라인 폼(`#inquiryForm`) 1곳만 남아있다 — 2026-10-14 데스크톱 하단
   고정 바와 모바일 FAB+모달은 사용자 요청으로 삭제됐다(CLAUDE.md "되살리면 안 되는 것"
   참고). `mockSubmit()` 공용 함수가 제출 버튼 텍스트를 2초간 "문의 접수 완료"로
   바꾸는 mock만 수행한다(실제 전송 없음). 카운트다운(`initCountdown`)은
   `inquiry.deadlineDate` 기준 실제 `Date` 계산으로 D-day 텍스트를 1분마다
   갱신한다 — 가짜 할인 타이머가 아니다.
```

**(d, 선택적 추가 정리)** `Shapes` 표의 `--radius-circle` 행 "메뉴 placeholder 원,
프로세스 단계 아이콘 원, FAB 버튼"도 과거 삭제된 원형 FAB을 가리켜 stale하다 — 새
챗봇 FAB은 pill 모양(원이 아님)이므로 "FAB 버튼"을 빼고 "챗봇 아바타 원"으로 교체:
`메뉴 placeholder 원, 프로세스 단계 아이콘 원, 챗봇 아바타 원`.

## 10. 검증 계획

```bash
# 회귀 스윕
python3 -c "import json;json.load(open('data/content.json'));print('ok')"
grep -ohE 'assets/[A-Za-z0-9_./-]+' index.html assets/css/*.css assets/js/*.js data/content.json | sort -u | \
  while read f; do [ -f "$f" ] || echo "MISSING: $f"; done
grep -n "infinite" assets/css/*.css   # marquee + cursorBadgeSpin 2건만 — 3번째가 생기면 안 됨
grep -oE "font-size:[^;]+" assets/css/style.css   # 전부 12~120px 범위
python3 -m http.server 8765
```

브라우저(`claude-in-chrome`) 체크:
1. FAB이 우측 하단에 정적으로(펄스 없이) 보이고 자동으로 열리지 않는지.
2. FAB 클릭 → `chatPanelIn` 애니메이션과 함께 패널 오픈, 아바타+타이틀+서브타이틀+
   인사 말풍선+토픽 칩 10개 노출.
3. 10개 칩을 각각 클릭해 — 창업비용/수익성/운영구조는 `data.cost`/`profitStores`/
   `process` 실제 숫자가 `won()` 포맷으로 정확히 반영되는지, 나머지 6개는 솔직한
   플레이스홀더 문구가 나오는지, "상담신청 하기"는 ~0.9초 후 패널이 닫히고
   `#inquiry`로 스무스 스크롤되는지.
4. 매 응답 뒤 칩 행이 중복되지 않고 교체되는지, `chatBody`가 자동으로 바닥까지
   스크롤되는지.
5. 자유 텍스트 입력 → 사용자 말풍선 즉시 표시, 지연 후 mock 봇 응답+칩 재노출.
6. Escape/배경 클릭/X 버튼 모두 패널을 닫는지, 리셋 버튼이 초기 인사 상태로
   되돌리는지.
7. 1024px 경계 폭에서 데스크톱 고정 카드 ↔ 모바일 전체화면 시트 전환 확인.
8. `prefers-reduced-motion: reduce`에서 패널/백드롭이 애니메이션 없이 즉시 뜨는지.
9. 구현 후 회귀 스윕 재실행.

## 수정 대상 파일

- `data/content.json`
- `.claude/rules/04-data-contract.md`
- `index.html`
- `assets/css/style.css`
- `assets/css/animations.css`
- `assets/js/script.js`
- `CLAUDE.md`
- `.claude/rules/03-javascript.md`
- `docs/design.md`
