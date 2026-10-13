# 든든김밥 — Design Guide

`0008` 랜딩의 디자인 시스템 문서다. 실제 `index.html` / `assets/css/*.css` /
`assets/js/script.js`를 기준으로 작성했으며, 코드와 문서가 어긋나면 **코드가 항상 우선**이다.

"든든김밥"은 플레이스홀더 브랜드명이며, 오공김밥·나드리김밥 레퍼런스 2곳을 분석해 겹치지
않는 독자 팔레트("재료색" 컨셉)와 포지셔닝으로 설계한 신규 기획이다.

---

## Overview

- **컨셉**: "재료 본연의 색으로 신뢰를 주는 실속형 분식 프랜차이즈" — 구운 김의 짙은
  포레스트그린, 당근·고추장의 번트오렌지 레드, 단무지·골드의 옐로우를 토큰화한 "재료색"
  팔레트. 트렌디·자동화를 과장하지 않고(오공), 폐업률 비교 같은 공포 마케팅도 쓰지 않는
  (나드리) 중립 톤이 핵심 차별점이다.
  - 2026-10-13 색상 축을 갱신했다: 분식/김밥 제품 사진 무드보드 6장(ESSEL 브랜드 포스터
    4장 + 오렌지 계열 포스터 2장)을 픽셀 샘플링(Pillow `getcolors`)해 실측한 결과,
    6장 중 4장이 짙은 포레스트그린(`#053D20`~`#0B6B3B`)을 메인 배경으로 쓰고 있어 이를
    `--bg-dark`의 새 값으로 채택했다. 기존 `#241512`(적갈블랙)보다 실제 "구운 김" 색에
    더 가깝다. `--yellow`/`--red`도 같은 무드보드의 골드 타이포·번트오렌지 포인트에 맞춰
    톤을 미세 조정했다.
- **구조**: 단일 페이지, 헤더 → 히어로 → 신뢰지표 → 경쟁력(장비) → 메뉴 → 브랜드 마퀴 티커 →
  매출증명 → 창업안내(창업 프로세스) → 가맹개설비용 → 매장안내 → 창업문의 → 푸터. 데스크톱
  하단 고정 상담바 + 모바일 FAB→모달이 전 구간에 플로팅으로 붙는다.
  - 2026-10-14 창업 프로세스 스텝퍼를 히어로 섹션(`.hero`)에서 분리해 독립 섹션
    `.guide-section`(`id="guide"`, 내비 라벨 "창업안내")으로 이동했다 — 히어로는 카피+사진
    역할만 남기고, 프로세스는 자체 스크롤 리빌 단위를 가진 별도 섹션으로 분리해 내비게이션에서
    직접 앵커 이동이 가능해졌다. 다크 그린 배경과 "든든김밥" 워터마크는 `.hero::before,
    .guide-section::before`로 두 섹션이 함께 공유한다(동일 룩 유지 목적).
  - 같은 날 두 번째 조정: `.guide-section`을 매출증명(`#profit`)과 가맹개설비용(`#cost`)
    사이로 다시 이동했다(처음엔 히어로 바로 뒤에 두었음) — "창업안내가 창업비용 바로
    앞에 나왔으면 좋겠다"는 요청에 따라, 가맹 절차를 먼저 보여준 뒤 곧바로 비용표로
    이어지는 흐름으로 바꾼 것. 내비 링크 순서도 DOM 순서와 일치하도록 "메뉴 → 창업안내 →
    창업비용"으로 재배열했다.
- **빌드 없음**: HTML5/CSS3/바닐라 JS(ES6) + 인라인 SVG. 외부 의존성은 **Swiper.js(jsdelivr
  CDN, 매장안내 캐러셀 전용) 하나뿐** — 폰트는 GmarketSans 3웨이트 self-host.
- **CSS 4파일 분리**: `init.css`(리셋) → `fonts.css`(@font-face) → `animations.css`
  (@keyframes 전용, 무한 반복 없음) → `style.css`(:root 토큰 + 컴포넌트, 미디어쿼리는
  컴포넌트 블록 바로 뒤).
- **콘텐츠 단일 진실 공급원**: `data/content.json`. `assets/js/script.js`가 `fetch`로 읽어
  10개 섹션을 렌더링한다. `image` 필드는 의도적으로 없음 — 사진 전무 상태라 JS가 색상블록
  placeholder를 그린다.
- **반응형**: 단일 브레이크포인트 `max-width:1024px`. PC는 그리드 다단, 모바일은 1~2열 스택
  + 햄버거 네비 + 하단 FAB.

---

## Colors (`:root` 토큰, `assets/css/style.css`)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#FFFBF2` | 기본 배경 (밝은 아이보리) |
| `--bg-dark` | `#0B3D20` | 히어로/매출증명/창업문의 다크 섹션 (구운 김의 포레스트그린) |
| `--bg-darker` | `#072614` | 브랜드 마퀴 티커 전용(`--bg-dark`보다 짙은 배경, 인접 다크 섹션과 구분) |
| `--bg-card` | `#FFFFFF` | 카드 배경 |
| `--bg-card-2` | `#FFF4E0` | 보조 배경(경쟁력/매장안내 섹션) |
| `--red` | `#D9481F` | CTA, 포인트, 매출/신뢰지표 숫자 (번트오렌지 레드) |
| `--red-deep` | `#B23416` | hover/active |
| `--yellow` | `#FFD65A` | 배지, 세컨더리 포인트, 다크 섹션 eyebrow (골드) |
| `--yellow-deep` | `#E8B93E` | hover |
| `--text` | `#2B211D` | 기본 텍스트(밝은 배경) |
| `--text-invert` | `#FBF3E3` | 다크 섹션 텍스트 |
| `--text-dim` | `#8C7F74` | 보조 텍스트 |
| `--muted` | `#B6A999` | 다크 섹션 보조 텍스트 |
| `--line` | `#E8DECE` | 구분선 |

색상은 전부 `var(--...)` 토큰으로만 쓴다. 컴포넌트 안에 하드코딩 헥사값을 넣지 않는다
(메뉴 placeholder의 그라디언트도 `linear-gradient(145deg, var(--yellow), var(--red))`처럼
토큰만 참조한다).

---

## Typography

- 서체는 GmarketSans 하나로 통일한다(Light 300 / Medium 500 / Bold 700, self-host). 별도
  디스플레이 폰트를 쓰지 않는다.
- **`font-size`는 12px~120px 범위만 허용한다.** 하한 아래(예: 11px)는 러닝헤드 라벨이라도
  허용하지 않는다.
- 반응형 크기는 `clamp()`로 처리한다. 미디어쿼리로 폰트 크기를 계단식 변경하지 않는다.
- 이탤릭을 쓰지 않는다.

---

## Shapes — 모서리 4단 체계

| 토큰 | 값 | 용도 |
|---|---|---|
| `--radius-badge` | 8px | 배지, 인풋, 비용표 헤더 행, 동의 체크박스 |
| `--radius-card` | 16px | 카드, 문의 모달(바텀시트) |
| `--radius-pill` | 999px | 버튼, 메뉴/비용 탭 |
| `--radius-circle` | 50% | 메뉴 placeholder 원, 프로세스 단계 아이콘 원, FAB 버튼 |

임의로 섞지 않는다 — 버튼에 `--radius-card`를 쓰거나 카드에 `--radius-pill`을 쓰지 않는다.

---

## Animation

- 전환은 `transform`/`opacity`만 쓴다. 무한 반복 애니메이션은 두지 않는다.
- 스크롤 리빌(`.reveal` 클래스가 붙은 섹션 6곳: 신뢰지표/경쟁력/메뉴/매출증명/비용/매장안내)은
  `IntersectionObserver` 1회성(`initScrollReveal`, threshold 0.15) — 진입 시 `is-visible`
  클래스를 붙이고 바로 `unobserve`한다.
- 신뢰지표 숫자와 매출 숫자(`[data-count-to]`)는 같은 1회성 IO 패턴으로 0→목표값 카운트업
  (`initCountUp`/`animateCount`, threshold 0.4) — 목표값은 처음부터 `data-count-to`에
  존재하므로 정보를 가리지 않는 장식적 카운팅이다.
- 문의 모달(바텀시트) 오픈은 `modal-sheet-in` 1회 재생.
- 새 애니메이션 추가 시 `prefers-reduced-motion` 블록에 예외를 반드시 추가한다(현재
  `init.css`의 전역 wildcard 규칙이 모든 애니메이션/전환을 제거하도록 이미 커버함).

---

## Components (섹션별 구현 메모)

1. **헤더/네비**: `position:sticky`. 2026-10-14 버거 랜딩 레퍼런스를 참고해 히어로와 하나의
   녹색 색면처럼 보이도록 기본 배경을 `var(--bg-dark)`로 바꿨다(한때 헤더 위에 별도
   이미지 배너를 뒀으나 같은 날 제거했다 — 헤더가 곧 히어로의 연장이라 중복이었음) —
   `.is-scrolled`(스크롤 10px 이상, `initScrollSpy`) 시에만 `var(--bg)` 밝은 배경+그림자로
   전환되고, 로고·nav 링크·햄버거 아이콘 색도 이때 함께 반전된다(`.site-header.is-scrolled`
   스코프). 모바일 드롭다운 패널(`#mainNav.is-open`)은 스크롤 상태와 무관하게 항상 밝은
   배경+어두운 글자로 고정(`@media(max-width:1024px) .main-nav .nav-link`).
2. **히어로**: 상단부는 2단 그리드(`.hero-top`: `.hero-copy` / `.hero-visual`)
   — 왼쪽은 아이콘+카피+CTA+손글씨 스퀴글 SVG, 오른쪽은 비대칭 원형 블롭(`.hero-blob`,
   `var(--yellow)`) 위에 투명 배경 컷아웃 사진(`.hero-photo-frame`, `assets/imgs/kimbap_cutout.png`
   — `filter:drop-shadow(...)`로 공중에 떠 있는 느낌만 주고 카드 프레임/배경 박스는 쓰지
   않는다)과
   말풍선 배지(`.hero-bubble`)·원형 스탬프 배지(`.hero-stamp`)를 겹쳐 올린 구성이다(버거
   랜딩 레퍼런스의 블롭+컷아웃 사진+스탬프 패턴 차용). `.hero::before`에 "든든김밥"을 타일링한
   인라인 SVG 워터마크(base64, opacity 0.08)를 배경으로 깔아 텍스처를 더했다. 모바일은
   `.hero-top`이 1열로 스택되고 블롭/사진 프레임 크기가 줄어든다.
3. **창업안내(창업 프로세스)**: 2026-10-14 히어로에서 분리한 독립 섹션(`.guide-section`,
   `id="guide"`, 내비 "창업안내"). 배경은 같은 날 세 단계로 바뀌었다 — 처음엔 히어로와
   같은 다크 그린(`--bg-dark`)을 공유해 한 색면처럼 이었고, 이어서 "초록 말고 다른 색"
   요청으로 `--bg-warm`(#241512, 적갈블랙 — 프로젝트 초기에 검토했다가 픽셀 샘플링 후
   폐기했던 바로 그 색을 재사용) 전용 토큰을 만들어 썼으나, 바로 다음 요청으로 다시
   `var(--yellow)`(밝은 노랑)로 확정했다 — `--bg-warm` 토큰은 더 이상 쓰이지 않아 `:root`
   에서 제거했다. 배경이 밝아지면서 기본 텍스트 색도 `--text-invert`(크림)에서
   `--text`(다크)로 뒤집었고, 워터마크도 더 이상 `.hero::before`와 공유하지 않는다 —
   `.guide-section::before`를 독립 규칙으로 분리해 **어두운 글자색**(`#2B211D`) 버전의
   같은 "든든김밥" SVG를 쓴다(히어로는 어두운 배경이라 크림색 글자 버전을 그대로 유지).
   내부 프로세스 스텝퍼는 같은 날 나드리김밥류 "지그재그 2단 스텝퍼" 레퍼런스로 전면
   교체했다 — 7단계를 4+3으로 접어 1행(1→2→3→4)은 좌→우, 2행(5→6→7)은 우→좌로 이어지며
   원형 배지(`.process-circle`, 흰 배경 + 상단 리본형 번호 배지 `.step-num-ribbon`)를
   굵은 골드 커넥터 바(`.process-connector-row1/row2/vert`)로 연결한다. 커넥터는 CSS Grid
   `grid-column`/`grid-row`를 셀 전체에 걸쳐 깔고 `z-index`를 원보다 낮춰 원 뒤로 지나가게
   해서, 원이 덮는 부분만 가려지고 원 사이 간격에서만 보이게 한다(셀 폭이 반응형으로
   바뀌어도 안전). 원 배치는 `process-step-1`~`process-step-7` 클래스로 직접
   `grid-column`/`grid-row`를 지정한다(DOM 순서에 의존하지 않음 — 커넥터 장식 div가
   먼저 렌더되어도 어긋나지 않는다). 모바일은 **Swiper 대신** 커넥터를 숨기고
   `overflow-x:auto` + `scroll-snap-type:x mandatory`로 원들만 가로 스크롤(외부 의존
   최소화). `#processTrack`은 `<div>`다(`<ol>`이 아님 — 커넥터 장식 요소가 `<li>`가
   아니므로). `.process-wrap`은 `margin:0 auto`만 가진다 — 상하 여백은 `.guide-section`
   자체의 `padding:clamp(48px,7vw,80px)`이 담당한다(예전엔 히어로 꼬리에 붙어 있어 추가
   top margin이 필요했으나, 독립 섹션이 된 뒤로는 중복 여백이 되므로 제거했다).

   2026-10-14 나드리김밥류 레퍼런스의 세부 연출(커넥터 두께·화살표·마무리 멘트·번호 배지
   모양)을 추가로 반영했다: ①커넥터(`.process-connector`) 색을 `var(--yellow)`에서
   `var(--muted)`(기존 토큰, 신규 강조색 축 추가 아님)로 바꾸고 두께를 6px→
   `clamp(10px,1.6vw,16px)`로 키워 레퍼런스의 굵은 탄색 바에 가깝게 했다 — 이후 화살표
   (`var(--red-deep)`)와 색이 안 맞는다는 피드백에 따라 `var(--muted)`→`var(--red-deep)`로
   다시 바꿔 화살표와 커넥터가 같은 톤의 한 줄기 흐름처럼 보이게 했다. ②1열/2행(원래
   비어있는 셀, step-1 바로 아래)에 `.process-callout`로 "높은 매출로 / 안정성 있는(흰
   하이라이트 칩) / 운영 OK!" 마무리 멘트를 넣고, 그 오른쪽에 `.process-connector-arrow`
   (`var(--red-deep)`)를 배치해 마지막 단계에서 멘트로 흐름이 이어지는 것을 표현했다.
   화살표 모양은 레퍼런스를 보고 두 번 조정했다 — 처음엔 순수 삼각형(clip-path 3점)으로
   했더니 뒤쪽 탄색 막대(`.process-connector-row2`)와의 사이에 끊김이 보여, 화살촉+
   사각 샤프트가 하나로 이어진 7점 폴리곤(`clip-path:polygon(100% 32%,40% 32%,40% 6%,
   0% 50%,40% 94%,40% 68%,100% 68%)`)으로 되돌리고 박스 폭을 넓혀(`clamp(70px,8vw,110px)`)
   샤프트 끝이 뒤쪽 막대 쪽으로 이어지도록 했다. 그래도 화살표(1열 셀)와 막대
   (`.process-connector-row2`, 2열부터 시작)는 그리드 컬럼 갭(`column-gap:clamp(12px,
   2vw,28px)`)만큼 떨어져 있어 둘 사이에 끊김이 보였다 — `justify-self:end`로 1열 셀의
   오른쪽 끝에 붙은 화살표 박스에 `margin-right:-48px`를 줘서 셀 경계 너머로 48px만큼
   밀어 넣었다(갭 최대값 28px를 넉넉히 덮고 2열 안쪽까지 들어가지만, 그 안쪽은 원
   (z-index 높음)에 가려지므로 보이는 부분만 막대와 자연스럽게 맞물린다). 이어서 샤프트
   두께가 막대(`.process-connector`, `clamp(10px,1.6vw,16px)`)보다 두꺼워 이음새에 단차가
   보인다는 피드백으로, 폴리곤의 샤프트 y범위를 `32%~68%`(박스 높이의 36%)에서
   `37%~63%`(26%)로 좁혀 막대와 비슷한 두께로 맞췄다. 모바일에서는
   `order:99`로 가로 스크롤 맨 끝에 카드 형태로 노출하고 화살표는 숨긴다(`display:none`).
   ③`.step-num-ribbon`을 사각 배지
   (`border-radius`)에서 하단이 뾰족한 리본/방패 모양(`clip-path:polygon(0 0,100% 0,100%
   62%,50% 100%,0 62%)`)으로 바꿨다 — 배경은 처음에 레퍼런스처럼 `var(--bg-dark)`를
   시도했으나 `.guide-section` 배경 자체가 이미 `--bg-dark`라 배지가 배경에 묻혀 보이는
   문제가 있어 `var(--red)`로 되돌렸다(모양만 레퍼런스 차용, 색은 이 섹션의 기존 배경과
   대비되는 기존 토큰 유지). 같은 이유로 `.callout-highlight`도 배경이 최종적으로
   `var(--yellow)`가 되면서 원래 쓰던 `var(--yellow)` 칩 배경이 섹션 배경과 같은 색이 되어
   묻혔다 — `var(--white)`로 바꿔 흰 원형 카드와 통일된 톤으로 대비를 살렸다. 원 안
   텍스트(`.step-label` 15px→`clamp(18px,2vw,22px)`, `.step-desc` 12px→`clamp(14px,1.5vw,16px)`)
   도 너무 작다는 피드백으로 함께 키웠다 — 원(`.process-circle`) 자체 크기는 그대로라
   일부 긴 설명(예: "희망 지역 상권·입지 분석")은 줄바꿈 지점이 다소 타이트해졌지만
   overflow 없이 들어간다.
4. **신뢰지표**: 4카드, `data-count-to`로 카운트업.
5. **경쟁력(장비)**: 장비 4종, Before/After 텍스트 비교 + 인라인 SVG 아이콘(`ICONS` 맵,
   `assets/js/script.js`). 사진 없이 선 아이콘만으로 표현.
6. **메뉴**: 카테고리 탭(`initMenuTabs`, 이벤트 위임) + 원형 색상블록 placeholder
   (`.menu-ph`, 그라디언트) + 이니셜 1글자. `badge`가 빈 문자열이면 배지를 렌더링하지 않는다.
7. **브랜드 마퀴 티커**(`.marquee-section`, `id="marquee"`): 메뉴 섹션 바로 다음, 정적
   마크업(JSON 비의존, `index.html`에 직접 하드코딩 — 순수 장식용이라 `data/content.json`에
   엮지 않았다). 레퍼런스(efully.co.kr)처럼 아이콘+문구("매일 든든하게" / "든든김밥")를
   끊임없이 왼쪽으로 흘리는 티커다. 동일한 아이템 그룹을 두 벌(`.marquee-group`) 나란히
   두고 `@keyframes marquee-scroll`로 `translateX(0)→translateX(-50%)`를 반복해 이음새
   없이 보이게 하는 표준 마퀴 기법을 썼다. **이 프로젝트에서 유일하게 허용된 무한 반복
   애니메이션**이다(2026-10-14 사용자가 레퍼런스를 제시하며 명시적으로 요청해 추가한
   예외 — `.claude/rules/02-css.md` 애니메이션 섹션에 사유를 기록해뒀다). 전체 섹션은
   장식 반복이라 `aria-hidden="true"`로 스크린리더에서 제외했고, `prefers-reduced-motion`
   에서는 `.marquee-track{ animation:none; }`으로 정지한다. 아이콘은 처음엔 인라인 SVG였으나
   사용자 제공 사진으로 교체했다 — 처음엔 김밥 사진(`marquee_kimbap.png`) 한 장만 전
   아이템에 썼으나, 이어서 "홀수 아이템은 김밥, 짝수 아이템은 떡볶이 사진"으로 바꿔달라는
   요청에 따라 라볶이 사진(`marquee_tteokbokki.png`)을 추가해 `index.html`의
   `.marquee-item` 12개(그룹당 6개×2벌)에 `<img>` `src`를 홀/짝 번갈아 하드코딩했고,
   바로 다음 요청으로 "첫 번째는 떡볶이, 두 번째는 김밥" 순으로 한 번 더 뒤집었다 —
   현재는 홀수=떡볶이, 짝수=김밥이다(둘 다 160×160 원형 컷아웃, `.marquee-icon`의
   `overflow:hidden` + `object-fit:cover`가 정확한 원이 아니어도 둥글게 잘라준다).
   배경은 바로 위아래 섹션(메뉴=라이트, 매출증명=`--bg-dark`)과 구분되도록 `--bg-dark`보다
   더 짙은 전용 토큰 `--bg-darker`(`#072614`, `--bg-dark`를 0.62배 어둡게 한 값)를 새로
   추가해 썼다 — 포인트 컬러가 아닌 배경 뉴트럴 토큰이라 "red/yellow 둘뿐" 규칙과는
   무관하다.
8. **매출증명/수익분석**: 다크 배경, `revenue-figure`가 카운트업 대상. 순수익률은 정적 텍스트.
9. **가맹개설비용표**: 소형(10평)/표준(20평) 2탭(`initCostTierToggle`). 탭 전환 시
   `renderCostTable`이 `tier.rows.reduce()`로 합계를 **매번 재계산**한다 — `price`는 전부
   숫자 리터럴이어야 하며 "상담 시 안내" 같은 문자열을 섞으면 합계 계산이 깨진다.
10. **매장안내**: 지역 `<select>`(`initStoreFilter`) 변경 시 `storesState.activeRegion`을
   갱신하고 `renderStoreSlides()`를 다시 호출한다. 이때 기존 Swiper 인스턴스를
   `destroy(true,true)`로 완전히 제거한 뒤 `new Swiper(...)`로 재생성한다(`initStoreSwiper`)
   — 필터링 후 슬라이드 개수가 바뀌므로 `update()`만으로는 부족해 재생성 방식을 쓴다.
11. **창업문의**: 인라인 폼(`#inquiryForm`) + 데스크톱 하단 고정 바(`#stickyForm`,
   `max-width:1024px`에서 `display:none`) + 모바일 FAB(`#inquiryFab`, 1024px 이하에서만
   표시)→모달(`#inquiryModal`, ESC/배경클릭/닫기버튼으로 닫힘). 하단 고정 바(`.sticky-inquiry`)
   배경은 2026-10-14 `var(--text-invert)`(밝은 크림)로 바꿨다 — 다크 배경 전제였던
   전화번호/인풋/동의문구 색도 함께 라이트 배경용으로 반전했다(전화번호 `var(--red)`,
   인풋 `var(--white)` 배경 + `var(--line)` 테두리, 동의문구 `var(--text-dim)`). 세 폼 모두 `mockSubmit()`
   공용 함수로 제출 버튼 텍스트를 2초간 "문의 접수 완료"로 바꾸는 mock만 수행한다(실제 전송
   없음). 카운트다운(`initCountdown`)은 `inquiry.deadlineDate` 기준 실제 `Date` 계산으로
   D-day 텍스트를 1분마다 갱신한다 — 가짜 할인 타이머가 아니다.
12. **푸터**: 연락처는 `renderContact`가 `data/content.json`의 `contact`에서 채운다.

---

## Do's and Don'ts

- **Do**: 색상은 토큰만, 모서리는 4단 체계만, font-size는 12~120px, 미디어쿼리는 컴포넌트
  블록 바로 뒤, 스크롤 리빌/카운트업은 IO 1회성.
- **Don't**: 무한 반복 애니메이션, 세리프/이탤릭, `--red`/`--yellow` 외 신규 강조색 축 추가,
  비용표 `price`에 숫자 아닌 문자열 섞기(합계 계산 깨짐), 폼 범위 셀렉터를 체크박스까지
  포함하는 너무 넓은 선택자로 작성(특이성 역전 주의 — 이 함정은 형제 프로젝트에서 반복
  관찰된 사례이므로 신규 폼 요소 추가 시 상위 셀렉터를 명시적으로 포함할 것).
