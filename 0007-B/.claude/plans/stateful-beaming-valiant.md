# 01 경쟁력 섹션 — 매장 실측 데이터 증빙 통계 블록 추가

## Context

사용자가 다른 족발 프랜차이즈 브랜드의 마케팅 그래픽(참고 이미지)을 보여주며 "경쟁력 섹션도
동일하게 제작해줘"라고 요청했다. 원본 이미지는 (1) 배경에 수십 개 매장의 매출 카드가 촘촘히
깔린 그리드, (2) 중앙 상단의 큰 퍼센트 통계("35%")+헤드라인("매장 셋중 하나는 억대매출"),
(3) 겹쳐진 원형 3개(왼쪽/중앙(가장 크고 골드 솔리드)/오른쪽)에 각각 통계 콜아웃이 있는
구조다.

이 이미지의 수치·매장명·수상 이력은 **전부 다른 브랜드의 실제 데이터**다. 그대로 복제하면
고품격대패가 갖지도 않은 실적·수상 이력을 사실인 것처럼 표시하게 되므로, 사용자에게 확인해
다음을 확정했다:
- 배경 매출카드 그리드는 **만들지 않는다** — 고품격대패 실제 매장은 3곳뿐이라 그대로 채우면
  데이터가 크게 부족하고, 허구 매장으로 채우면 정직하지 않다.
- 중앙 퍼센트 + 원형 3개 통계는 **`data/content.json`의 기존 `profit` 배열(3개 매장 실측
  데이터)로 재계산한 자체 통계**를 쓴다. 새 매출/수상 문구를 창작하지 않는다.
- 원형(●) 통계 콜아웃은 이 프로젝트의 확정 규칙("`--radius-circle`은 셀프바·고기 사진 원형
  크롭 전용, 배지·버튼에 안 쓴다")의 첫 예외다 — 사용자가 "원형으로 진행 + CLAUDE.md/
  docs/design.md 예외 문서화"를 명시적으로 선택했다.

## 데이터 (변경 없음, 새 필드 추가 안 함)

`data/content.json`의 기존 `profit` 배열(현재 03 수익분석에서도 사용 중)을 그대로 재사용한다.

```json
[
  { "name": "왕십리 본점", "open": "2024. 11. 27 오픈", "salesWon": 47000000, "rate": 36.1, "tall": false },
  { "name": "천호 직영점", "open": "2025. 03. 04 오픈", "salesWon": 67000000, "rate": 40.2, "tall": true },
  { "name": "시흥 은계점", "open": "2026. 01. 28 오픈", "salesWon": 39000000, "rate": 33.3, "tall": false }
]
```

- 평균 순수익률 = (36.1+40.2+33.3)/3 ≈ **36.5%** → 상단 큰 퍼센트 헤드라인.
- 배열 순서를 그대로 좌→중→우 배치로 매핑(왕십리→왼쪽, 천호(tall:true, 강조)→중앙 솔리드,
  시흥→오른쪽). 라벨은 순서/`tall` 플래그로 유도: `['1호점', '직영 매장', '최신 오픈']`.
- **고정 가정**: `profit` 배열이 정확히 3개일 때만 이 레이아웃이 맞는다. 매장이 늘어나면
  `renderProof`/`CIRCLE_LABELS`/`.proof-circles` 3열 전제를 함께 재검토해야 한다 — 코드
  주석으로 남겨둔다.

## 구현

### 1. `index.html` — `#competitiveness` 안, `.trust-grid`(현재 108행) 바로 뒤에 삽입

기존 `.feature-list`/`.wave-rule`/`.diamond-divider`/`.trust-grid` 구조는 그대로 둔다(다이아몬드
구분자는 "정확히 2곳" 규칙이 있어 새로 추가하지 않음 — 대신 CSS `border-top`으로 구획).

```html
<!-- 01 경쟁력 — 매장 실측 데이터 기반 자체 통계 (신규). profit 배열을 그대로 재사용하고
     (새 필드 없음), 평균 순수익률·원형 라벨은 script.js 의 renderProof 가 계산한다. -->
<div class="proof-stat" id="proofStat" data-content><!-- data/content.json → profit (평균 재계산) --></div>
```

### 2. `assets/js/script.js`

**`renderProof` 신규 함수** — `renderTrust`(44-48행) 뒤, `renderMeat`(51행) 앞에 추가:

```js
const CIRCLE_LABELS = ['1호점', '직영 매장', '최신 오픈'];
const renderProof = (list = []) => {
  if (!list.length) return;
  const avgRate = (list.reduce((sum, s) => sum + s.rate, 0) / list.length).toFixed(1);
  fill('proofStat', `
    <div class="proof-headline">
      <div class="running-head">3개 매장 실측 데이터</div>
      <div class="proof-number" data-count-to="${avgRate}">0%</div>
      <p class="proof-lede">3개 매장 평균 <b>순수익률</b></p>
    </div>
    <div class="proof-circles">
      ${list.map(({ name, rate, tall }, i) => `
        <div class="proof-circle${tall ? ' proof-circle--center' : ''}">
          <span class="proof-circle-label">${esc(CIRCLE_LABELS[i] ?? '')}</span>
          <span class="proof-circle-rate" data-count-to="${rate}">0%</span>
          <span class="proof-circle-name">${esc(name)}</span>
        </div>`).join('')}
    </div>`);
};
```

기존 `esc()`/`fill()` 재사용, 새 유틸 없음.

**`animateCount`(146행) 소수점 지원 확장** — 현재 `Math.round`+`formatWon`으로 정수만
처리한다. 포맷터를 주입 가능하게 최소 일반화(기존 유일 호출부인 03 수익분석은 인자 생략 시
기존과 동일 동작이라 회귀 없음):

```js
const animateCount = (el, target, duration = 1100, format = (n) => formatWon(Math.round(n))) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = format(target);
    return;
  }
  const start = performance.now();
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = format(target * easeOutCubic(p));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
```

**`renderAll`(450행)** — `renderTrust` 다음, `renderMeat` 앞에 `renderProof(data.profit);` 추가.

**`initScrollReveal`(167행)** — `targets` 배열의 `#trustGrid .trust-badge` 다음 줄에:

```js
...document.querySelectorAll('#proofStat .proof-headline'),
...document.querySelectorAll('#proofStat .proof-circle'),
```

콜백 안, 기존 `revenue-figure` 카운트업 체크 바로 뒤에:

```js
const percent = entry.target.querySelector('.proof-number[data-count-to], .proof-circle-rate[data-count-to]');
if (percent) animateCount(percent, Number(percent.dataset.countTo), 1100, (n) => `${n.toFixed(1)}%`);
```

새 `IntersectionObserver` 생성 없음 — 기존 옵저버 하나에 대상만 추가.

### 3. `assets/css/style.css`

**컴포넌트 블록** — `.trust-badge p{...}`(342행) 뒤, 01 섹션 기존 미디어쿼리(344행) 앞에 삽입:

```css
/* ============================================================
   01 경쟁력 — 매장 실측 데이터 증빙 통계 (.proof-*, 신규)
   참고 이미지의 "배경 매출카드 그리드 + 퍼센트 헤드라인 + 원형 3개 통계" 중 배경 그리드는
   채택하지 않는다(실매장 3곳뿐이라 데이터 부족). profit 배열을 그대로 재사용한다(새 필드
   없음, script.js 의 renderProof 가 평균/라벨 계산).
   ⚠ .proof-circle 은 --radius-circle 을 셀프바·고기 사진 크롭 밖에 처음 쓰는 예외다(사용자
   승인, CLAUDE.md/docs/design.md 동시 갱신 — 아래 "문서 동기화" 참고).
   ============================================================ */
.proof-stat{ border-top:1px solid var(--paper-line); margin-top:64px; padding-top:64px; }

.proof-headline{
  max-width:640px; margin:0 auto 56px; text-align:center;
  opacity:0; transform:translateY(16px);
}
.proof-headline.in-view{ animation:fadeUp .6s cubic-bezier(.22,1,.36,1) both; }
.proof-number{
  font-family:var(--font-sans); font-weight:900; font-size:clamp(64px,10vw,120px);
  line-height:1; color:var(--bronze); margin:8px 0 16px;
}
.proof-lede{ font-family:var(--font-sans); font-weight:700; font-size:22px; color:var(--ink); }
.proof-lede b{ color:var(--bronze); font-weight:800; }

.proof-circles{ display:flex; align-items:center; justify-content:center; }
.proof-circle{
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px;
  width:200px; height:200px; border-radius:var(--radius-circle); border:1px solid var(--paper-line);
  background:var(--paper-2); padding:16px; text-align:center; flex-shrink:0;
  opacity:0; transform:scale(.9);
}
.proof-circle.in-view{ animation:badgeIn .45s cubic-bezier(.22,1,.36,1) var(--d,0ms) both; }
.proof-circle + .proof-circle{ margin-left:-32px; }
.proof-circle--center{
  width:260px; height:260px; background:var(--bronze); border-color:var(--bronze); z-index:1;
}
.proof-circle-label{
  font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-faint);
}
.proof-circle--center .proof-circle-label{ color:rgba(255,255,254,.75); }
.proof-circle-rate{
  display:block; font-family:var(--font-sans); font-weight:900; font-size:clamp(28px,3.4vw,40px);
  color:var(--ink); line-height:1;
}
.proof-circle--center .proof-circle-rate{ color:var(--paper); font-size:clamp(32px,3.8vw,48px); }
.proof-circle-name{ font-size:13px; font-weight:700; color:var(--ink-dim); }
.proof-circle--center .proof-circle-name{ color:var(--paper); }
```

색상은 `--bronze`/`--bronze-dark`/`--bronze-tint`/`--paper`/`--ink` 계열만 사용 — 골드 hex,
`--red` 미사용. `font-size`는 12px~120px(clamp 상한) 범위 내.

**반응형** — 기존 01 섹션 미디어쿼리(344-348행) 안에 병합(새 브레이크포인트 안 만듦):

```css
@media (max-width:1024px){
  .feature-row{ grid-template-columns:1fr; gap:12px; padding:28px 0; }
  .trust-grid{ grid-template-columns:repeat(2,1fr); gap:24px 16px; margin-top:8px; }
  #competitiveness .section-head h2{ white-space:normal; }
  .proof-stat{ margin-top:40px; padding-top:40px; }
  .proof-number{ font-size:clamp(56px,16vw,88px); }
  .proof-circles{ flex-direction:column; gap:24px; }
  .proof-circle + .proof-circle{ margin-left:0; }
  .proof-circle{ width:220px; height:220px; }
  .proof-circle--center{ width:240px; height:240px; }
}
```

**`prefers-reduced-motion`**(620행 블록) — `.feature-row, .trust-badge` 뒤에 `.proof-headline,
.proof-circle` 추가.

### 4. `assets/css/animations.css`

변경 없음 — `fadeUp`(헤드라인)과 `badgeIn`(원형, 트러스트 배지와 동일)을 재사용한다.
`wordmarkIntro`/`wordmarkShine`(무한 반복 예외)은 이 컴포넌트에 쓰지 않는다.

### 5. 문서 동기화 (사용자 승인됨 — 코드와 같이 처리)

- `CLAUDE.md` "채택한 실제 브랜드 모티프" 절: "원형 크롭 그리드" 항목 문구를 "02 메뉴·셀프바
  + 01 경쟁력 증빙 통계"로 확장하고 `.proof-*` 신규 항목을 추가.
- `docs/design.md` Shapes 표의 `--radius-circle` 용도란과 Do/Don't 문구를 "셀프바·고기 사진
  원형 크롭 + 01 경쟁력 증빙 통계 원형 콜아웃"으로 갱신.
- `.claude/rules/02-css.md:41`의 동일 문구도 함께 갱신.

## 검증

```bash
python3 -m http.server 8765
python3 -c "import json;json.load(open('data/content.json'));print('ok')"   # 무변경이지만 확인

# 데스크톱 1440px / 모바일 800px 스크린샷 (≲450px 폭은 헤드리스 렌더링 결함 있어 회피)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=1440,3200 --virtual-time-budget=9000 \
  --screenshot=/tmp/proof-desktop.png "http://localhost:8765/index.html"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=800,3600 --virtual-time-budget=9000 \
  --screenshot=/tmp/proof-mobile.png "http://localhost:8765/index.html"

# 회귀 스윕
grep -n "font-serif" assets/css/style.css index.html      # 0건
grep -n "var(--red)" assets/css/style.css                  # .seal-badge/.revenue-figure 외 없어야 함(신규 블록은 0건)
grep -ohE 'assets/[A-Za-z0-9_./-]+' index.html assets/css/*.css assets/js/*.js data/content.json | sort -u | \
  while read f; do [ -f "$f" ] || echo "MISSING: $f"; done
```

스크린샷 확인 포인트: 원 3개가 겹쳐 있고 중앙(천호 직영점)이 더 크고 솔리드 브론즈인지,
모바일에서 세로 스택으로 전환되는지, 색상이 전부 브론즈 계열(골드/레드 미사용)인지.
