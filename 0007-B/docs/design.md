# 고품격대패 — Design Guide (시안B — 카탈로그 라이트 / Ivory & Bronze Catalogue)

`0007-B` 랜딩(시안B)의 디자인 시스템 문서다. 실제 `index.html` / `assets/css/*.css`를
기준으로 작성했으며, 코드와 문서가 어긋나면 **코드가 항상 우선**이다 — 이 문서는 스냅샷이지
소스가 아니다.

형제 폴더 `0007`(시안A)과 콘텐츠 계약은 동일하지만 팔레트 축이 다르다. 둘 다 클라이언트가
실제 인쇄 배포한 카탈로그(`고품격대패_카달로그_최종_인쇄.pdf`)의 서로 다른 실측 페이지를
근거로 삼는다 — A는 표지 계열(다크 차콜 + 골드/레드), B는 내지 계열(아이보리 + 브론즈골드 +
커피브라운)이다.

**이 문서는 두 번째 버전이다.** 첫 번째 B안("고품격저널" — 크림+테라코타+세리프)은 조사 없이
만든 창작 컨셉이었다. 카탈로그 PDF와 3개 참고 사이트(귀한족발·더맛있는족발보쌈·치킨신드롬)를
학습한 뒤 세리프·원형 잉크 스탬프 같은 요소가 실제 브랜드 언어와 무관했음이 확인되어 지금의
방향으로 교체됐다.

---

## Overview

- **컨셉**: "카탈로그 라이트(Ivory & Bronze Catalogue)" — 실제 인쇄 카탈로그 내지의
  아이보리/베이지 배경 + 브론즈골드 포인트 + 커피브라운 반전 존을 웹으로 재현한다. 레드는
  브랜드 전역색이 아니라 豚 스탬프와 매출 데이터 강조에만 쓰는 신호색이다.
- **구조**: 단일 페이지, 5개 섹션(경쟁력 → 메뉴 → 수익분석 → 창업비용 → 매장위치) + 히어로 +
  푸터. 섹션은 `id`로 구분되고 상단 내비게이션과 스크롤스파이(`initScrollSpy`)로 연결된다.
- **빌드 없음**: HTML5/CSS3/바닐라 JS(ES6) + `assets/imgs/` 이미지가 전부다. 외부 의존성은
  **Swiper.js(jsdelivr CDN, 05 매장위치 캐러셀 전용) 하나뿐** — 웹폰트는 전부 self-host라
  Google Fonts 등 다른 CDN을 쓰지 않는다.
- **CSS는 역할별로 4개 파일로 분리되어 있다** — `index.html`이 이 순서로 로드한다:
  1. `assets/css/init.css` — 브라우저 기본값 리셋만 담는다.
  2. `assets/css/fonts.css` — `@font-face` 선언만 담는다(Pretendard 9웨이트 self-host).
  3. `assets/css/animations.css` — `@keyframes`로 정의하는 모든 애니메이션을 담는다.
     무한 반복 keyframe을 만들지 않는 원칙상 A안보다 항목 수가 적다.
  4. `assets/css/style.css` — 디자인 토큰(`:root`)과 실제 컴포넌트 스타일.
- **콘텐츠 단일 진실 공급원**: `data/content.json`. 문구·이미지·수치를 바꿀 일이 생기면
  거의 항상 이 파일만 고치면 된다(`assets/js/script.js`가 `fetch`로 읽어 8개 영역을
  렌더링).
- **베이스 상태**: 대부분 섹션이 아이보리 배경(`--paper`)인 라이트 테마다. 다크 반전 존은
  **히어로**와 **푸터** 두 곳뿐이다(2026-09-08 이전에는 푸터만이었으나, 사용자가 참고
  배너 이미지를 제시하며 히어로를 명시적으로 다크 배너로 재작업해달라고 요청해 히어로가
  두 번째 다크 존으로 추가됐다). 히어로는 히어로 전용 `--hero-ink`(`#373332`)를 배경으로,
  `--paper`를 텍스트로 쓴다 — 처음엔 `--ink`(#1B1712, 기본 텍스트 잉크 토큰)를 배경으로
  재사용했으나, 이후 사용자가 지정한 배경색(`#373332`)이 `--ink` 값과 달라 전역 텍스트
  색을 건드리지 않도록 히어로 전용 토큰으로 분리했다. 푸터는 `--coffee`/`--on-coffee`를
  쓴다 — 세 다크 톤을 의도적으로 섞어 쓴다(히어로는 따뜻한 차콜, 푸터는 커피브라운). A안이
  전 섹션 다크였던 것과는 여전히 다르다 — 02~05 섹션은 그대로 라이트다.

---

## Colors

### 디자인 토큰 (`assets/css/style.css` `:root`)

```css
:root {
  --paper:        #FFFFFE;
  --paper-2:      #E6DFD4;
  --paper-line:   #D8CBBA;

  --ink:          #1B1712;
  --ink-dim:      #5B5346;
  --ink-faint:    #8C8371;

  --bronze:       #AC824C;
  --bronze-dark:  #8A6A3C;
  --bronze-tint:  #C3A783;

  --red:          #BF3327;
  --red-tint:     #F4DEDA;

  --coffee:         #785F45;
  --coffee-2:       #63492F;
  --on-coffee:      #FBF7EF;
  --line-on-coffee: rgba(251,247,239,.18);

  --hero-ink: #373332;

  --font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;

  --radius-badge:  6px;
  --radius-card:   14px;
  --radius-pill:   999px;
  --radius-circle: 50%;
  --rule: 1px;
}
```

| 토큰 | 값 | 용도 |
|---|---|---|
| `--paper` | `#FFFFFE` | 페이지 기본 배경(아이보리) |
| `--paper-2` | `#E6DFD4` | 카드/배지 배경, 미세 대비 구획 |
| `--paper-line` | `#D8CBBA` | 헤어라인 룰(구분선) |
| `--ink` | `#1B1712` | 기본 텍스트(사이트 전역). 히어로 배경에는 쓰지 않는다 — 아래 `--hero-ink` 참고 |
| `--ink-dim` | `#5B5346` | 보조 텍스트 |
| `--ink-faint` | `#8C8371` | 각주·소형 라벨 |
| `--bronze` | `#AC824C` | 유일한 주 포인트 컬러. 링크, 강조, 버튼 |
| `--bronze-dark` | `#8A6A3C` | 포인트 컬러 hover/active |
| `--bronze-tint` | `#C3A783` | 셀프바 원형 프레임 링, 그라디언트 stop |
| `--red` | `#BF3327` | **범위 제한 신호색** — `.seal-badge`, `.revenue-figure` **두 곳에만** |
| `--red-tint` | `#F4DEDA` | 레드 계열의 옅은 틴트(예비, 현재 미사용) |
| `--coffee` | `#785F45` | 다크 반전 존(푸터·04 헤더 행) 배경 |
| `--coffee-2` | `#63492F` | 다크 존 안의 미세 구획 |
| `--on-coffee` | `#FBF7EF` | 다크 존 위의 텍스트, 豚 배지 글자색 |
| `--line-on-coffee` | `rgba(251,247,239,.18)` | 다크 존 헤어라인 |
| `--hero-ink` | `#373332` | **히어로 전용** 다크 반전 존 배경(2026-09-08). `--ink`는 사이트 전역 텍스트 색이라 배경으로 겸용하지 않는다 — 사용자가 지정한 배경색이 `--ink` 값(#1B1712)과 달라 별도 토큰으로 분리했다 |

**색 원칙**: 주 포인트 컬러는 `--bronze` 계열 하나뿐이다. `--red`는 예외적으로 허용된
두 번째 액센트지만 **`.seal-badge`(豚 배지)와 `.revenue-figure`(03 매출 숫자) 두 곳
밖에서는 절대 쓰지 않는다** — 새 위치에 레드를 쓰고 싶다면 규칙 자체를 먼저 갱신해야 한다.

```bash
grep -n "var(--red)" assets/css/style.css   # 위 두 셀렉터 블록 외에 나오면 위반
```

**다크 반전 존은 히어로와 푸터 두 곳뿐**(04 창업비용의 헤더 행 `.price-row--head`는 국지적으로
커피브라운 배경을 쓰지만 별도의 "반전 존"으로 취급하지 않는다 — 표 헤더 강조일 뿐이다). 새
다크 섹션을 추가하고 싶으면 반드시 이 문서와 CLAUDE.md를 먼저 갱신한다 — 조용히 세 번째
다크 존을 늘리지 않는다.

### 그 외 하드코딩 색상 (토큰화되지 않음, 국지적 용도)

- 매장 카드 세피아 오버레이: `sepia(.15~.35) saturate(1.05~1.1)` 필터 계열(사진 보정용,
  브랜드 토큰과 무관).
- `.wave-rule`/`.wave-rule--invert`의 인라인 SVG data-URI 안 `stroke` 값(`#AC824C`,
  `#C3A783`)은 `background-image` 리소스라 `var()`를 쓸 수 없다 — `:root` 토큰 값과 반드시
  일치시켜 수동으로 동기화한다. 토큰(`--bronze`/`--bronze-tint`)을 바꾸면 이 두 값도 함께
  바꿔야 한다.

---

## Typography

- **산세리프 단일 통일**: 헤드라인·본문 모두 **Pretendard**(`var(--font-sans)`, self-host,
  `assets/fonts/`) 하나다. 카탈로그 PDF와 3개 참고 사이트 전부 세리프를 쓰지 않는다는 조사
  결과에 근거한다. 위계는 세리프-산세리프 대비 대신 **웨이트 대비**로 만든다.
- **크기 범위**: **`font-size`는 12px 이상 120px 이하다.** 러닝헤드 라벨("01 ·
  COMPETITIVENESS")·소형 태그류는 12~13px + 넓은 자간이 카탈로그 장르 문법이라 이 하한이
  맞다. 상한 120px은 히어로 헤드라인이 Black(900) 웨이트로 크게 강조될 수 있도록 확보한
  값이다.
- **스케일**: 반응형 요소는 `clamp(min, vw, max)`(단, `min` ≥ 12px, `max` ≤ 120px), 고정
  요소는 px 리터럴(12~120px)을 쓴다.
- **이탤릭 미사용**: 산세리프 이탤릭은 카탈로그/레퍼런스 어디에도 없는 관습이라 전 요소에서
  걷어냈다(구 `.price-value`, `.nav-links a`, 도판 캡션).

#### 반응형(`clamp()`) — 뷰포트에 따라 유동

| 요소 | 값 | 굵기 |
|---|---|---|
| 히어로 헤드라인(`.hero-headline`) | `clamp(48px, 8.5vw, 120px)` | 900 |
| 섹션 타이틀(`.section-head h2`) | `clamp(32px, 4.5vw, 56px)` | 800 |
| 드롭캡 넘버(`.feature-num`) | `clamp(40px, 6vw, 72px)` | 900 |
| 수익분석 매출 숫자(`.revenue-figure`) | `clamp(32px, 5vw, 64px)` | 900 |

#### 고정(px) — 뷰포트와 무관

| 크기 | 요소 |
|---|---|
| 12px | 셀프바 라벨(`.selfbar-label`) — 전역 하한값 |
| 13px | 러닝헤드 라벨(`.running-head`, `letter-spacing:.16em`, 대문자), 각주 |
| 14px | nav 링크, 폼 힌트 |
| 16px | 본문 기본(`p`), 라벨 |
| 18px | 버튼, CTA 텍스트 |
| 22px | 카드/행 타이틀 |

- **굵기**: 헤드라인/대형 숫자 800~900, 본문 400~500, 강조(`<b>`) 600~700(`--bronze` 색).
- **인라인 강조**: `data/content.json`의 `desc`류 필드에 한해 `<b>` 태그를 그대로 HTML 삽입
  허용(그 외 필드는 이스케이프). `<b>`는 `var(--bronze)`로 물든다.
- **금박 그라디언트 강조(`.gold-text`)**: 섹션 타이틀 강조어와 히어로 카피 일부에 쓴다.
  `background:linear-gradient(135deg,#8F6A3B,#E3C692,#AC824C)` +
  `-webkit-background-clip:text` + `-webkit-text-fill-color:transparent`. **`color:
  var(--bronze)`를 먼저 선언해 fallback을 보장한다.**

---

## Layout

- **컨테이너**: `.wrap{ max-width:1120px; margin:0 auto; padding:0 32px; }`.
- **섹션 리듬**: `section{ padding:120px 0; }`, 섹션 헤드(`.section-head`)는
  `margin-bottom:64px`.
- **그리드** (단일 브레이크포인트 기준):
  - 경쟁력 리스트: 리스트형(드롭캡+본문 좌우 배치, 모바일에서 세로 스택)
  - 트러스트 배지: 4열 → 2열
  - 메뉴(고기): 3열 → 2열
  - 셀프바: 8열 → 4열
  - 창업비용 표: 점선 리더 리스트(항목/점선/금액 3컬럼) → 모바일 2행 스택
  - 매장 카드(캐러셀): Swiper `slidesPerView:1.08`(PC `1.35`)
  - 문의 폼: `0.9fr 1.1fr` 2열 → 1열
  - 내비게이션: 가로 메뉴 → 햄버거 + 아이보리 배경 풀스크린 플라이아웃
- **브레이크포인트**: PC/모바일 2단계, 기준 `max-width:1024px` 하나만 쓴다.
- **미디어쿼리 위치**: 해당 컴포넌트 블록 바로 뒤에 붙인다.
- **히어로는 정적 레이아웃**: `position:sticky` 패럴랙스를 쓰지 않는다 — 그리드 2단이
  아니라 `.hero-left`(텍스트, 문서 흐름)와 `.hero-right`(제품 사진, `position:absolute`
  겹침 레이어) 두 겹을 포갠 구성이다. 자세한 배치 값은 아래 Components → Hero 참고.

---

## Shapes

모서리는 용도별로 4단 체계다. **이 대응을 임의로 섞지 않는다.**

| 토큰 | 값 | 적용 대상 |
|---|---|---|
| `--radius-badge` | 6px | 豚 배지(`.seal-badge`), 트러스트 배지, 인풋, 04 헤더 행 |
| `--radius-card` | 14px | 사진 프레임(히어로/매장 카드), 트러스트 아이콘 박스, 문의 모달 |
| `--radius-pill` | 999px | 버튼(`.btn-primary`/`.btn-ghost`/`.nav-cta`/`.submit-btn`) |
| `--radius-circle` | 50% | **셀프바·고기 사진 원형 크롭 전용** — 그 외 위치(배지·버튼)에는 쓰지 않는다 |

- **원형은 사진 두 곳에만**: 02 메뉴(고기)는 원형 + 두꺼운 검정 링(`.meat-frame`, `border:
  9px solid var(--ink)` — "검정 원형 접시" 재현), 셀프바는 원형 + 얇은 브론즈 링
  (`.selfbar-frame`, `border:3px solid var(--bronze-tint)`). 같은 원형 크롭 기법이되 링
  색으로 두 섹션을 구분한다.
- **헤어라인 룰**: `--rule`(1px) + `--paper-line` 색. 카드 박스·그림자 대신 이 룰로 콘텐츠를
  구분하는 것이 기본 문법이다(01 경쟁력 리스트, 04 창업비용 점선 리더의 실선 부분).
- **점선 리더**: 04 창업비용 전용 — `border-bottom:2px dotted var(--paper-line)`로 항목명과
  금액 사이를 연결한다.
- **다이아몬드 구분자**: `◇┄┄┄◇` 텍스트, 01 트러스트 그리드 위·04 "7호점 한정" 문단 위
  **두 곳에만**. 과다 사용 금지.

---

## Components

### Navigation (`header.nav`)
`position:fixed`, 배경은 `transparent`(스크롤 전) → `.scrolled`(반투명 아이보리 + 헤어라인
보더)로 전환한다. **2026-09-08부터 색이 스크롤 상태에 따라 반전된다** — 히어로가 다크
배너가 되면서, 스크롤 전(=다크 히어로 위에 떠 있는 상태)에는 로고/링크/CTA/햄버거가 전부
`--paper`(밝은) 색이고, `.scrolled`가 붙으면(=아이보리 배경 섹션 위) `--ink`/`--ink-dim`
계열로 되돌아간다(`.nav.scrolled .nav-word`, `.nav.scrolled .nav-links a` 등 스코프 오버라이드).
**모바일(`max-width:1024px`)은 예외**: nav 배경이 스크롤과 무관하게 항상 아이보리 고정이라
(`.nav{ background:rgba(255,255,254,.96); }`), 로고/햄버거도 스크롤 상태와 무관하게 항상
`--ink`로 고정한다. 로고 자리는 산세리프 워드마크 텍스트 + `.seal-badge`(豚). nav 링크는
산세리프 14px/600.

### Hero (`.hero`, 2026-09-08 다크 배너 + 겹침 구성으로 재작업)
`position:sticky`/패럴랙스 없음. **다크 반전 존이다** — 배경은 히어로 전용
`var(--hero-ink)`(`#373332`). `.hero-inner`(`.wrap` 겸용)는 별도 그리드 없이
`position:relative`인 일반 블록이고, 그 안에서 두 레이어가 겹친다:
- `.hero-left`(`max-width:560px`, `z-index:1`) — 러닝헤드 + kicker + 헤드라인 + sub + CTA 2개
  + `.hero-contact`. 색은 전부 `--paper`/`rgba(255,255,254,…)` 계열로 반전.
- `.hero-right`(`position:absolute; left:470px; top:-30px; width:650px; z-index:2;
  pointer-events:none`) — `.hero-photo-badge`(豚 + "대패 전문" 필 배지, `top:24px; right:32px`)와
  `meat_1.png` 한 장(`.hero-meat-main`, 투명 배경 컷아웃, `filter:drop-shadow()`만 쓰고
  프레임·보더 없음). **의도적으로 `.hero-left` 위에 겹쳐서 헤드라인 오른쪽 끝("대패")을
  가리게 배치한다** — 사용자가 제시한 참고 배너(글자를 고기 사진이 파고들어 가리는 레이아웃)
  를 그대로 재현한 것. `pointer-events:none`이라 시각적으로 겹쳐도 뒤의 CTA 버튼 클릭은
  막지 않지만, CTA 행 자체는 이미지 아래로 가리지 않도록 겹침 범위를 헤드라인 근방으로만
  한정했다(원래 텍스트 중앙에 크게 겹쳤을 때 "메뉴 보기" 버튼까지 가려 UX상 어색했던 1차
  시도의 회귀 수정). `left`/`top`/`width` 값은 사용자가 실제 렌더링을 보며 여러 차례
  미세 조정을 요청한 결과다 — 임의로 "정리"해 되돌리지 않는다.

`meat_1.png`는 1216×878 캔버스 안에 실제 접시가 중앙에 작게 들어있고 사방에 넓은 투명
여백이 있다 — `left`/`top` 값을 잡을 때 이 내부 여백(대략 좌 25%·상 22%)을 감안해야
실제로 겹치는 것처럼 보인다. 컨테이너 경계만 겹치고 내부 여백 때문에 실제 사진은 안
닿는 회귀를 한 번 겪었다(초기 시도).

레퍼런스의 네온그린/마젠타 액센트나 세일 문구("단 7일간 고기 싸게 먹는날!" 류)·필기체
워드마크("Week")는 가져오지 않았다 — 액센트 컬러는 `--bronze` 하나로 유지하고(프로젝트의
"주 포인트 컬러 하나" 원칙), 실존하지 않는 할인 이벤트를 지어내지 않았고, 필기체는 이탤릭
금지 규칙과 충돌한다.

진입 시 `.hero-left`/`.hero-right` 각각 1회 페이드인만(`fadeUp`, 우측이 0.15s 늦게 시작).
`max-width:1024px`에서는 겹침을 완전히 버리고 `.hero-inner{ display:flex; flex-direction:
column; }` + `.hero-right{ order:-1; position:relative; }`로 사진을 텍스트 위에 겹치지
않게 스택한다 — 좁은 화면에서 겹침은 가독성을 해치기만 하므로 데스크톱 전용 장치다.

**이전에 시도했던 세 버전은 전부 폐기됐다**: (1) 풀블리드 배경 사진(`generated_bg.png`)
위에 텍스트만 얹는 라이트 버전, (2) 프레임 사진 + 배지/캡션 오버레이 버전, (3) 사진 3장
(`meat_1~3.png`)을 프레임 없이 나란히 띄운 다크 버전(겹치지 않음). 각각 사용자가 참고
이미지를 바꿔가며 재작업을 요청해 순차적으로 대체됐다. 다크 존이 히어로까지 늘어났으므로
nav도 함께 반전 대응이 필요했다(위 Navigation 절 참고).

### 01 경쟁력 — 특집 리스트 (`.feature-list` / `.feature-row`)
카드 프레임 없음. 좌측 대형 드롭캡 넘버(`.feature-num`), 우측 타이틀 + 설명을
`border-bottom:1px solid var(--paper-line)`로 구분한 행. 마지막 행 아래
`.wave-rule`(카탈로그의 "물결형 인테리어" 항목과 시각적으로 연결) → `.diamond-divider` →
트러스트 그리드 순서.

### 트러스트 배지 (`.trust-grid` / `.trust-badge`)
4개 통계를 사각/라운드사각 배지로 표현(`.trust-badge-icon`, `--radius-card`) — 원형이
아니다(원형은 셀프바·고기 사진 전용 규칙). 스크롤 진입 시 `badgeIn`(scale+opacity, rotate
없음)으로 1회 등장.

### 메뉴 카드 (`.meat-card` / `.selfbar-card`)
원형 크롭 + 링 색으로 구분(위 Shapes 절 참고). 캡션(`Fig. 0N`) 없이 이름만 사진 아래 표기.

### 03 수익분석 — 스탯카드 그리드 (`.revenue-grid` / `.revenue-card`)
매장 3개를 3열 카드 그리드로(2026-09-08, 리스트 스프레드에서 변경 — 100chae.com 벤치마크의
매장 통계 카드 패턴을 구조만 차용, 팔레트는 그대로). 오픈일은 사각 날짜 태그(`.revenue-date`,
`--radius-badge`) — 원형 소인(postmark)은 폐기됐다. 매출액은 대형 숫자(`.revenue-figure`,
900, `color:var(--red)`, **"원" 단위 금지**) — `data-count-to` 속성에 목표값을 담아 스크롤
진입 시 `animateCount()`로 0에서 1회 카운트업한다. 수익률은 `.revenue-rate`. `tall:true`
매장(`.revenue-card--feature`)은 `--paper-2` 배경으로 강조한다. **`.revenue-figure`의
`font-size`는 `clamp(26px,2.8vw,40px)`(모바일 1열에서는 `clamp(32px,9vw,56px)`)로, 3열 카드
폭에 맞춰 이전 리스트 레이아웃보다 작게 잡는다** — 이전 `clamp(32px,5vw,64px)`를 그대로
카드에 옮기면 8자리 숫자가 카드 폭을 넘어 흘러넘친다(실측 회귀).

### 04 창업비용 — 점선 리더 가격표 (`.price-list` / `.price-row`)
좌측 항목명 — 중앙 점선 리더 — 우측 "상담 시 안내". 헤더 행(`.price-row--head`)은
커피브라운 배경 바로 강조한다(카탈로그의 브라운 헤더 행 재현). "전수창업 7호점 한정"은
`.seal-tag`(豚 배지 + 텍스트)로 표현한다.

### 05 매장위치 캐러셀 (`.location-*` / `.store-swiper` / `.store-card`)
Swiper.js와 `initStoreSwiper`/`syncCaption` 로직은 A안에서 그대로 재사용한다(자동재생
4.2초, `loop:true`, 마우스오버 정지, 캡션 동기화). **스타일만 리스킨**: 카드는
`--radius-card`(14px) 라운드, 오버레이는 아이보리 계열 그라디언트, 컨트롤은 텍스트 화살표
(← / →) + "01 / 03" 분수 인디케이터.

### 확장 타임라인 (`.store-timeline`, 05 매장위치 안, 2026-09-08 신규)
`stores[].date`/`name`을 재사용해 매장 오픈일을 가로 타임라인으로 보여준다(100chae.com의
"호점 달성" 마일스톤 그래프 구조 차용, 신규 필드 없음 — 실제 오픈일만 사용). 05 h2 카피
"확장을 증명하는 기록"을 뒷받침하는 시각 요소가 없던 공백을 메웠다. 마커(`.timeline-dot`)는
**원형이 아니라 `--radius-badge`(사각)** — `--radius-circle`은 셀프바·고기 사진 전용으로
범위가 제한돼 있고, 새 다이아몬드 구분자를 추가하면 "정확히 2곳" 규칙을 어기므로 豚 배지·
트러스트 배지와 같은 사각 카테고리를 골랐다. `max-width:1024px`에서는 세로 스택으로 전환.

### 문의 모달 (`.inquiry-sheet-*`)
`initInquirySheet`의 열기/닫기/mock 제출 로직은 A안에서 재사용하되, **자동 오픈 트리거는
없다** — `[data-open-inquiry]` 클릭으로만 연다. 모달은 `--radius-card` 라운드 카드, 상단에
`.seal-badge`(豚) + 워드마크.

### 푸터 (`.footer`)
유일한 다크 반전 존(`--coffee` 배경, `--on-coffee` 텍스트). 상단에 `.wave-rule--invert`.
`logo_gold.png` 원본 이미지 + `.seal-badge` + 워드마크 텍스트를 함께 쓴다.

### Sticky CTA bar (`.sticky-cta`, 2026-09-08 신규)
전역 UI로 특정 섹션에 속하지 않는다(`</footer>` 뒤, body 직속). `.nav-cta`가
`max-width:1024px`에서 `display:none`이라 모바일에 상시 노출 CTA가 없던 공백을
메운다(100chae.com의 하단 고정 문의 폼바 구조 차용). `position:fixed; bottom:0`, 전화번호
+ `[data-open-inquiry]` 버튼만 담은 정적 바 — 열림/닫힘 애니메이션이 없어 "절제된
인터랙션" 원칙과 상충하지 않는다. `max-width:1024px`에서만 보이고 데스크톱에서는 숨는다.
`z-index:40`으로 `.nav`(50)/`.inquiry-sheet-backdrop`(100)보다 아래. 모바일 `.footer`는
`padding-bottom:calc(56px + 76px)`로 sticky-cta에 가려지지 않게 여유를 둔다.

### 버튼
- `.btn-primary`: `--bronze` 배경, `--radius-pill`, hover 시 `--bronze-dark`.
- `.btn-ghost`: 테두리만, 히어로(아이보리 배경) 전용, `--ink` 텍스트.
- `.nav-cta`: 헤더용 `--ink` 아웃라인 버튼, hover 시 `--bronze` 채움.
- `.sticky-cta-btn`: `.btn-primary`와 같은 브론즈 필 버튼(모바일 하단 고정 바 전용).

---

## Do's and Don'ts

### Do
- 색은 항상 `:root` 토큰에서 가져온다. 주 포인트 컬러는 `--bronze` 계열 하나로 제한한다.
- `--red`는 `.seal-badge`/`.revenue-figure` 두 곳에만 쓴다.
- 반응형 폭은 `clamp()`로 처리하고, 브레이크포인트는 `max-width:1024px` 하나만 쓴다.
- **`font-size`는 항상 12px 이상 120px 이하**로 쓴다.
- 원형(`--radius-circle`)은 셀프바·고기 사진에만 쓴다.
- 새 애니메이션을 추가하면 **`prefers-reduced-motion` 블록에 반드시 예외를 추가**하고,
  **1회 재생**으로 설계한다(반복 재생 금지).
- **모든 `@keyframes`는 `assets/css/animations.css`에**, **`@font-face`는
  `assets/css/fonts.css`에**, 리셋 규칙은 `assets/css/init.css`에 정의한다.
- CSS를 만졌으면 반드시 로컬 서버로 실제 렌더링해서 확인한다.
- 문구·수치·이미지 경로를 바꿀 일이 있으면 `data/content.json`을 고친다.

### Don't
- **12px 미만/120px 초과 `font-size`를 쓰지 않는다.**
- **세리프 폰트나 이탤릭을 다시 들여오지 않는다** — 조사로 확인된, 근거 없는 창작이었다.
- **`--red`를 두 곳(seal-badge, revenue-figure) 밖에 쓰지 않는다.**
- **원형을 배지·버튼에 쓰지 않는다** — 원형은 셀프바·고기 사진 전용이다.
- **영수증 프린터 슬롯/스캘럽/펀치홀 노치/리본 코너, 원형 잉크 스탬프, 매거진 컬로폰 표를
  들여오지 않는다** — A안 및 직전 B안의 폐기된 장치다.
- **무한 반복 attention 애니메이션이나 자동 오픈 모달을 만들지 않는다** — "절제된
  인터랙션"이 컨셉의 핵심이다.
- **매출 숫자 뒤 "원" 단위를 붙이지 않는다**(A안에서 이어받은 규칙).
- **새 색상 값을 컴포넌트 안에 직접 하드코딩하지 않는다**(단, `.wave-rule` SVG data-URI의
  `stroke` 값은 예외 — `:root` 토큰과 수동 동기화 대상으로 문서화됨).
- **`.claude/rules/*.md`를 무시하지 않는다.**
