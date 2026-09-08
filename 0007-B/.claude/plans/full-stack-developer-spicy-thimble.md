# 0007-B 벤치마크 기반 재작업 — 아이보리/브론즈 정체성 유지, 구조·모티프만 차용

## Context

사용자가 두 프랜차이즈 창업 랜딩(100chae.com, hyojadong.kr)을 벤치마크로 제시하며 0007-B("고품격대패" 시안B) 재작업을 요청했다. 두 사이트를 헤드리스 스크린샷 + 텍스트 크롤로 직접 확인한 결과:

- **100chae.com**: 레드/화이트 톤. 로드 시 수상 인증 팝업 2개 자동 표시, 굵은 초대형 슬로건 헤드라인, "SINCE 2013" 서클 배지 + 사진 그리드 연혁, 수상 배지/트로피 + 매장 수 성장 그래프("200호점 달성"), 7개 매장 통계 카드 그리드(레드 글로우 매출 숫자), 도넛차트+비율표, 막대그래프, 점주 인터뷰 캐러셀(실명·실사진), 고객 리뷰 캡처 그리드, 하단 고정 미니 문의 폼바.
- **hyojadong.kr**: 다크+골드 톤. 상단 내비 구조(성공매출→메뉴소개→인테리어→마케팅→창업비용→창업문의→매장찾기)가 0007-B의 5섹션 구조와 대응된다. 로드 시 실매출 수치("일 매출 17,122,000원") + 전국 지점 리스트 팝업 자동 표시.

사용자에게 "팔레트도 다크+골드로 전환할지, 아이보리/브론즈를 유지하고 구조만 벤치마킹할지"를 확인한 결과 **후자(아이보리·브론즈 유지 + 구조만 벤치마킹)를 확정**받았다. 즉 이번 작업은 **색상·타이포 아이덴티티는 절대 건드리지 않고**, 두 사이트의 설득 장치·레이아웃 구조·모티프 중 (a) `data/content.json`에 실제로 존재하는 사실만 쓸 수 있고 (b) CLAUDE.md의 확정 규칙(절제된 인터랙션 = 자동 팝업 금지·무한 애니메이션 금지, `--red` 범위 제한, `--radius-circle` 셀프바/고기 전용, `.diamond-divider` 2곳 한정 등)을 위반하지 않는 것만 선별 채택한다.

이 선별 작업을 Plan 서브에이전트에게 위임해 6개 후보를 검토시켰고, 실제 코드(`index.html`/`assets/css/style.css`/`assets/js/script.js`/`docs/design.md`)를 전부 대조해 정확한 라인 위치까지 검증했다. 아래는 그 결론이다.

## 채택 항목 (5개) / 기각 항목 (1개)

| # | 후보 | 결론 |
|---|---|---|
| 1 | 03 수익분석: 리스트 → 스탯카드 그리드 | **채택** |
| 2 | 05 매장위치: 오픈일 기반 확장 타임라인 신설 | **채택** (마커는 원형 아닌 사각 `--radius-badge`) |
| 3 | 04 창업비용: "N/7호점" 진행바 | **기각** — `profit` 배열에 가맹점과 직영점(`천호 직영점`)이 섞여 있어, 매장 수를 그대로 "가맹 슬롯 소진율"로 시각화하면 실제와 다른 사실을 암시하게 됨(허위 과장 리스크). 04 섹션은 이번에 손대지 않는다. |
| 4 | 하단 고정 문의 CTA 바 신설 | **채택** — `.nav-cta`가 `max-width:1024px`에서 `display:none`이라 모바일에 상시 노출 CTA가 없는 공백을 메운다. 자동 팝업이 아니라 "항상 존재하는 정적 바"라 절제된 인터랙션 원칙과 충돌하지 않는다. |
| 5 | 01 트러스트 배지 시각 임팩트 강화 | **채택** (크기/굵기만 조정하는 경량 폴리시) |
| 6 | 히어로 카피 타이포 대비 강화 | **채택** (새 카피 없이 폰트 크기/굵기만 조정) |

가짜 점주 인터뷰·고객 리뷰·도넛차트(비율 데이터 없음)·막대그래프(회수기간 데이터 없음)·자동 팝업 모달은 전부 **채택하지 않는다** — 각각 실제 취재 데이터 부재 또는 확정 원칙 위반.

---

## 구현 스펙

### 1. 03 수익분석 — `.revenue-list`(리스트) → `.revenue-grid`(스탯카드 3열)

기존 `.revenue-row--feature`(천호 직영점 강조 카드, `assets/css/style.css:239`)가 이미 `--paper-2` 배경 + `--radius-card`로 카드 처리를 하고 있으므로, 이를 3개 행 전체로 확장하는 자연스러운 연장이다.

- **`index.html:101`**: `<div class="revenue-list" id="revenueList" ...>` → `<div class="revenue-grid" id="revenueList" ...>` (id는 유지, JS는 무변경으로 계속 찾음)
- **`assets/js/script.js`**: `renderProfitCards`(66-77행) 템플릿의 `revenue-row`/`revenue-row--feature` 클래스명을 `revenue-card`/`revenue-card--feature`로 치환. `initScrollReveal`(155-163행) 타겟 셀렉터의 `#revenueList .revenue-row`도 `.revenue-card`로 함께 변경.
- **`assets/css/style.css:229-260`**: 기존 `.revenue-row` 블록 전체를 그리드+카드 레이아웃으로 교체(아래 스펙대로). 새 토큰 없음 — `--red`/`--bronze-tint`/`--radius-card`/`--paper-2`/`--paper-line` 재사용.
  ```css
  .revenue-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:8px; }
  .revenue-card{
    display:flex; flex-direction:column; gap:20px; padding:32px 28px;
    border:1px solid var(--paper-line); border-radius:var(--radius-card);
    opacity:0; transform:translateY(16px);
  }
  .revenue-card.in-view{ animation:fadeUp .6s cubic-bezier(.22,1,.36,1) var(--d,0ms) both; }
  .revenue-card--feature{ background:var(--paper-2); border-color:var(--bronze-tint); }
  .revenue-date{
    display:inline-flex; align-items:center; gap:8px; width:auto; height:auto;
    padding:8px 14px; border-radius:var(--radius-badge); background:var(--paper-2);
    border:1px solid var(--paper-line); color:var(--ink-dim); align-self:flex-start;
  }
  .revenue-card--feature .revenue-date{ background:var(--paper); }
  .revenue-date span:first-child{ font-size:11px; letter-spacing:.14em; color:var(--ink-faint); }
  .revenue-date span:last-child{ font-size:13px; font-weight:700; color:var(--ink); }
  .revenue-label{ font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:6px; }
  .revenue-name{ font-family:var(--font-sans); font-weight:800; font-size:22px; color:var(--ink); }
  .revenue-figures{ margin-top:auto; }
  .revenue-figure{ display:block; font-family:var(--font-sans); font-weight:900; font-size:clamp(32px,5vw,64px); color:var(--red); line-height:1; }
  .revenue-rate{ display:block; font-size:13px; color:var(--ink-dim); margin-top:8px; }
  .revenue-rate b{ color:var(--ink); }
  .revenue-footnote{ font-size:13px; color:var(--ink-faint); margin-top:32px; }

  @media (max-width:1024px){
    .revenue-grid{ grid-template-columns:1fr; gap:16px; }
  }
  ```
- **reduced-motion 블록(`style.css:439-446`)**: 셀렉터 목록에서 `.revenue-row` → `.revenue-card`로 치환.

### 2. 05 매장위치 — 오픈일 확장 타임라인 신설

05 h2가 이미 "확장을 증명하는 기록"이라 말하는데 이를 뒷받침하는 시각 요소가 없다. `stores[].date`/`stores[].name`(스키마 변경 없음, 이미 fetch되는 값)을 그대로 재사용한다. **원형(`--radius-circle`)은 셀프바·고기 전용으로 명시 제한돼 있고 `.diamond-divider`도 정확히 2곳으로 소진돼 있으므로, 타임라인 마커는 豚 배지·트러스트 배지와 같은 카테고리인 `--radius-badge`(사각) 점으로 만든다.**

- **`index.html`**: `#location` 안 두 `<div class="wrap">` 사이(현재 `.location-layout` wrap이 닫히는 지점과 `.inquiry-grid` wrap이 열리는 지점 사이, 152~154행 부근)에 삽입:
  ```html
  <div class="wrap">
    <div class="store-timeline" id="storeTimeline" data-content><!-- data/content.json → stores --></div>
  </div>
  ```
- **`assets/js/script.js`**: `renderStores` 뒤에 신규 렌더러 추가 (`stores[].date`의 " OPEN" 접미사만 제거해 재사용):
  ```js
  const renderStoreTimeline = (list = []) => fill('storeTimeline', `
    <div class="timeline-track">
      ${list.map(({ name, date }) => `
        <div class="timeline-node">
          <span class="timeline-dot" aria-hidden="true"></span>
          <span class="timeline-date">${esc(date).replace(' OPEN', '')}</span>
          <span class="timeline-name">${esc(name)}</span>
        </div>`).join('')}
    </div>`);
  ```
  `renderAll`(393-402행)에서 `renderStores(data.stores);` 다음 줄에 `renderStoreTimeline(data.stores);` 추가. `initScrollReveal` 타겟 배열에 `...document.querySelectorAll('#storeTimeline .timeline-node'),` 추가.
- **`assets/css/style.css`**: `.location-*` 블록(302-346행) 뒤, "하단 문의 폼" 주석(348행) 앞에 삽입:
  ```css
  .store-timeline{ margin-top:64px; position:relative; z-index:1; }
  .timeline-track{ position:relative; display:flex; justify-content:space-between; padding-top:6px; }
  .timeline-track::before{
    content:''; position:absolute; top:11px; left:0; right:0; height:1px; background:var(--paper-line);
  }
  .timeline-node{
    position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:8px;
    flex:1; text-align:center; opacity:0; transform:translateY(12px);
  }
  .timeline-node.in-view{ animation:fadeUp .6s cubic-bezier(.22,1,.36,1) var(--d,0ms) both; }
  .timeline-dot{ width:10px; height:10px; border-radius:var(--radius-badge); background:var(--bronze); border:2px solid var(--paper); }
  .timeline-date{ font-size:12px; letter-spacing:.08em; color:var(--ink-faint); }
  .timeline-name{ font-size:14px; font-weight:700; color:var(--ink); }

  @media (max-width:1024px){
    .timeline-track{ flex-direction:column; align-items:flex-start; gap:24px; padding-left:5px; }
    .timeline-track::before{ top:0; bottom:0; left:4px; right:auto; width:1px; height:auto; }
    .timeline-node{ flex-direction:row; text-align:left; gap:12px; }
  }
  ```
- **reduced-motion 블록**: 셀렉터 목록에 `.timeline-node` 추가.

### 3. 04 창업비용 — 이번에 변경 없음

기각 사유를 `CLAUDE.md`의 "알려진 이슈"에 한 줄 기록해 다음 세션이 같은 검토를 반복하지 않게 한다.

### 4. 하단 고정 문의 CTA 바 신설 (전역 UI, 특정 섹션 소속 아님)

- **`index.html`**: `</footer>` 뒤, Swiper 스크립트 태그 앞에 삽입. 전화번호는 `.hero-contact`/footer `.meta`와 같은 기존 관례대로 하드코딩(`data-content` 미부착 — fetch 실패 시 에러 문단이 이 좁은 바에 주입되는 것을 방지):
  ```html
  <div class="sticky-cta" id="stickyCta" role="complementary" aria-label="빠른 상담">
    <a class="sticky-cta-phone" href="tel:18771960">
      <span class="k">창업문의</span><span class="v">1877-1960</span>
    </a>
    <button type="button" class="sticky-cta-btn" data-open-inquiry>창업 상담</button>
  </div>
  ```
- **JS 변경 없음**: `initInquirySheet()`가 `boot()`에서 fetch 이전에 `[data-open-inquiry]`를 전부 바인딩하므로(정적 마크업이라 DOMContentLoaded 시점에 이미 DOM에 존재), 타이밍 이슈 없이 자동 포함된다.
- **`assets/css/style.css`**: Navigation `@media` 블록(120-130행) 뒤에 신규 블록:
  ```css
  .sticky-cta{
    display:none; position:fixed; left:0; right:0; bottom:0; z-index:40;
    align-items:center; justify-content:space-between; gap:16px;
    padding:14px 20px; background:rgba(255,255,254,.96); backdrop-filter:blur(6px);
    border-top:1px solid var(--paper-line);
  }
  .sticky-cta-phone{ display:flex; flex-direction:column; line-height:1.3; }
  .sticky-cta-phone .k{ font-size:12px; color:var(--ink-faint); }
  .sticky-cta-phone .v{ font-size:16px; font-weight:800; color:var(--ink); }
  .sticky-cta-btn{
    padding:12px 24px; background:var(--bronze); color:var(--paper); border:none;
    border-radius:var(--radius-pill); font-size:14px; font-weight:700; cursor:pointer;
    transition:background .2s;
  }
  .sticky-cta-btn:hover{ background:var(--bronze-dark); }

  @media (max-width:1024px){
    .sticky-cta{ display:flex; }
  }
  ```
  Footer 모바일 `@media`(432-434행)에 하단 여백 추가(sticky-cta가 footer 콘텐츠를 가리지 않도록):
  ```css
  @media (max-width:1024px){
    .footer{ padding-bottom:calc(56px + 76px); }
    .footer-grid{ flex-direction:column; align-items:flex-start; text-align:left; }
  }
  ```
- **z-index**: `.nav`=50, `.inquiry-sheet-backdrop`=100, `.sticky-cta`=40 — 모달/모바일 nav 플라이아웃이 항상 위에 그려져 충돌 없음.
- **reduced-motion**: 새 애니메이션 없음(정적 바, hover 배경 전환뿐) — 예외 추가 불필요.

### 5. 01 트러스트 배지 임팩트 강화 (CSS만)

`assets/css/style.css:181-186` `.trust-badge-icon` 크기/굵기 조정:
```css
.trust-badge-icon{
  width:104px; height:104px;
  border-radius:var(--radius-card); border:1px solid var(--paper-line);
  background:var(--paper-2); display:flex; align-items:center; justify-content:center;
  color:var(--bronze); font-family:var(--font-sans); font-weight:900;
  font-size:16px; line-height:1.25; text-align:center; padding:8px;
}
```
반응형은 기존 2열 전환(189-192행) 유지.

### 6. 히어로 카피 타이포 대비 강화 (CSS만, 새 카피 없음)

`.hero-headline`/`.hero-kicker`는 `index.html:39-42`에 하드코딩된 텍스트를 그대로 두고 타이포만 조정:
```css
.hero-headline{
  font-family:var(--font-sans); font-weight:900;
  font-size:clamp(48px,8.5vw,120px);
  letter-spacing:-.02em; line-height:1; color:var(--ink); margin-bottom:8px;
  border-bottom:3px solid var(--bronze); display:inline-block; padding-bottom:12px;
}
.hero-kicker{
  font-size:18px; font-weight:700;
  color:var(--ink-dim); margin-bottom:20px; max-width:420px; line-height:1.6;
}
```
`clamp()`가 이미 반응형을 처리하므로 별도 미디어쿼리 불필요, 120px은 전역 상한(12~120px) 안.

---

## 문서 동기화 (구현 마지막 단계)

- `docs/design.md`: "### 03 수익분석 — 리스트 스프레드" 절 제목/설명을 스탯카드 그리드로 갱신, "### 05 매장위치 캐러셀" 절에 확장 타임라인 설명 추가(원형 대신 `--radius-badge` 마커를 쓴 이유 명시), Components 절에 "Sticky CTA bar" 신규 항목 추가.
- `CLAUDE.md`: "알려진 이슈"에 "04 창업비용 N/7 진행바는 `profit` 배열이 가맹/직영 혼재라 검토 후 채택 보류(직영점 포함 오인 위험)" 기록, "채택한 실제 브랜드 모티프" 절에 확장 타임라인 추가.

## 검증 방법

```bash
# 스키마 무변경 확인 (이번 계획의 핵심 제약)
git diff --stat data/content.json   # 비어 있어야 함

# 로컬 서버
python3 -m http.server 8765

# CLAUDE.md 필수 회귀 스윕
grep -n "font-serif" assets/css/style.css index.html      # 0건
grep -n "var(--red)" assets/css/style.css                  # .seal-badge, .revenue-figure 블록만

# 이번 변경 전용 회귀 체크
grep -c "diamond-divider" index.html                        # 여전히 2
grep -n "radius-circle" assets/css/style.css                # .meat-frame/.selfbar-frame 외에 없어야 함
grep -n "\.revenue-row\b" assets/css/style.css assets/js/script.js  # 0건 (전부 .revenue-card 로 치환 확인)

# 에셋 참조 정합성
grep -ohE 'assets/[A-Za-z0-9_./-]+' index.html assets/css/*.css assets/js/*.js data/content.json | sort -u | \
  while read f; do [ -f "$f" ] || echo "MISSING: $f"; done

# 헤드리스 스크린샷 — PC(≥1024px), 03/05 섹션 + sticky-cta 확인용 좁은 폭
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=1440,4200 --virtual-time-budget=9000 \
  --screenshot=/tmp/shot-pc.png "http://localhost:8765/index.html"
```

육안 확인: (a) 03 카드 그리드 3열→1열 전환, 천호 직영점 카드가 `--paper-2` 배경으로 구분되는지 (b) 05 타임라인이 사각 마커로 1회만 페이드업하는지(반복 스크롤로 재생 안 됨 확인) (c) sticky-cta가 ≤1024px에서만 나타나고 데스크톱엔 없는지, footer 콘텐츠를 가리지 않는지 (d) 문의 모달이 sticky-cta 클릭으로 열리되 로드 시 자동으로 열리지 않는지 (e) `prefers-reduced-motion` 에뮬레이션 시 신규 요소가 즉시 최종 상태로 보이는지.

**주의**: ≲450px 폭에서 헤드리스 Chrome이 `position:fixed`+flex 우측 정렬 요소를 안 그리는 도구 결함이 알려져 있다(`.claude/agent-memory/screenshot-verifier/headless-narrow-viewport-flex-bug.md`). sticky-cta가 좁은 폭 스크린샷에 안 보이면 이 결함부터 의심하고 ≥1024px 폭 캡처나 실제 브라우저로 재확인할 것.
