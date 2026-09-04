# 고품격대패 — Design Guide

`0007` 랜딩(시안A_v2)의 디자인 시스템 문서다. 실제 `index.html` / `assets/css/*.css` 를 기준으로
작성했으며, 코드와 문서가 어긋나면 **코드가 항상 우선**이다 — 이 문서는 스냅샷이지 소스가 아니다.

**2026-09-04, 디자인 아이덴티티를 [shadcn/ui](https://ui.shadcn.com/)와 100% 동일하게 맞추는
방향으로 전면 재설계했다** — 사용자가 명시적으로 요청한 결정이다. 골드/레드 브랜드 컬러,
RixYeoljeongdo 디스플레이 폰트, 영수증 프린터 슬롯·웨이브 디바이더 같은 스큐어모픽(실물 재현)
장치, 무한 반복 어텐션 애니메이션(워드마크 팝/샤인, 키워드 블링크, 강조 스냅)을 전부 걷어내고,
shadcn 의 뉴트럴 그레이스케일 토큰 + 절제된 컴포넌트 문법으로 다시 세웠다. 이 문서의 나머지는
전부 새 시스템 기준이다 — 옛 골드/레드 시안을 다루던 이전 버전은 git 히스토리에서 볼 수 있다.

---

## Overview

- **컨셉**: shadcn/ui 의 "뉴트럴, 미니멀, 컴포넌트 우선" 철학을 그대로 가져온다. 색은 흑백
  그레이스케일(oklch 무채색) 하나만 쓰고, 상태(위험/삭제류)만 `--destructive`(빨강 계열)로
  분리한다. 카드는 얇은 보더 + 옅은 배경차 + `border-radius:0.625rem` 안팎의 절제된 라운드,
  버튼은 `variant="default"`(단색 채움)/`outline`(테두리만) 두 갈래로 정리한다.
- **구조**: 단일 페이지, 5개 섹션(경쟁력 → 메뉴 → 수익분석 → 창업비용 → 매장위치) + 히어로 + 푸터.
  섹션은 `id`로 구분되고 상단 내비게이션과 스크롤스파이(`initScrollSpy`)로 연결된다. 이 구조/
  콘텐츠 배열은 이번 재설계로 바뀌지 않았다 — 바뀐 건 시각 언어뿐이다.
- **빌드 없음**: HTML5/CSS3/바닐라 JS(ES6) + `assets/imgs/` 이미지가 전부다. 유일한 예외는
  05 매장위치 캐러셀에 쓰는 **Swiper.js**(jsdelivr CDN) — 이 프로젝트 최초의 외부 JS 런타임
  의존성이다. 빌드 단계 없이 `<link>`/`<script defer>` 만으로 붙였다.
- **CSS 는 역할별로 4개 파일로 분리되어 있다** — `index.html` 이 이 순서로 로드한다:
  1. `assets/css/init.css` — 브라우저 기본값 리셋만 담는다.
  2. `assets/css/fonts.css` — `@font-face` 선언만 담는다(Pretendard 9웨이트 self-host 하나뿐 —
     RixYeoljeongdo 는 2026-09-04 제거했다).
  3. `assets/css/animations.css` — `@keyframes` 로 정의하는 모든 애니메이션을 담는다. 지금은
     `fadeInUp` 하나뿐이다(카드 스크롤 리빌용).
  4. `assets/css/style.css` — 디자인 토큰(`:root`)과 실제 컴포넌트 스타일.
- **콘텐츠 단일 진실 공급원**: `data/content.json`. 이번 재설계는 CSS/마크업만 바꿨고 JSON 스키마는
  건드리지 않았다.
- **베이스 톤**: 전 섹션이 shadcn `dark` 테마의 `--background`(거의 검정)를 기본으로 쓴다. 흰
  카드로 뒤집는 자리(트러스트 카드/창업비용 헤더 행/문의 시트/모바일 nav 플라이아웃)만 `light`
  테마 토큰을 로컬로 재선언한다. 자세한 규칙은 Colors 참고.

---

## Colors

### 디자인 토큰 (`assets/css/style.css` `:root`) — shadcn/ui 기본(neutral) 테마 원본값

[shadcn/ui 테마 문서](https://ui.shadcn.com/docs/theming)의 `:root`/`.dark` oklch 값을 색상
변환 없이 그대로 옮겼다 — "100% 동일"이 요구사항이라, 눈대중 hex 변환 대신 원본 수치를 쓰는 게
가장 정확하다. 이 프로젝트는 대부분의 섹션이 어두운 배경이라 **dark 세트를 `:root` 기본값으로**
삼는다(shadcn 자체도 dark 를 동등한 1급 테마로 지원한다).

| 토큰 | 값(dark, `:root` 기본) | 용도 |
|---|---|---|
| `--background` | `oklch(0.145 0 0)` | 페이지 기본 배경 |
| `--foreground` | `oklch(0.985 0 0)` | 기본 텍스트(밝은 배경 위에서는 로컬로 뒤집는다) |
| `--card` | `oklch(0.205 0 0)` | 카드 배경 — `--background` 보다 살짝 밝다 |
| `--card-foreground` | `oklch(0.985 0 0)` | 카드 안 텍스트 |
| `--primary` | `oklch(0.922 0 0)` | 주요 버튼 배경(다크 모드라 밝은 회색) |
| `--primary-foreground` | `oklch(0.205 0 0)` | 주요 버튼 텍스트(어두운 색, 밝은 배경 위) |
| `--secondary` / `--muted` / `--accent` | `oklch(0.269 0 0)` | 보조 표면(호버, 헤더 행 등) — 세 토큰이 dark 테마에서는 같은 값 |
| `--secondary-foreground` / `--accent-foreground` | `oklch(0.985 0 0)` | 위 표면 위 텍스트 |
| `--muted-foreground` | `oklch(0.708 0 0)` | 보조/뮤트 텍스트(라벨, 캡션, 각주) |
| `--destructive` | `oklch(0.704 0.191 22.216)` | 위험/강조 배지(창업비용 "7호점 한정") |
| `--destructive-foreground` | `oklch(0.985 0 0)` | destructive 표면 위 텍스트 |
| `--border` / `--input` | `oklch(1 0 0 / 10%)` / `oklch(1 0 0 / 15%)` | 구분선/인풋 테두리(불투명도 낮은 흰색) |
| `--ring` | `oklch(0.556 0 0)` | 포커스 링 |
| `--radius` | `0.625rem`(10px) | 라운드 기준값 — `--radius-sm`(6px)/`--radius-md`(8px)/`--radius-lg`(10px)/`--radius-xl`(14px) 를 `calc()` 로 파생 |

### "밝은 카드로 뒤집는" 자리 — light 테마 로컬 재선언

`:root` 는 dark 세트라 `--card`/`--foreground` 등이 전부 어두운 배경 기준이다. 흰 카드가
필요한 자리는 **shadcn light 테마의 oklch 값**을 그 컴포넌트 스코프에서 직접 재선언한다
(기존 "다크/라이트 섹션 텍스트 뒤집기" 아키텍처와 동일한 패턴, 토큰 이름만 shadcn 식으로 바뀌었다):

```css
.trust-item{
  background:oklch(1 0 0); border:1px solid oklch(0.922 0 0);
  --foreground: oklch(0.145 0 0); --muted-foreground: oklch(0.556 0 0);
}
.cost-row.cost-head{ background:var(--muted); }  /* dark 세트 그대로 — 옅은 회색 헤더 행 */
.inquiry-sheet{
  background:oklch(1 0 0);
  --foreground: oklch(0.145 0 0); --muted-foreground: oklch(0.556 0 0);
  --border: oklch(0.922 0 0); --input: oklch(0.922 0 0); --ring: oklch(0.708 0 0);
  --primary: oklch(0.205 0 0); --primary-foreground: oklch(0.985 0 0);
  --accent: oklch(0.97 0 0);
}
@media (max-width:1024px){
  .nav-links{ --background: oklch(1 0 0); --foreground: oklch(0.145 0 0); /* 모바일 플라이아웃 */ }
}
```

새 컴포넌트를 흰 카드로 만들 때는 이 패턴을 재사용한다 — `--card`/`--foreground`/
`--muted-foreground`/`--border` 를 light oklch 값으로 로컬 재정의하고, 실제 `background`/
`color` 선언은 그 토큰을 참조하게 한다.

### 하드코딩 색상 (토큰화되지 않음)

- 로고 이미지(`assets/imgs/logo_gold.png`, `.png` 자체에 골드 색이 박혀 있음) — CSS 로 재색상할
  수 없는 래스터 자산이라 예외로 남는다. 새 로고 자산을 만들 여유가 생기면 뉴트럴 톤으로 교체를
  검토할 것.
- `.hero-bg`/`.location-bg`/`.meat-card img`/`.store-card .photo img` 에 건 `filter:grayscale()`
  — 사진 자체(식자재/매장 사진)는 남기되 채도를 낮춰 뉴트럴 톤에 맞춘다. 정확한 값은 각
  셀렉터의 `filter` 선언 참고.

---

## Typography

- **서체**: Pretendard 단일 패밀리 (9웨이트, `assets/fonts/Pretendard-*.woff2` self-host).
  **RixYeoljeongdo 디스플레이 폰트는 2026-09-04 제거했다** — shadcn 은 헤드라인에도 별도
  디스플레이 서체를 쓰지 않고 하나의 산세리프로 전부 통일한다. `assets/css/fonts.css` 에서
  `@font-face` 선언 자체를 지웠고 `assets/fonts/RixYeoljeongdo.woff2` 파일도 삭제했다.
- **강조 문구**: 예전엔 6곳(경쟁력/메뉴/수익분석/창업비용/매장위치/문의 소제목)의 강조 문구를
  빨간색 + 무한 반복 스냅 애니메이션(`accent-impact`/`accentSnap`)으로 표시했다. shadcn 은
  헤드라인에 색 포인트나 attention 애니메이션을 쓰지 않으므로 전부 걷어내고 `--foreground` 단색
  정적 텍스트로 정리했다. `.accent-impact`/`.h2-accent`/`.cline--accent` 클래스 자체는
  `index.html` 호환을 위해 남겨뒀지만 CSS 상 효과는 없다(전부 `color:var(--foreground)`).
- **스케일**: shadcn/Tailwind 의 표준 타입 스케일을 그대로 쓴다 — 이전의 "18~96px 고정 범위"
  규칙은 골드/레드 브랜드 특유의 강한 임팩트를 노리던 값이라 이번 재설계로 폐기했다.

| 이름 | 크기 | 용도 |
|---|---|---|
| `text-xs` | 13px | 각주, 배지, 작은 라벨(`.r-date`, `.kicker` 자간과 함께) |
| `text-sm` | 14px | 본문 대부분(`.comp-card p`, `.nav-links`, 폼 라벨/인풋) |
| `text-base` | 16px | 섹션 서브카피(`.section-head p`, `.hero-sub2`) |
| `text-lg`~`text-xl` | 18~20px | 카드 타이틀(`.comp-card h3`, `.trust-item h5`), 매장 캡션 |
| `text-2xl`~`text-4xl` | `clamp(28px,3.6vw,40px)` | 섹션 헤드라인(`.section-head h2`, `.comp-title`, `.profit-head h2`, `.inquiry-left h3`) — 전부 동일한 clamp 하나를 공유한다 |
| 히어로 워드마크 | `clamp(40px,7vw,64px)` | `.hero-wordmark` — 유일하게 더 큰 값이지만 옛 132px 워드마크보다 절반 수준으로 줄었다(과한 임팩트 대신 절제된 굵기) |
| 영수증/수익 카드 매출 숫자 | `clamp(28px,6cqw,36px)` | `.r-sales` — 여전히 카드 안에서 가장 큰 값이지만 옛 44px 보다 작다 |

- **굵기**: 헤드라인 700, 서브헤드/타이틀 600, 본문 400~500. shadcn 은 900대의 블랙 굵기를
  거의 쓰지 않는다 — 예전 800~900 위주 굵기 규칙을 폐기했다.
- **자간**: 헤드라인은 `letter-spacing:-0.02em` 안팎(살짝 좁힘), eyebrow/kicker 류는
  `letter-spacing:0.08em` 대문자 표기 — shadcn 마케팅 페이지의 전형적인 대비법.

---

## Layout

- **컨테이너**: `.wrap{ max-width:1120px; margin:0 auto; padding:0 32px; }` — 변경 없음.
- **섹션 리듬**: `section{ padding:96px 0; }`(예전 120px 에서 축소 — shadcn 은 더 촘촘한 밀도를
  쓴다), `.section-head{ margin-bottom:48px; max-width:600px; }`.
- **그리드**: 레이아웃 자체(3열→1열, 4열→2열 등)는 이번 재설계로 바뀌지 않았다 — 바뀐 건 그리드
  "칸"을 감싸는 시각 언어뿐이다(카드 프레임, 보더, 라운드).
  - 경쟁력 카드(`.comp-grid`)는 예전의 "펀치홀 티켓" 프레임을 버리고, **1px 보더 컨테이너 안에
    카드가 hairline 구분선(gap:1px, 배경=`var(--border)`)으로만 나뉘는 shadcn feature-grid**
    패턴으로 바뀌었다. 메뉴 그리드(`.meat-grid`)도 같은 패턴을 쓴다.
- **브레이크포인트**: 여전히 `max-width:1024px` 하나만 쓴다 — 이 규칙은 shadcn 과 무관하게
  유지한다(프로젝트 자체 컨벤션).
- **히어로는 여전히 `position:sticky`** — 이 메커니즘 자체는 브랜드 톤과 무관한 레이아웃 장치라
  유지했다. 시각적으로는 사진 위 오버레이가 `--background` 기반 뉴트럴 스크림으로 바뀌었을 뿐이다.

---

## Shapes

- **라운드**: `--radius`(10px) 계열로 통일했다 — `--radius-sm`(6px, 배지/닫기버튼),
  `--radius-md`(8px, 버튼/인풋), `--radius-lg`(10px, 카드/테이블/모달), `--radius-xl`(14px,
  모바일 바텀시트 상단). 예전의 "거의 각짐(2px) + 경쟁력/매장카드만 큰 라운드(20~28px)" 이원
  체계를 버리고 전 컴포넌트가 하나의 스케일을 공유한다.
- **원형**: 셀프바 원(`.sb-item .circle`), 매장위치 캐러셀 원형 컨트롤 버튼(`.store-nav-btn`,
  shadcn Carousel 의 outline 아이콘 버튼과 같은 형태) — 유지.
- **제거된 장치**:
  - `.wave` SVG 디바이더 — CSS 규칙 자체가 죽어 있었다(실제 마크업이 이미 없었다는 걸 이번에
    확인했다). 죽은 CSS 도 함께 지웠다.
  - 경쟁력 카드의 펀치홀 노치(`::before`/`::after` 원형 커터), 좌우 큰 라운드 프레임.
  - 트러스트 카드의 접힌 리본 모서리(`::before` 트라이앵글)와 그라디언트 원형 번호 배지.
  - 영수증 카드의 프린터 슬롯(금속 그라디언트 바), `clip-path` 슬라이드 아웃, 스캘럽 절취선
    (`mask-image:radial-gradient()`), 바코드 무늬, 실물 영수증 종이 색(`#F6F1E4`).

---

## Elevation & Depth

- shadcn 은 강한 드롭섀도우 대신 **얇은 보더**로 레이어를 구분한다. 대부분의 카드/테이블/그리드는
  `border:1px solid var(--border)` 하나로 표면을 나눈다.
- 유일하게 그림자를 쓰는 곳은 문의하기 Bottom Sheet(`.inquiry-sheet{ box-shadow:0 20px 50px
  -12px oklch(0 0 0 / 40%); }`, shadcn Dialog/Sheet 의 전형적인 대형 소프트 섀도우)와 헤더
  (`backdrop-filter:blur(8px)` + 반투명 배경, 스크롤 시 `border-bottom` 만 나타난다).
- 포커스 링: `outline:2px solid var(--ring); outline-offset:2px;` — shadcn 의 `focus-visible:
  ring-2` 관례를 그대로 옮겼다.

---

## Components

### Navigation (`header.nav`)
고정 헤더, `rgba(10,10,10,.72)` 반투명 배경 + `backdrop-filter:blur(8px)`. 로고 + 5개 링크
(뮤트 텍스트, hover/active 시 `--foreground`) + `.nav-cta`(shadcn Button `outline` `sm`) +
모바일 햄버거(≤1024px 에서 흰 배경 풀스크린 플라이아웃, light 토큰 로컬 재선언).

### Hero (`.hero`)
`position:sticky` 배경 사진(패럴랙스, `grayscale(.4)` 필터로 채도를 낮췄다) + `--background`
기반 뉴트럴 스크림 오버레이. `.hero-wordmark` 는 예전의 골드 그라디언트/팝 인트로/샤인 애니메이션을
전부 걷어내고 `--foreground` 단색 `font-weight:700` 정적 텍스트다. 버튼은 shadcn Button
`default`(`.btn-primary`, 채운 배경)/`outline`(`.btn-ghost`) 두 종류.

### 경쟁력 그리드 (`.comp-grid` / `.comp-card`)
1px 보더 컨테이너 안에 카드 3장이 hairline 구분선으로만 나뉘는 shadcn feature-grid. 카드는
`--card` 배경, 호버 시 `--accent` 로 바뀐다(그림자·확대·색 전환 없음, 배경색 전환만). 진입
애니메이션은 `fadeInUp`(`initGridReveal`, 스크롤 진입 시 1회) 하나뿐이다.

### 트러스트 스트립 (`.trust-strip` / `.trust-item`)
흰 shadcn Card(`oklch(1 0 0)` 배경, `oklch(0.922 0 0)` 보더) 4장. 리본 모서리/그라디언트 배지를
버리고 상단에 뮤트 톤 순번 텍스트(`.trust-num`)만 남겼다. 호버 시 보더 색만 살짝 밝아진다.

### 메뉴 카드 (`.meat-card`)
경쟁력 그리드와 같은 hairline 구분선 그리드. 사진에 `grayscale(.15)` 를 살짝 걸어 톤을 낮췄고,
호버 시 `scale(1.05)`(예전 1.15 보다 절제됨).

### 수익분석 카드 (`.receipt-*`)
**2026-09-04, 영수증 프린터/스캘럽/바코드 스큐어모피즘을 전부 걷어내고 평범한 shadcn Card 로
바꿨다.** 마크업은 `assets/js/script.js` `renderProfitCards` 가 `.receipt-card`(보더+라운드+
패딩) 하나만 렌더링한다 — 프린터 바, 마스크, 스캘럽 절취선, 바코드 div 가 전부 사라졌다.
스크롤 리빌 트리거(`initReceiptReveal`)는 그대로다: `#profit` 섹션이 아니라 그 앞 셀프바
그리드 상단을 기준으로 미리 카드가 나타나고, 그 지점 위로 스크롤을 올리면 다시 숨는다 —
`opacity`/`translateY` 트랜지션으로 구현이 바뀌었을 뿐 동작 자체는 동일하다.
**"원" 단위는 여전히 삭제된 상태 — 되살리지 않는다.**

### 창업비용 표 (`.cost-table` / `.cost-row`)
shadcn Table 톤 — 헤더 행(`.cost-head`)은 `--muted` 배경 + 대문자 라벨, 본문 행은 hairline
`border-bottom` 로만 구분된다. "전수창업 7호점 한정" 배지는 shadcn Badge `destructive` variant.

### 매장위치 캐러셀 (`.location-*` / `.store-swiper` / `.store-card`)
레이아웃(좌측 텍스트 `.wrap` 고정 + 우측 캐러셀 뷰포트 bleed, Swiper 설정)은 이번 재설계로 바뀌지
않았다 — Layout 절 그대로. 시각적으로는 원형 컨트롤 버튼이 shadcn Carousel 의 outline 아이콘
버튼 톤(`--border`/`--foreground`)으로, 사진에 `grayscale(.25)` 필터가 추가됐다.

### 문의 폼(`.inquiry-grid`)과 Bottom Sheet(`.inquiry-sheet-*`)
둘 다 shadcn Input/Select/Textarea(옅은 배경 + 얇은 보더 + `--radius-md`, 포커스 시
`border-color:var(--ring)` + 은은한 box-shadow 링)와 shadcn Button `default`(단색 채움,
hover 시 `opacity:.9`)로 통일했다. Bottom Sheet 는 shadcn Dialog/Sheet 패턴 그대로 — PC 는
중앙 모달(`scale(.98)→scale(1)` + `translateY` 페이드), `max-width:1024px` 이하에서는 하단
고정 시트(`border-radius:var(--radius-xl) var(--radius-xl) 0 0`, `translateY(100%)→0`)로
바뀐다. 트리거([data-open-inquiry] 클릭 + 02 메뉴 섹션 진입마다 자동 오픈)는 이전 그대로다.

### 버튼
- `.btn-primary`/`.submit-btn`/`.inquiry-sheet-submit`: shadcn Button `default` — `--primary`
  배경, `--primary-foreground` 텍스트, hover 시 `opacity:.9`. 그라디언트/골드 색 없음.
- `.btn-ghost`/`.nav-cta`/`.map-btn`: shadcn Button `outline` — 투명 배경 + `--border` 테두리,
  hover 시 `--accent` 배경.

---

## Do's and Don'ts

### Do
- 색은 항상 `:root` 토큰(`var(--foreground)`, `var(--muted-foreground)` 등)에서 가져온다.
  새 밝은 카드가 필요하면 Colors 절의 "light 테마 로컬 재선언" 패턴을 재사용한다.
- 라운드는 `--radius-sm`/`--radius-md`/`--radius-lg`/`--radius-xl` 스케일 안에서만 쓴다.
  새 px 값을 하드코딩하지 않는다.
- 버튼은 `default`(채움)/`outline`(테두리) 두 갈래로만 만든다 — 세 번째 변형이 필요하면 먼저
  shadcn 실제 컴포넌트(Button, Badge 등)에 있는 variant 인지 확인한다.
- 반응형 폭은 `clamp()`, 브레이크포인트는 `max-width:1024px` 하나만 쓴다(변경 없음).
- 새 애니메이션을 추가하면 **`prefers-reduced-motion` 블록에 반드시 예외를 추가**한다. shadcn
  은 애초에 애니메이션을 절제해서 쓰므로, 새 효과를 추가하기 전에 정말 필요한지부터 재고한다.
- **모든 `@keyframes` 는 `assets/css/animations.css` 에, `@font-face` 는
  `assets/css/fonts.css` 에, 리셋은 `assets/css/init.css` 에 정의한다.**
- CSS 를 만졌으면 반드시 로컬 서버로 실제 렌더링해서 확인한다(`python3 -m http.server 8765`).
- 문구·수치·이미지 경로를 바꿀 일이 있으면 `data/content.json` 을 고친다.

### Don't
- **골드/레드 브랜드 컬러를 되살리지 않는다** — `--gold`/`--gold-light`/`--red` 토큰은
  2026-09-04에 완전히 제거됐다. 강조가 필요하면 `--foreground`(중립 강조) 또는
  `--destructive`(위험/한정 표시 전용)만 쓴다.
- **RixYeoljeongdo 나 다른 디스플레이/세리프 폰트를 다시 넣지 않는다** — Pretendard 단일
  패밀리다.
- **워드마크 팝 인트로/샤인, 키워드 블링크, 강조 스냅 같은 무한 반복 attention 애니메이션을
  다시 추가하지 않는다** — shadcn 의 절제된 모션 언어에 맞지 않는다. 스크롤 리빌(`fadeInUp`)
  정도만 허용한다.
- **영수증 프린터 슬롯/스캘럽 절취선/바코드 같은 스큐어모피즘을 되살리지 않는다** — 평범한
  Card 마크업(`renderProfitCards`)으로 대체됐다.
- **경쟁력/트러스트 카드에 펀치홀 노치, 리본 모서리, 그라디언트 배지를 다시 넣지 않는다** —
  hairline 구분선 그리드/평범한 Card 로 대체됐다.
- **`.wave` 관련 CSS 를 "시그니처라서" 되살리지 않는다** — 실제 마크업이 이미 없는 죽은 코드였고,
  이번에 CSS 도 함께 지웠다.
- **`font-size` 18~96px 규칙을 근거로 새 값을 판단하지 않는다** — 이 규칙은 폐기됐다. 새 값은
  Typography 절의 shadcn 타입 스케일(13/14/16/18~20/28~40px)을 따른다.
- **영수증 매출 숫자 뒤 "원" 단위를 다시 붙이지 않는다** — 여전히 유효한 과거 결정이다.
- **히어로 하단 "왕십리/천호/시흥은계 오픈일" 스트립을 되살리지 않는다** — 05 매장위치 섹션과
  중복돼서 제거됐다(변경 없음).
- **`js/app.js` 스타일의 `FALLBACK` 상수를 만들지 않는다** — fetch 실패 시 이유를 화면에 보여주는
  기존 방식을 유지한다(변경 없음).
- **`.claude/rules/*.md` 를 그대로 인용하지 않는다** — `0003`(아이스크림 카드) 기준 스캐폴딩이라
  이 폴더에 없는 개념을 전제로 한다. 실제 규칙은 이 문서와 `CLAUDE.md`, `.claude/memory/
  gopumgyeok-*.md` 를 따른다.
