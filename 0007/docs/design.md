# 고품격대패 — Design Guide

`0007` 랜딩(시안A_v2)의 디자인 시스템 문서다. 실제 `assets/css/style.css` / `index.html` / `assets/css/animations.css` 를 기준으로
작성했으며, 코드와 문서가 어긋나면 **코드가 항상 우선**이다 — 이 문서는 스냅샷이지 소스가 아니다.

---

## Overview

- **컨셉**: "대패의 격이 다르다" — 고급 대패삼겹 프랜차이즈 창업 제안 랜딩. 어두운 톤 + 골드 포인트로
  "프리미엄 정육점/스테이크하우스" 느낌을 낸다.
- **구조**: 단일 페이지, 5개 섹션(경쟁력 → 메뉴 → 수익분석 → 창업비용 → 매장위치) + 히어로 + 푸터.
  섹션은 `id`로 구분되고 상단 내비게이션과 스크롤스파이(`initScrollSpy`)로 연결된다.
- **빌드 없음**: HTML5/CSS3/바닐라 JS(ES6) + `assets/imgs/` 이미지가 전부다. `assets/css/style.css`(컴포넌트) +
  `assets/css/animations.css`(재사용 키프레임)로 CSS 파일이 분리되어 있고, `index.html` 이 `assets/css/animations.css` →
  `assets/css/style.css` 순서로 로드한다.
- **콘텐츠 단일 진실 공급원**: `data/content.json`. 카드 문구·이미지·수치를 바꿀 일이 생기면 거의 항상
  이 파일만 고치면 된다(`assets/js/script.js` 가 `fetch` 로 읽어 8개 영역을 렌더링).
- **베이스 상태**: 섹션 배경은 어두운 계열(히어로/메뉴/수익분석/창업비용)과 흰색 계열(경쟁력/매장위치)이
  섞여 있다 — 하나의 다크 테마가 아니라 **섹션별로 배경이 전환되는 구조**다. 자세한 규칙은 Colors 참고.

---

## Colors

### 디자인 토큰 (`assets/css/style.css` `:root`)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#0E0C0A` | 페이지 기본 배경(거의 검정), 메뉴/창업비용 섹션 배경 |
| `--bg-card` | `#FFFFFF` | 흰 배경 섹션(경쟁력/매장위치), 카드/인풋 배경, 좌우 노치 펀치홀 색 |
| `--bg-card-2` | `#211B14` | 매장위치 섹션 안의 어두운 스토어 카드 배경 |
| `--gold` | `#C9A227` | 브랜드 골드(진한 톤) — 라벨, 강조, 포커스 컬러 |
| `--gold-light` | `#E8CD7A` | 브랜드 골드(밝은 톤) — 본문 강조, 호버 상태 |
| `--text` | `#333333` | 기본 텍스트(밝은/흰 배경용) |
| `--text-invert` | `#F3EEE2` | 어두운 배경(히어로/메뉴/수익분석/창업비용)에서 쓰는 밝은 본문색 |
| `--text-dim` | `#B3A995` | 보조 텍스트(어두운 배경 기준 값) |
| `--muted` | `#7A7264` | 가장 낮은 우선순위 텍스트(각주 등) |
| `--line` | `#332C22` | 구분선, 테두리 |
| `--red` | `#A6291F` | 강조 배지, 매출 숫자, 절취선 패턴 |

### "섹션마다 배경이 바뀐다" 문제와 해법

`--bg-card` 는 흰색이고 `--text` 는 어두운 글자색이다. 하지만 히어로·메뉴·수익분석·창업비용 섹션은
여전히 **어두운 배경**을 쓴다. 그래서 이 섹션들은 컨테이너 셀렉터에서 CSS 커스텀 프로퍼티를
**로컬로 재정의**해 밝은 값으로 되돌린다:

```css
.hero{ --text: var(--text-invert); }
.menu{ --text: var(--text-invert); }
.profit{ --text: var(--text-invert); }
.cost{ --text: var(--text-invert); }
.competency{ --text-dim:#6B6B6B; }   /* 흰 배경이라 어두운 회색으로 */
.location{ --text-dim:#6B6B6B; }
```

그리고 흰 섹션 **안에 다시 어두운 박스**가 있으면(`.comp-card`, `.store-card`) 그 박스 셀렉터에서
`--text`/`--text-dim` 을 **한 번 더 뒤집는다**. 즉 색 규칙은 "가장 가까운 조상의 실제 배경 밝기"를
따라 다시 선언하는 식으로 중첩된다 — 새 컴포넌트를 추가할 때 반드시 자신이 앉을 배경이 밝은지
어두운지 먼저 확인하고 그에 맞는 텍스트 토큰 스코프를 잡을 것.

### 그 외 하드코딩 색상 (토큰화되지 않음, 용도가 국지적이라 의도적으로 리터럴 사용)

- 영수증 카드: 종이 `#F6F1E4` / 잉크 `#221E17` — 실제 영수증 용지 색을 재현하므로 브랜드 토큰과 무관.
- 창업비용 배지: `#F7E9E4`(글자) on `var(--red)`.
- 인쇄 바(프린터 슬롯) 메탈 그라디언트 `#F2F1EE → #77746E`.

---

## Typography

- **서체**: Pretendard 단일 패밀리 (`-apple-system, BlinkMacSystemFont, sans-serif` 폴백).
  ⚠️ 알려진 이슈 — `index.html` 의 Google Fonts 링크가 400 에러를 뱉어 실제로는 항상 시스템
  폰트(`-apple-system`)로 렌더링 중이다. 고치려면 `0004`/`0005` 처럼 jsDelivr CDN 링크로 교체.
- **크기 범위 규칙(2026-09-02 확정)**: **`font-size` 는 항상 18px 이상 96px 이하다.** 라벨·배지·
  각주·폼 힌트처럼 전통적으로 "잔글씨"였던 자리도 예외 없이 18px 이상이고, 히어로 워드마크처럼
  가장 큰 글자도 96px 을 넘지 않는다. 새 요소를 추가할 때 이 범위를 벗어나는 값을 쓰고 싶다면 —
  쓰지 말고 18~96px 안으로 맞출 것. 이 규칙 때문에 조정된 것들:
  - `.contact-line .k` 너비 90px → 110px (라벨이 18px 로 커져서)
  - `.hero-wordmark` 상한 132px → 96px (원래 대형 화면에서 최대 132px 까지 커졌었다)
- **스케일**: 반응형 요소는 `clamp(min, vw, max)`(단, `min` ≥ 18px, `max` ≤ 96px), 고정 요소는
  px 리터럴(18~96px)을 쓴다 — 미디어쿼리로 폰트 크기를 계단식으로 바꾸지 않는다.

#### 반응형(`clamp()`) — 뷰포트에 따라 유동

| 요소 | 값 | 굵기 |
|---|---|---|
| 히어로 워드마크(`.hero-wordmark`) | `clamp(52px, 11vw, 96px)` | 900 |
| 수익분석 타이틀(`.profit-head h2`) | `clamp(30px, 4.4vw, 50px)` | 800 |
| 섹션 타이틀(`.section-head h2`) | `clamp(28px, 3.4vw, 42px)` | 800 |
| 문의 좌측 타이틀(`.inquiry-left h3`) | `clamp(26px, 3vw, 36px)` | 800 |
| 히어로 서브카피(`.hero-sub2`) | `clamp(18px, 1.55vw, 22px)` | 400 |
| 히어로 eyebrow(`.hero-eyebrow2`) | `clamp(18px, 1.25vw, 20px)` | 400 |
| 버튼(`.btn-primary`, `.btn-ghost`) | `clamp(18px, 1.15vw, 19px)` | 700 / 400 |
| 히어로 전화 배지(`.hero-badge-phone`) | `clamp(18px, 1.05vw, 19px)` | 500 |
| 영수증 매장명(`.r-store`) | `clamp(22px, 18cqw, 42px)`(컨테이너쿼리 기준, `vw` 는 폴백) | 900 |
| 영수증 매출액(`.r-sales`) | `clamp(22px, 16cqw, 44px)` | 900 |

#### 고정(px) — 뷰포트와 무관

| 크기 | 요소 |
|---|---|
| 24px | 트러스트 숫자(`.trust-item h5`) |
| 20px | `.nav-logo` |
| 19px | 경쟁력 카드 타이틀(`.comp-card h3`) |
| 18px | 그 외 전부 — `.nav-links`(모바일 플라이아웃 포함), `.nav-cta`, `.kicker`, `.section-head p`,
  `.comp-num`, `.comp-card p`, `.trust-item p`, `.meat-label`, `.selfbar-note`(+`b`), `.sb-item span`,
  `.profit-sub`, `.r-label`, `.r-sub`, `.r-date`, `.profit-footnote`, `.cost-row span`(헤더 행 포함),
  `.cost-badge`, `.cost-note p`, `.store-card .meta h4`, `.store-card .meta .date`, `.map-btn`,
  `.inquiry-left p`, `.contact-line .k`/`.v`, `label`, `input`/`select`/`textarea`, `.submit-btn`,
  `.footer-logo span`, `footer .meta`, `footer .socials a`, 데이터 로드 실패 안내문(`assets/js/script.js` 인라인) |

- **굵기**: 제목 800~900(black 에 가까운 굵기), 본문 400~500, 강조(`<b>`) 600~800.
- **인라인 강조**: `data/content.json` 의 `desc` 류 필드에 한해 `<b>` 태그를 그대로 HTML 삽입
  허용(그 외 필드는 `esc()` 로 이스케이프). `<b>` 는 대부분 `var(--gold-light)` 로 물든다.

---

## Layout

- **컨테이너**: `.wrap{ max-width:1120px; margin:0 auto; padding:0 32px; }` — 모든 섹션 콘텐츠가
  이 폭 안에 정렬된다.
- **섹션 리듬**: `section{ padding:120px 0; }`, 섹션 헤드(`.section-head`)는 `margin-bottom:64px`,
  `max-width:640px` 로 본문보다 좁게 잡아 타이틀 가독성을 확보한다.
- **그리드**:
  - 경쟁력 카드: 3열(데스크톱) → 1열(≤820px)
  - 트러스트 스트립: 4열 → 2열(≤820px)
  - 메뉴(고기): 3열 → 2열(≤700px)
  - 셀프바: 8열 → 4열(≤820px)
  - 창업비용 표: `1fr 2fr 1fr` → 가운데 열 숨김, `1fr 1fr`(≤700px)
  - 매장 카드: 3열 → 1열(≤820px)
  - 문의 폼: `0.9fr 1.1fr` 2열 → 1열(≤820px)
- **브레이크포인트**: **900 / 820 / 700px** 세 가지로 고정. 새 반응형 규칙이 필요해도 이 값을
  재사용하고, 임의의 새 브레이크포인트를 만들지 않는다.
- **미디어쿼리 위치**: 해당 컴포넌트 블록 바로 뒤에 붙인다(파일 끝에 몰아두지 않음). `assets/css/style.css` 는
  대략 "토큰 → nav → hero → wave → section 공통 → 섹션별(경쟁력→메뉴→수익분석→창업비용→매장위치)
  → 폼 → 푸터 → 접근성 → reduced-motion" 순서를 유지한다.
- **히어로는 `position:sticky`**: 배경·문구·버튼이 화면에 고정된 채 다음 섹션이 그 위로 스크롤되어
  덮인다. `.wave`, `footer` 처럼 sticky 뒤에 오는 정적 형제는 `position:relative` + `z-index` 로
  sticky 위에 그려지도록 만든다.

---

## Elevation & Depth

레이어는 그림자·블러·z-index 조합으로 표현한다. 별도의 "elevation 토큰"은 없고 컴포넌트별로
직접 값을 쓴다 — 새 컴포넌트를 추가할 때는 아래 기존 값 중 가장 가까운 것을 재사용할 것.

| 용도 | 값 |
|---|---|
| 카드 기본 뜸(경쟁력 티켓 카드) | `box-shadow:0 30px 70px -24px rgba(0,0,0,.35)` |
| 카드 호버(경쟁력) | `box-shadow:0 28px 44px -16px rgba(0,0,0,.4)` + `translateY(-10px)` |
| 히어로 워드마크 앰비언트 그림자 | `drop-shadow(0 18px 26px rgba(0,0,0,.6))` 류(현재는 제거된 상태 — 재적용 시 이 값을 기준으로) |
| 영수증 종이 그림자 | `drop-shadow(0 16px 20px rgba(0,0,0,.45))` — **`filter:drop-shadow` 만 쓴다.** `.receipt-body` 에
  `box-shadow` 를 걸면 종이 하단 스캘럽(둥근 절취선)의 투명한 틈으로 그림자가 새어 회색 띠가 생긴다 |
| 프린터 바(금속) | 외부 그림자 + 붉은 테두리 글로우 + 내부 하이라이트/그림자 4겹 조합(`box-shadow` 콤마 목록) |
| 헤더 배경 분리 | 그림자 대신 `background:rgba(0,0,0,.6)` 반투명 판 + `border-bottom` 로 아래 섹션과 분리 |
| 포커스 링(접근성) | `outline:2px solid var(--gold-light); outline-offset:2px;` |

**규칙**: 반투명 검정 오버레이가 필요할 때(`header.nav` 처럼) **`opacity` 를 요소 자체에 걸지 않는다.**
`opacity` 는 자식(로고·텍스트·버튼)까지 함께 흐리게 만든다 — 배경에만 알파를 준 `rgba()`/그라디언트를
쓸 것.

---

## Shapes

- **모서리**: 대부분 각지거나 아주 약한 라운드(`border-radius:2px`) — 버튼, 인풋, 창업비용 표, 카드
  프레임(`.store-card`, `.meat-card`) 전부 이 값을 공유한다. 브랜드가 "칼같이 정직한" 느낌을 원해서
  둥근 모서리를 거의 안 쓴다.
- **예외 — 경쟁력 티켓 카드**: 유일하게 큰 라운드(`border-radius:28px` 프레임, 낱장 타일은 `26px`)를
  쓰는 컴포넌트. 참고 시안(치킨신드롬 혜택 카드)을 재현한 "티켓" 은유라서 의도적으로 다르다. 좌우
  가장자리에 반지름 13px 원(`::before`/`::after`, 배경색 = 섹션 배경)을 배치해 티켓에 펀치홀이 뚫린
  것처럼 보이게 한다 — **섹션 배경색이 바뀌면 이 원의 `background` 도 함께 바꿔야** 이질감이 안 생긴다.
- **원형**: 셀프바 아이템(`.sb-item .circle`, `border-radius:50%`), 히어로 배지 폰(`border-radius:999px`,
  알약형), 프린터 바(`border-radius:999px`).
- **시그니처 웨이브**: `.wave` SVG(물결 패스)가 브랜드의 "물결형 인테리어" 정체성을 섹션 구분선으로
  가져온 장치다. 장식이 아니라 브랜드 요소이므로 임의로 없애지 않는다(사용자가 명시적으로 지우라고
  하지 않는 한).
- **영수증 절취선**: 지그재그 `clip-path` 가 아니라 `mask-image:radial-gradient(circle …)` 로 만든
  둥근 스캘럽(반지름 10px, 간격 14px). 다른 곳에 절취선이 필요해도 이 방식을 따른다.

---

## Components

### Navigation (`header.nav`)
고정 헤더, 반투명 검정 배경(`rgba(0,0,0,.6)`). 로고 + 5개 링크(스크롤스파이로 `active` 갱신) +
CTA 버튼 + 모바일 햄버거(≤900px 에서 흰 배경 풀스크린 플라이아웃으로 전환).

### Hero (`.hero`)
`position:sticky` 배경 사진(패럴랙스, `background-attachment:fixed`) + 오버레이 그라디언트.
`.hero-wordmark` 는 골드 그라디언트 텍스트(`background-clip:text`)에 진입 시 화면을 꽉 채울 만큼
커졌다가(`scale(4.4)`) 빠르게(0.85s) 제자리로 줄어드는 `wordmarkIntro` 애니메이션(→ `assets/css/animations.css`,
재사용 가능한 키프레임)과, 계속 흐르는 `wordmarkShine` 그라디언트 반짝임을 가진다.

### 경쟁력 카드 — "티켓" 그리드 (`.comp-grid` / `.comp-card`)
어두운 라운드 프레임(펀치홀 노치 포함) 안에 타일 3개. 타일은 홀/짝으로 배경 톤이 미묘하게
갈린다(`#1C160E` / `var(--bg)`). 각 타일 구성:
1. 상단 중앙 아이콘(`::after`, 카드마다 다른 인라인 SVG data-URI, 흰색 스트로크, `mask` 대신
   `background-image` 를 직접 씀 — 색은 SVG 안에 하드코딩)
2. 골드 eyebrow 라벨(`.comp-num`, 대문자)
3. 흰색 굵은 타이틀(`h3`)
4. 본문(`p`) — 안의 `<b>` 키워드는 골드로 강조되며 **`keywordBlink` 애니메이션으로 계속 깜빡인다**
   (1.6s 주기, `opacity 1 ↔ .4`)

스크롤 진입 시 `initGridReveal`(IntersectionObserver, threshold 0.2)이 `.in-view` 를 한 번만 붙여
`compCardReveal`(아래→위 페이드) 애니메이션을 카드 순서대로 딜레이 재생한다(반복 재생 아님).
호버 시 카드가 10px 떠오르고, 상단 골드 바가 왼쪽→오른쪽으로 채워지며, 아이콘이 살짝 확대된다.

### 트러스트 스트립 (`.trust-strip` / `.trust-item`)
4개 통계(HACCP/7호점/25종+/ECO). 경쟁력 카드와 같은 `compCardReveal` 진입 애니메이션을 공유하고,
호버 시 숫자(`h5`)가 확대 + 색이 진해진다.

### 메뉴 카드 (`.meat-card`)
이미지 카드, 하단 그라디언트 오버레이 위에 라벨. 호버 시 이미지만 `scale(1.05)`.

### 수익분석 영수증 (`.receipt-*`)
프린터 슬롯에서 영수증이 뽑혀 나오는 은유. `initReceiptReveal` 이 35% 이상 보이면 `.in-view` 를 줘
`max-height` 트랜지션으로 종이가 펼쳐지고, 섹션에서 완전히 벗어나면 다시 접는다(반복 재생).
**"원" 단위는 사용자 요청으로 삭제됨 — 되살리지 않는다.**

### 창업비용 표 (`.cost-table` / `.cost-row`)
3열 그리드 표. 헤더 행(`.cost-head`)만 흰 배경 + 골드 라벨. 현재 모든 금액이 "상담 시 안내" —
실제 수치를 받으면 `index.html` 의 정적 마크업에 바로 채워 넣을 수 있다.

### 매장 카드 (`.store-card`)
흰 매장위치 섹션 안에 있는 어두운 카드(`--bg-card-2`). 사진 + 오픈일 + 지점명 + 네이버 지도 링크.

### 문의 폼 (`.inquiry-grid` / `form`)
완전 목업 — `initInquiryForm` 이 `submit` 을 가로채 버튼 텍스트만 바꾼다. 실제 전송 없음(추후
Next.js + Supabase 마이그레이션 예정).

### 버튼
- `.btn-primary`: 골드 배경, 다크 텍스트(`#1B1608`) — 가장 강한 CTA.
- `.btn-ghost`: 테두리만 있는 버튼, 히어로(어두운 배경) 전용.
- `.nav-cta`: 헤더용 아웃라인 버튼.
- `.submit-btn`: 폼 전용, hover 시 `var(--gold-light)`.

---

## Do's and Don'ts

### Do
- 색은 항상 `:root` 토큰(`var(--gold)` 등)에서 가져온다. 새 배경 밝기가 필요하면 그 컴포넌트
  스코프에서 `--text`/`--text-dim` 을 재정의하는 기존 패턴을 따른다(Colors 절 참고).
- 반응형 폭은 `clamp()` 로 처리하고, 브레이크포인트는 900/820/700px 만 쓴다.
- **`font-size` 는 항상 18px 이상 96px 이하**로 쓴다. `clamp()` 를 쓰더라도 `min` 이 18px 미만,
  `max` 가 96px 초과이면 안 된다.
- 새 애니메이션을 추가하면 **`prefers-reduced-motion` 블록에 반드시 예외를 추가**한다
  (`animation:none`, `transform:none`, `opacity:1` 로 무력화).
- 여러 컴포넌트에서 재사용할 만한 키프레임은 `assets/css/animations.css` 로 분리하고, `assets/css/style.css` 에는
  적용부(`animation: name …`)만 남긴다.
- CSS 를 만졌으면 반드시 로컬 서버로 실제 렌더링해서 확인한다(`python3 -m http.server 8765`).
  지금까지 이 프로젝트의 CSS 버그는 전부 "브라우저로 본 적이 없어서" 생겼다.
- 문구·수치·이미지 경로를 바꿀 일이 있으면 `data/content.json` 을 고친다 — JS 안에 사본을 두지
  않는다(0007 은 `FALLBACK` 패턴을 의도적으로 안 쓴다).
- 절취선이 필요하면 `mask-image:radial-gradient()` 스캘럽 방식을 재사용한다.
- 반투명한 어두운 판이 필요하면 배경에만 알파를 준 `rgba()`/그라디언트를 쓴다.

### Don't
- **18px 미만 또는 96px 초과 `font-size` 를 쓰지 않는다** — 각주·배지·폼 라벨처럼 원래 작게 쓰던
  자리도, 히어로 워드마크처럼 원래 크게 쓰던 자리도 예외 없다. 좁은 고정폭 요소(`.contact-line .k`
  등)에 18px 텍스트가 안 들어가면 폭을 늘리지, 글자를 줄이지 않는다.
- **`opacity` 를 컨테이너 전체에 걸어 반투명 배경을 만들지 않는다** — 자식 텍스트/아이콘까지
  같이 흐려진다. 배경 레이어에만 알파를 준다.
- **영수증(`.receipt-body`)에 `box-shadow` 를 쓰지 않는다** — 스캘럽 틈으로 그림자가 새어 회색 띠가
  생긴다. `filter:drop-shadow()` 만 쓴다.
- **영수증 매출 숫자 뒤 "원" 단위를 다시 붙이지 않는다** — 사용자가 명시적으로 제거를 요청했다.
- **히어로 하단 "왕십리/천호/시흥은계 오픈일" 스트립을 되살리지 않는다** — 05 매장위치 섹션과
  중복돼서 제거됐다.
- **세리프 폰트(Song Myung 등)를 쓰지 않는다** — Pretendard 단일 패밀리로 확정.
- **`.wave` SVG 디바이더를 장식으로 취급해 삭제하지 않는다** — 브랜드의 "물결형 인테리어" 정체성을
  옮긴 시그니처 장치다. 명시적 요청 없이 없애지 않는다.
- **`js/app.js` 스타일의 `FALLBACK` 상수를 만들지 않는다** — 이 폴더는 형제 폴더(0003 등)와 다르게
  fetch 실패 시 이유를 화면에 보여주는 방식을 쓴다. 데이터 사본을 만들면 JSON 을 고쳐도 화면이
  안 바뀌는 함정이 생긴다.
- **새 색상 값을 컴포넌트 안에 직접 하드코딩하지 않는다** — 영수증/프린터 바처럼 "실물을 재현하는"
  국지적 색은 예외지만, 브랜드 색(골드/배경/텍스트)은 반드시 토큰을 통해서만 쓴다.
- **경쟁력 티켓 카드의 노치 색을 잊고 방치하지 않는다** — `.comp-grid::before/::after` 의
  `background` 는 부모 섹션 배경(`var(--bg-card)`)과 같아야 펀치홀 착시가 유지된다. 섹션 배경을
  바꾸면 이 값도 함께 바꾼다.
- **`.claude/rules/*.md` 를 그대로 인용하지 않는다** — `0003`(아이스크림 카드) 컴포넌트 기준으로
  작성된 스캐폴딩이라 `data/palettes.json`, `js/app.js`, ES5/`FALLBACK` 같은 이 폴더에 없는 개념을
  전제로 한다. 실제 규칙은 이 문서와 `CLAUDE.md`, `.claude/memory/gopumgyeok-*.md` 를 따른다.
