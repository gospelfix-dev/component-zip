# 0007-B 재설계 — "카탈로그 라이트 (Ivory·Bronze Catalogue)"

## Context

이전 계획(이 문서의 직전 버전)은 "고품격저널/Butcher's Dossier"(크림+테라코타+세리프 매거진
문법)이라는, 담당자가 조사 없이 창작한 컨셉이었다. 사용자가 이후 실제 브랜드 카탈로그 PDF
(`고품격대패_카달로그_최종_인쇄.pdf`)와 3개 참고 사이트(귀한족발·더맛있는족발보쌈·치킨신드롬)를
학습해 디자인 가이드를 실제 근거 기반으로 다시 정의하고, 그것을 기반으로 B안을 재작성하라고
명시적으로 요청했다. 즉 이번 재설계는 "취향을 바꾸는" 결정이 아니라 "근거 없는 창작을 실제
브랜드 자산 기반으로 대체하는" 결정이다.

조사 결과 카탈로그와 3개 레퍼런스 전부 **세리프를 전혀 쓰지 않는다** — 옛 B의 `Noto Serif KR`
헤드라인 확정 규칙은 근거가 없었던 것으로 판명됐다. 카탈로그 실측 팔레트는 아이보리/베이지
+ 브론즈골드 + 커피브라운이며, 레드는 브랜드 전역색이 아니라 豚(돼지) 스탬프·데이터 강조에만
쓰이는 신호색이다. A안(`0007`)이 이미 "다크+골드" 축을 쓰고 있으므로, B는 카탈로그 안에 실재하는
**다른 실측 페이지**(라이트+브론즈+커피)를 근거로 삼아 A와 겹치지 않으면서도 실제 브랜드에
근거한 방향을 취한다.

**목표**: 콘텐츠 계약(`data/content.json` 스키마·실제 값)은 완전히 그대로 유지한 채, 팔레트·
타이포그래피·모서리 언어·모티프·수익분석 인터랙션만 카탈로그/레퍼런스 근거 기반으로 전면
교체한다. 현재 `0007-B`는 이미 완성된 "고품격저널" 구현이 있으므로(index.html 239줄,
style.css 406줄, script.js, CLAUDE.md, docs/design.md, `.claude/rules`/`.claude/agents` 전부
그 컨셉 기준), 이번 작업은 신규 구축이 아니라 **기존 파일들의 리스킨 + 리네임 + 일부 마크업
교체**다. Swiper 캐러셀 로직, 렌더 파이프라인, `data/content.json`, 이미지 에셋은 검증된
상태이므로 변경하지 않는다.

## 확정 디자인 가이드

### 팔레트 — `:root` 토큰 전면 교체 (`assets/css/style.css`)

```css
:root{
  --paper:        #FFFFFE;   /* 기존 #F6F2E9 대체 — 카탈로그 실측 오프화이트 */
  --paper-2:      #E6DFD4;   /* 기존 #EDE6D6 대체 */
  --paper-line:   #D8CBBA;   /* 기존 #DCD3BC 대체 */

  --ink:          #1B1712;   /* 값 변경 없음 — 카탈로그 차콜과 사실상 동일 */
  --ink-dim:      #5B5346;   /* 값 변경 없음 */
  --ink-faint:    #8C8371;   /* 값 변경 없음 */

  --bronze:       #AC824C;   /* --stamp 대체. 유일한 주 액센트 */
  --bronze-dark:  #8A6A3C;   /* --stamp-dark 대체 */
  --bronze-tint:  #C3A783;   /* --stamp-tint 대체 */

  --red:          #BF3327;   /* 신규 — .revenue-figure(매출 숫자) · .seal-badge(豚 배지) 두 곳 전용 */
  --red-tint:     #F4DEDA;   /* 신규 — 필요시 매출 숫자 뒤 옅은 칩 배경 */

  --coffee:       #785F45;   /* --charcoal 대체 — 다크 반전 존(푸터) */
  --coffee-2:     #63492F;   /* --charcoal-2 대체 */
  --on-coffee:    #FBF7EF;   /* --on-charcoal 대체 */
  --line-on-coffee: rgba(251,247,239,.18);  /* --line-on-dark 대체 */

  --font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  /* --font-serif 삭제 */

  --radius-badge: 6px;    /* 豚 배지·소형 태그 */
  --radius-card:  14px;   /* 사진 프레임·카드 */
  --radius-pill:  999px;  /* 버튼·가격 칩 */
  --radius-circle:50%;    /* 셀프바·고기 원형 크롭 전용 */
  /* --radius-sharp, --radius-seal 삭제 */
  --rule: 1px;
}
```

**레드 스코프 규칙(신규, 반드시 문서화)**: `--red`는 오직 `.revenue-figure`(03 수익분석 매출
숫자)와 `.seal-badge`(豚 배지) 두 곳에만 쓴다. 그 외 위치(버튼·링크·장식)에는 절대 쓰지 않는다.

### 타이포그래피

- Pretendard 단일 패밀리로 통일(`assets/css/fonts.css`의 9웨이트 self-host는 변경 없이 재사용).
  `index.html`의 Google Fonts `preconnect` 2줄 + Noto Serif KR `<link>` 1줄을 삭제한다 —
  외부 리소스가 Swiper.js CDN 하나로 줄어든다.
- 위계는 세리프-산세리프 대비 대신 **웨이트 대비**로: 헤드라인/대형 숫자 800~900, 서브헤드
  600~700, 본문 400~500.
- `font-style:italic` 전부 제거(`.nav-links a`, `.price-value`, `.fig-caption` 등) — 산세리프
  이탤릭은 카탈로그/레퍼런스 어디에도 없는 관습이다.
- 폰트 크기 범위 12~120px는 그대로 유지(근거 문구만 "세리프 매거진 커버" → "Black 웨이트
  헤드라인 + 12~13px 소형 태그류의 자간 확보"로 교체).

### 모서리/형태

- 카드·사진 프레임: `--radius-card`(14px). 버튼·가격 칩·태그: `--radius-pill`(999px).
- 원형(`--radius-circle`)은 **셀프바·고기 사진 두 곳에만** 쓴다. 豚 배지·트러스트 배지는
  사각/라운드사각(`--radius-badge`)으로 — 옛 B의 "잉크 스탬프는 전부 원형" 관습을 폐기한다.

## 채택 모티프 (신규 컴포넌트)

1. **豚 스탬프 배지(`.seal-badge`)** — CSS만으로 그린다(새 이미지 없음). 고정 px 크기,
   `background:var(--red)`, `border-radius:var(--radius-badge)`, 안에 `豚` 한 글자
   `color:var(--on-coffee)` `font-weight:900`. 배치: `.nav-logo` 워드마크 옆, `.footer-logo`
   워드마크 옆, 04 창업비용 "7호점 한정"(기존 `.stamp-badge--inline` 대체), 문의 모달
   `.inquiry-sheet-brand`의 엉뚱한 `告` 글자를 이 배지로 교체.
2. **웨이브 헤어라인(`.wave-rule`)** — A안의 풀블리드 SVG 곡선과 다른 실행: 10~14px 높이의
   얇은 반복 웨이브를 CSS `background-image` 인라인 SVG data-URI로 정의(새 파일 없음). 라이트
   배경용(`.wave-rule`)과 커피 배경용(`.wave-rule--invert`) 두 변형. 01 경쟁력의 "물결형
   인테리어" 항목 아래, 05 하단/푸터 경계 위쪽에 배치.
3. **다이아몬드 점선 구분자(`.diamond-divider`)** — `◇` 문자 2개 + `border-top:1px dotted`.
   01 트러스트 배지 그리드 위, 04 "7호점 한정" 문단 위 두 곳에만(과다 사용 금지).
4. **원형 크롭 그리드** — 셀프바(`#selfbarGrid`)는 원형 + 브론즈 톤 링(`border:3px solid
   var(--bronze-tint)`). 고기(`#meatGrid`)는 원형 + 두꺼운 검정 링(`border:8~10px solid
   var(--ink)`, "검정 원형 접시" 재현). 같은 원형 크롭 기법이되 링 색으로 구분.
5. **금박 그라디언트 텍스트(`.gold-text`)** — 기존 `.ink-accent` 대체. `background:
   linear-gradient(135deg,#8F6A3B 0%,#E3C692 50%,#AC824C 100%)` + `background-clip:text` +
   `color:transparent`. **fallback 필수**: `color:var(--bronze);`를 먼저 선언한 뒤 그라디언트
   속성을 얹는다. `index.html`의 `.ink-accent` 6곳을 `.gold-text`로 클래스명 교체 + 히어로
   카피(`"대패의 격"이 다르다`)를 7번째 적용처로 신규 래핑.
6. **카운트업 애니메이션(수익분석 매출 숫자)** — 3D 플립카드는 채택하지 않는다: 플립카드는
   기본 상태에서 데이터를 가려 "정보를 숨기지 않고 재생 방식만 절제한다"는 기존 원칙과
   충돌한다. 카운트업은 정보를 가리지 않고 1회만 재생되어 `initScrollReveal`의 기존 철학과
   정합적이다. 매출 숫자 요소(`.ledger-sales` → `.revenue-figure`)에 `data-count-to` 속성을
   심고, `initScrollReveal`의 기존 `IntersectionObserver` 콜백 안에서(새 옵저버 생성 없이)
   `requestAnimationFrame`으로 0→목표값을 900~1200ms easeOutCubic으로 올린다. 새 헬퍼
   `animateCount(el, target, duration)`을 `script.js`에 추가. `prefers-reduced-motion`이면
   즉시 최종값 표시.

## 섹션별 리네임/교체 매핑 (index.html + style.css + script.js 동기화 필수)

| 옛 클래스/id | 새 클래스/id | 비고 |
|---|---|---|
| `.dossier-list`/`#dossierList`, `.dossier-row/-num/-eyebrow/-body` | `.feature-list`/`#featureList`, `.feature-row/-num/-eyebrow/-body` | 레이아웃 골격(숫자+본문+하단룰) 유지, 색/폰트만 교체 |
| `.stamp-strip`/`#stampStrip`, `.stamp-badge`, `.stamp-ring` | `.trust-grid`/`#trustGrid`, `.trust-badge` | 원형 링 → 사각/라운드사각 배지로 형태 변경 |
| `.plate-grid`/`#meatGrid`, `.plate-card`, `.plate-frame`, `.fig-caption` | `.meat-grid`/`#meatGrid`, `.meat-card` | id는 유지 가능(스키마 무관), 원형 크롭+검정 링으로 교체, Fig. 캡션 폐기 |
| `.plate-grid--small`/`#selfbarGrid`, `.plate-card--small` | `.selfbar-grid`/`#selfbarGrid`, `.selfbar-card` | 원형 크롭+브론즈 링 |
| `.ledger-list`/`#profitCards`, `.ledger-row`, `.postmark`, `.ledger-sales` | `.revenue-list`/`#revenueList`, `.revenue-row`, `.revenue-date`, `.revenue-figure` | postmark(원형 소인) 삭제 → 단순 날짜 태그, 매출 숫자에 `data-count-to` |
| `.price-*`(가격표) | 이름 유지, 이탤릭만 제거, 헤더 행을 커피브라운 배경 바로 | `.price-row--head` 스타일 교체 |
| `.stamp-badge.stamp-badge--inline`(7호점 한정) | `.seal-badge` + 텍스트 | 04 창업비용 |
| `.ink-accent` | `.gold-text` | 6곳 + 히어로 카피 1곳 신규 |
| `.colophon`(발행정보 표) | 삭제 또는 전화번호 한 줄로 축소 | 세리프/매거진 컬로폰 관습 폐기 |
| `.stamp-mark`(告 문자) | `.seal-badge`(豚) | 문의 모달 브랜드 표기 |
| `--charcoal` 계열 | `--coffee` 계열 | 푸터 반전 존 |

**id 리네임 시 반드시 `assets/js/script.js`의 `fill('dossierList', …)` 등 대상 id도 동시에
바꾼다** — 불일치는 화면이 조용히 비어 보이는 실패 모드를 만든다(콘텐츠 계약은 그대로이므로
`data/content.json`은 손대지 않는다).

## 파일별 수정 범위

- **`index.html`**: `<head>` 폰트 링크 3줄 삭제, 클래스/id 리네임 테이블 적용, `.seal-badge`
  마크업 3~4곳 추가, `.wave-rule`/`.diamond-divider` 삽입, `.colophon` 축소/삭제.
- **`assets/css/style.css`**: `:root` 전면 교체, `var(--font-serif)`/`font-style:italic` 전
  스윕 제거, 리네임 테이블에 따른 블록 재작성(레이아웃 grid 구조는 대부분 재사용, 색·모서리·
  원형 규칙만 교체), 신규 블록(`.seal-badge`, `.wave-rule`, `.diamond-divider`, `.gold-text`,
  `.trust-badge`, `.revenue-figure`) 추가. `05 매장위치`의 `.location-bg`/`.location-overlay`
  그라디언트는 새 `--paper` 계열 값으로 색만 교체(Swiper 관련 CSS 구조·`minmax(0,...)` 수정은
  그대로 유지 — 이전 세션에 고친 실제 버그이므로 되돌리지 않는다).
- **`assets/css/animations.css`**: `stampIn`(회전 포함)을 `badgeIn`으로 개명, `rotate` 제거,
  `scale+opacity`만 남긴다. `fadeUp`/`sheetSlideUp`은 유지. 카운트업은 JS `rAF`라 새 keyframe
  불필요.
- **`assets/js/script.js`**: 렌더 함수가 만드는 HTML의 class/id를 새 이름으로 교체,
  `renderProfitCards`에서 `.postmark` 제거하고 `.revenue-date` + `data-count-to` 속성 부여,
  `initScrollReveal`에 `animateCount` 통합(대상 셀렉터 리스트도 새 클래스명으로 갱신),
  `prefers-reduced-motion` 분기 처리.
- **`CLAUDE.md`, `docs/design.md`**: 전면 재작성 — 새 팔레트/타이포/모티프, "산세리프 단일
  통일이 확정 요소다(세리프는 두 번째로 폐기됐다)"로 반전, "되살리면 안 되는 것" 목록에 이번에
  폐기하는 세리프·원형 잉크 스탬프·컬로폰 표를 추가.
- **`.claude/rules/01-project.md`**: 외부 리소스 허용 범위를 "Swiper.js CDN만"으로 좁힌다.
- **`.claude/rules/02-css.md`**: 클래스명 예시 교체, `--red` 2곳 예외 스코프 규칙 명시,
  모서리 4단 체계(`--radius-badge/-card/-pill/-circle`) 설명.
- **`.claude/agents/css-stylist.md`, `design-qa.md`, `code-reviewer.md`, `markup-a11y.md`**:
  새 팔레트/모티프 기준으로 갱신. `code-reviewer.md`에 `--red` 스코프 검사(`grep -n
  "var(--red)" assets/css/style.css`)와 `font-serif` 잔재 검사(`grep -n "font-serif"
  assets/css/style.css index.html` → 0건이어야 함) 커맨드 추가. "직전 B안(고품격저널)의
  세리프·원형 잉크 스탬프 관습도 되살리면 안 된다"는 문구를 명시(이번이 두 번째 재설계이므로
  A안 관성뿐 아니라 옛 B안 관성도 새로운 함정이 된다).

## 에셋

신규 이미지/폰트 파일 없음. 豚 배지·웨이브 헤어라인 전부 CSS로 그린다. 기존 `assets/imgs/*`,
`assets/fonts/Pretendard-*.woff2`는 변경 없이 재사용.

## 검증 방법

```bash
cd /Users/mac/Documents/work/GospelFix/component-zip/0007-B
python3 -m http.server 8765
```

```bash
grep -n "font-serif" assets/css/style.css index.html    # 0건이어야 함
grep -n "var(--red)" assets/css/style.css                # .revenue-figure, .seal-badge 블록 외에 없는지 확인
```

헤드리스 스크린샷으로 시각 검증(≥1024px 폭 권장):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=1440,3000 --virtual-time-budget=9000 \
  --screenshot=/tmp/0007b-shot.png "http://localhost:8765/index.html"
```

**각주**: 이 환경의 헤드리스 Chrome은 `position:fixed`+퍼센트/auto 폭 flex 컨테이너의 우측
정렬 자식이 뷰포트 폭 450px 미만에서 그려지지 않는 도구 결함이 있다(실제 브라우저 버그 아님,
`.claude/agent-memory/screenshot-verifier/headless-narrow-viewport-flex-bug.md` 참고). `.nav-logo`에
豚 배지를 flex로 추가한 뒤 360~440px 스크린샷에서 안 보이면 이 결함을 의심하고, CSS를 억지로
고치지 말고 ≥1024px 스크린샷 또는 코드 리뷰로 검증을 대체한다.

리네임한 id(`featureList`, `trustGrid`, `revenueList` 등)가 `index.html`과
`assets/js/script.js` 양쪽에서 정확히 일치하는지 반드시 확인한다.

## Critical Files

- `/Users/mac/Documents/work/GospelFix/component-zip/0007-B/assets/css/style.css`
- `/Users/mac/Documents/work/GospelFix/component-zip/0007-B/index.html`
- `/Users/mac/Documents/work/GospelFix/component-zip/0007-B/assets/js/script.js`
- `/Users/mac/Documents/work/GospelFix/component-zip/0007-B/assets/css/animations.css`
- `/Users/mac/Documents/work/GospelFix/component-zip/0007-B/docs/design.md`
- `/Users/mac/Documents/work/GospelFix/component-zip/0007-B/CLAUDE.md`
- `/Users/mac/Documents/work/GospelFix/component-zip/0007-B/.claude/rules/01-project.md`,
  `02-css.md`
- `/Users/mac/Documents/work/GospelFix/component-zip/0007-B/.claude/agents/{css-stylist,
  design-qa,code-reviewer,markup-a11y}.md`
