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
- **구조**: 단일 페이지, 5개 숫자 섹션(경쟁력 → 메뉴 → 수익분석 → 창업비용 → 매장위치) + 히어로 +
  맛집랭킹1위 배너(히어로 직후, 숫자 섹션 밖) + 푸터. 각 섹션은 `id`로 구분되고 상단
  내비게이션과 스크롤스파이(`initScrollSpy`)로 연결된다 — 맛집랭킹1위 배너는 숫자가 붙지
  않지만 nav에는 "소비자 찐후기" 링크로 연결된다(2026-09-09, 사용자 요청으로 추가).
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
  **히어로**·**맛집랭킹1위 배너**·**푸터**·**하단 고정 문의 폼 바**(`.sticky-inquiry-bar`)
  네 곳뿐이다(2026-09-08 이전에는 푸터만이었으나, 사용자가 참고 배너 이미지를 제시하며
  히어로를 명시적으로 다크 배너로 재작업해달라고 요청해 히어로가 두 번째 다크 존으로
  추가됐고, 2026-09-09에 같은 방식으로 맛집랭킹1위 배너가 세 번째, 2026-09-10에 하단 고정
  문의 폼 바가 네 번째 다크 존으로 추가됐다). 히어로와 맛집랭킹1위는 같은 다크 토큰 쌍을
  쓴다 — 히어로 전용 `--hero-ink`(`#373332`)를 배경으로, `--paper`를 텍스트로 쓴다
  (맛집랭킹1위도 새 토큰을 만들지 않고 이 쌍을 그대로 재사용). 히어로 배경은 처음엔
  `--ink`(#1B1712, 기본 텍스트 잉크 토큰)를 재사용했으나, 이후 사용자가 지정한 배경색
  (`#373332`)이 `--ink` 값과 달라 전역 텍스트 색을 건드리지 않도록 히어로 전용 토큰으로
  분리했다. 푸터와 하단 고정 문의 폼 바는 `--coffee`/`--on-coffee`를 쓴다(새 바가 새 토큰을
  만들지 않고 푸터 토큰을 재사용) — 두 다크 톤을 의도적으로 섞어 쓴다(히어로·맛집랭킹1위는
  따뜻한 차콜, 푸터·문의 폼 바는 커피브라운). A안이 전 섹션 다크였던 것과는 여전히 다르다 —
  01~05 숫자 섹션은 그대로 라이트다(맛집랭킹1위·문의 폼 바는 숫자가 붙지 않는 전역 요소라
  이 구분과 별개).

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
| `--coffee` | `#785F45` | 다크 반전 존(푸터·하단 고정 문의 폼 바·04 헤더 행) 배경 |
| `--coffee-2` | `#63492F` | 다크 존 안의 미세 구획 |
| `--on-coffee` | `#FBF7EF` | 다크 존 위의 텍스트, 豚 배지 글자색 |
| `--line-on-coffee` | `rgba(251,247,239,.18)` | 다크 존 헤어라인 |
| `--hero-ink` | `#373332` | **히어로·맛집랭킹1위 배너** 다크 반전 존 배경(히어로 2026-09-08, 맛집랭킹1위 2026-09-09부터 재사용). `--ink`는 사이트 전역 텍스트 색이라 배경으로 겸용하지 않는다 — 사용자가 지정한 배경색이 `--ink` 값(#1B1712)과 달라 별도 토큰으로 분리했다 |

**색 원칙**: 주 포인트 컬러는 `--bronze` 계열 하나뿐이다. `--red`는 예외적으로 허용된
두 번째 액센트지만 **`.seal-badge`(豚 배지)와 `.revenue-figure`(03 매출 숫자) 두 곳
밖에서는 절대 쓰지 않는다** — 새 위치에 레드를 쓰고 싶다면 규칙 자체를 먼저 갱신해야 한다.
(예외: `.proof-circle--center`는 `.gold-text`의 기존 금박 그라디언트 hex를 재사용한다 —
새 `--gold` 토큰은 아니며, 01 경쟁력 중앙 원 하나로 범위가 제한된 별도 승인 예외다.)

```bash
grep -n "var(--red)" assets/css/style.css   # 위 두 셀렉터 블록 외에 나오면 위반
```

**다크 반전 존은 히어로·맛집랭킹1위 배너·푸터·하단 고정 문의 폼 바(`.sticky-inquiry-bar`)
네 곳뿐**(04 창업비용의 헤더 행 `.price-row--head`는 국지적으로 커피브라운 배경을 쓰지만
별도의 "반전 존"으로 취급하지 않는다 — 표 헤더 강조일 뿐이다). 새 다크 섹션을 추가하고
싶으면 반드시 이 문서와 CLAUDE.md를 먼저 갱신한다 — 조용히 다섯 번째 다크 존을 늘리지
않는다.

### 그 외 하드코딩 색상 (토큰화되지 않음, 국지적 용도)

- 매장 카드 세피아 오버레이: `sepia(.15~.35) saturate(1.05~1.1)` 필터 계열(사진 보정용,
  브랜드 토큰과 무관).

---

## Typography

- **산세리프 단일 통일**: 본문·버튼·라벨류는 **Pretendard**(`var(--font-sans)`, self-host,
  `assets/fonts/`) 하나다. 카탈로그 PDF와 3개 참고 사이트 전부 세리프를 쓰지 않는다는 조사
  결과에 근거한다. 위계는 세리프-산세리프 대비 대신 **웨이트 대비**로 만든다. **예외**:
  맛집랭킹1위 배너의 "맛집 랭킹" 텍스트(`.ranking-brush`, 2026-09-09), 01~05 섹션 타이틀
  (`.section-head h2`, 2026-09-10로 확장), 문의 모달 헤드라인(`.inquiry-left h3`,
  2026-09-10로 추가 확장)은 붓글씨체 `RixYeoljeongdo`(`assets/fonts/RixYeoljeongdo.woff2`)를
  쓴다 — 전부 사용자 명시적 요청. 히어로 헤드라인(`.hero-headline`)과 러닝헤드 라벨은 아직
  이 예외에 포함되지 않는다(CLAUDE.md 산세리프 단일 통일 절 참고).
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
| `--radius-circle` | 50% | 셀프바·고기 사진 원형 크롭 + **01 경쟁력 증빙 통계 원형**(`.proof-circle`, 2026-09-10부터 예외 확장) — 그 외 배지·버튼에는 쓰지 않는다. 05 인라인 폼·문의 모달의 동의 배지(`.form-agree-check`)는 한때 이 예외였으나, 같은 날 사용자가 실제 체크 UI 참고 이미지(원형이 아닌 둥근 사각형)를 제시해 `--radius-badge`로 바뀌었다 |

- **원형은 사진 두 곳 + 01 경쟁력 증빙 통계**: 02 메뉴(고기)는 원형 + 두꺼운 검정 링
  (`.meat-frame`, `border: 9px solid var(--ink)` — "검정 원형 접시" 재현), 셀프바는 원형 +
  얇은 브론즈 링(`.selfbar-frame`, `border:3px solid var(--bronze-tint)`). 같은 원형 크롭
  기법이되 링 색으로 두 섹션을 구분한다. 2026-09-10부터 01 경쟁력의 `.proof-circle`(매장별
  순수익률 통계 콜아웃 3개)이 세 번째 예외로 추가됐다 — 사진이 아니라 통계 배지에 원형을
  쓰는 첫 사례이며, 사용자가 다른 브랜드 마케팅 그래픽을 벤치마크하며 명시적으로 승인한
  결과다. 새 원형 용도를 더 늘리지 않는다.
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

### 맛집랭킹1위 배너 (`.ranking`, 2026-09-09 신규)
히어로 바로 다음, 01 경쟁력 앞에 오는 독립 배너 섹션. nav에는 `.nav-links` 맨 앞
(경쟁력보다 앞, 문서상 섹션 순서와 동일)에 "소비자 찐후기" 링크(`href="#ranking"
data-target="ranking"`)로 연결된다(2026-09-09, 사용자 요청으로 추가 — 처음엔 링크 없이
갔으나 이후 요청받았다). 세 번째 다크 반전 존 — 히어로와 같은
`--hero-ink`/`--paper` 토큰을 재사용해 새 다크 토큰을 만들지 않았다. 구조는 05
매장위치(`.location-*`)의 풀블리드 배경 + 그라디언트 오버레이 패턴을 그대로 차용했다:
- `.ranking-bg`: `generated_bg.png`(고기 플레이팅 스프레드 사진, 새 배경 이미지를 만들지
  않고 기존 보유 에셋 재사용)를 `cover`로 깐다. 처음엔 `black_texture.jpg`(브랜드 로고
  각인 텍스처)를 썼으나, 사용자가 `generated_bg.png`로 교체를 요청해 바뀌었다.
- `.ranking-overlay`: `rgba(0,0,0,.7)` 단색 반투명(사용자 요청으로 05의 `.location-overlay`식
  좌→우 그라디언트 대신 단순화). 배경 사진 전체를 균일하게 어둡게 깔아 폰/텍스트
  가독성을 확보한다.
- `.ranking-inner`는 `justify-content:center`인 2분할 flex — `.ranking-phone`(왼쪽) /
  `.ranking-content`(가운데~오른쪽 여백까지 확장). 원래는 오른쪽에 골드 "1" 트로피
  이미지(`.ranking-trophy`, `ranking.png`)가 있는 3분할 구성이었으나, 2026-09-09 사용자가
  스크롤 리빌 인터랙션과 함께 트로피 자체를 제거해달라고 요청해 지웠다(이미지 파일도 삭제) —
  트로피를 되살릴 근거가 다시 생기지 않는 한 3분할로 되돌리지 않는다. `max-width:1024px`
  에서는 `.ranking-phone → .ranking-content` 순서로 세로 스택.
- `.ranking-phone`: 0007(시안A)의 `.review-phone` 구조를 그대로 차용한 폰 목업(에셋은
  0007-B 소유로 복사: `ranking_iphone.png` 프레임 + 매장별 네이버 리뷰 스크린샷
  `ranking_review1~3.png`). `aspect-ratio:1538/3120`(프레임 원본 비율) 안에서 화면 자리
  (`left:4.2%;top:7.5%;width:92%;height:90%`)에 프레임과 정확히 겹친다 — 이 좌표는 프레임
  에셋의 화면 컷아웃 위치에 실측으로 맞춘 값이라 프레임을 바꾸면 다시 맞춰야 한다.
  **프레임(`.ranking-phone__frame`)은 정적 이미지**지만 **화면(`.ranking-phone__screen`)은
  05 매장위치·히어로와 같은 Swiper 인스턴스**(2026-09-09 신규, `assets/js/script.js` 의
  `initRankingSwiper`)로 리뷰 3장을 자동 슬라이드한다 — 리뷰 내용을 직접 넘겨보고 싶을 수
  있어 히어로와 달리 `allowTouchMove`를 막지 않는다(수동 스와이프 허용).
- `.ranking-content`(가운데 정렬)는 `.ranking-stars`(별 5개, 각 `<span>`에 개별
  `translateY`/`rotate`를 줘 가운데가 가장 높고 양 끝으로 갈수록 낮아지는 무지개형 호를
  그린다 — 레퍼런스 이미지 기준) + 러닝헤드 "네이버 리뷰" + `<h2>` + `.ranking-rule`
  (얇은 가로선) + `.ranking-sub`. `<h2>` 안 "맛집 랭킹"은 `.ranking-brush`(붓글씨체
  `RixYeoljeongdo`, 흰색)로, "1위"는 별도 줄의 `.gold-text`(대형 골드)로 다르게 처리한다.
  트로피가 빠지며 텍스트 컬럼이 차지할 수 있는 폭이 넓어져, 2026-09-09 사용자 요청으로
  `.ranking-content`(`max-width:480px`)·`<h2>`(`clamp(48px,6.5vw,88px)`)·
  `.ranking-stars`(`26px`)·`.ranking-sub`(`20px`)를 초기값보다 키웠다.

### 01 경쟁력 — 특집 리스트 (`.feature-list` / `.feature-row`)
카드 프레임 없음. 좌측 대형 드롭캡 넘버(`.feature-num`), 우측 타이틀 + 설명을
`border-bottom:1px solid var(--paper-line)`로 구분한 행. 강조 키워드(`<b>`)에는 스크롤
진입 시 1회성 밑줄 하이라이트(`highlightSweep`, `.feature-row.in-view` 훅 재사용)가 그려진다.
행 아래 바로 트러스트 그리드로 이어진다 — 원래 있던 `.wave-rule`/`.diamond-divider`는
2026-09-10 사용자 요청으로 제거됐다. `.diamond-divider`는 이후 04의 마지막 사용처도
제거되며 현재 0곳(CSS도 삭제)이고, `.wave-rule`도 같은 날 푸터의 마지막 사용처가 제거되며
현재 0곳(CSS도 삭제)이다 — 둘 다 다시 필요해지면 새로 설계해서 추가한다.

### 트러스트 카드 (`.trust-grid` / `.trust-badge`, 2026-09-10 확대 리디자인)
라이트(`--paper`) 배경의 확대된 카드로, 상단에 순서 번호(`.trust-badge-num`, 01~04,
`--radius-badge` 사각)와 항목별 라인 아이콘(`.trust-badge-icon`, index 매핑 SVG)을 나란히
배치하고 그 아래 굵은 라벨(`.trust-badge-label`, 20px)과 설명(14px)을 둔다. 카드 우상단에는
대각선 리본 코너(`::after`, `border` 삼각형, `var(--bronze)`)가 있다 — A안 스큐어모피즘 금지
목록의 "리본 코너"에 대한 유일한 예외로 사용자가 명시적으로 승인했다(CLAUDE.md 참고). 카드
자체는 사각/라운드사각(`--radius-card`)이지 원형이 아니다(원형은 셀프바·고기 사진 +
`.proof-circle` 전용 규칙 그대로 유지). 스크롤 진입 시 `badgeIn`(scale+opacity, rotate
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

### ~~확장 타임라인~~ (`.store-timeline`, 2026-09-08 추가 → 2026-09-10 삭제)
100chae.com 벤치마크로 05 매장위치 하단에 추가했던 가로 오픈일 타임라인. 2026-09-10 사용자
요청으로 마크업·`renderStoreTimeline`(script.js)·CSS(`.store-timeline`/`.timeline-*`) 전부
제거됐다. 05는 다시 `.location-layout`(캐러셀 + 캡션) 한 블록만 남는다.

### 문의 모달 (`.inquiry-sheet-*`)
`initInquirySheet`의 열기/닫기/mock 제출 로직은 A안에서 재사용하되, **자동 오픈 트리거는
없다** — `[data-open-inquiry]` 클릭으로만 연다. 모달은 `--radius-card` 라운드 카드, 상단에
`.seal-badge`(豚) + 워드마크.

**필드 구성**: 이름 → 연락처 → 창업유형(신규 창업/기존 매장 전환/다점포 확장/상담 후 결정)
→ 창업희망지역(자유 텍스트), 순서로 4개 필드다. 창업유형/창업희망지역은 2026-09-10에 사용자
요청으로 추가됐다 — 원래 하단 고정 문의 폼 바에만 있던 필드였는데, "창업유형, 창업 희망
지역 필드를 받아야 한다"는 요청으로 확장됐다. id는 `inq` 접두사가 붙는다
(`#inqFranchiseType`/`#inqFranchiseTypeField`/`#inqFranchiseRegion`). 창업유형 셀렉트는
첫 옵션을 미리 선택하지 않고 빈 placeholder로 시작한다(2026-09-10 변경 — 하단 고정 문의
폼 바의 창업유형과 상태를 맞췄다).

**원래 있던 문의유형(방문예약/창업상담/제휴문의/기타)·문의내용(텍스트) 필드는 삭제됐다** —
먼저 05 인라인 폼(`#inquiryForm`)에서 삭제되고 동의 체크박스가 추가됐고(이 시점엔 모달은
그대로 6필드였다), 같은 날 후속 요청("여기 팝업 유형에서도 문의유형, 문의내용 필드는
없어져야 해!")으로 문의 모달에서도 동일하게 문의유형(`#inqTypeField`/`#inqType`)·문의내용
(`#inqMsg`) 마크업이 제거됐다. 곧이어 "개인정보처리방침 동의 체크도 추가해줘야지!"라는
요청으로 모달에도 05 폼과 동일한 동의 체크박스가 추가됐다(id는 `#inqAgree`로 분리).
결과적으로 05 폼과 문의 모달은 **필드 구성이 완전히 동일**하다: 이름 → 연락처 → 창업유형
→ 창업희망지역 → 개인정보처리방침 동의. 05 폼의 필드는 **전부 한 줄에 하나씩**(2열
`.field-row` 그리드 삭제, `.field-row` CSS도 죽은 코드라 함께 삭제): 이름 → 연락처 →
창업유형 → 창업희망지역 → 개인정보처리방침 동의 → 제출 버튼. 아래 select-field 단락은 두
폼 모두에 적용되는 공통 컴포넌트 설명이다.

**동의 체크박스(`.form-agree`, 05 폼·문의 모달 공용)**: 처음엔 참고 이미지(원형 체크 배지 +
"전문보기" 링크)를 따라 `.form-agree-check`를 `--radius-circle` 원형으로 만들었으나, 곧이어
사용자가 실제 체크 UI 스크린샷(체크됨/안 됨 두 상태)을 제시하며 모양을 지적해 **둥근
사각형**(`--radius-badge`, 22px, 다른 사각 배지류와 동일 토큰 — 새 토큰 없음)으로
바꿨다 — 이제 `.form-agree-check`는 `--radius-circle` 예외가 아니다(원형 토큰은 다시
셀프바·고기 사진·`.proof-circle` 세 곳 전용). 네이티브 `<input type=checkbox>`는
`position:absolute; opacity:0`으로 시각적으로만 숨기고(접근성 트리·포커스·`required`
유효성 검사 유지), 인접 형제 `.form-agree-check`(체크 시 `--bronze` 배경 + `--paper` 체크
아이콘)로 대체한다. "전문보기"는 `<label>` 밖의 형제 `<a>`라 클릭해도 체크박스가 토글되지
않는다. 하단 고정 문의 폼 바의 `.sticky-inquiry-agree`(네이티브 체크박스 + 텍스트, 별도
컴포넌트)와는 다른 구현이다 — 둘을 혼동해 수정하지 않는다. `display:flex` 규칙은 원래
`#inquiryForm .form-agree`로만 걸려 있었으나(같은 요소를 타깃하는
`#inquiryForm label{display:block;...}`과의 특이성 충돌을 피하려고 ID로 스코프했던 것),
모달에 동의 체크박스가 추가되며 `#inquiryForm .form-agree, .inquiry-sheet-form .form-agree`로
셀렉터를 넓혀 재사용했다 — 모달의 일반 label 규칙(`.inquiry-sheet-form .field label`)은
`.field` 조상에만 적용돼 `.form-agree`(`.field` 밖의 별도 블록)와 충돌하지 않으므로 같은
특이성 버그가 재현되지 않는다.

**⚠ 함정 — 숨김 체크박스가 가로 스크롤을 만들던 버그**: `#inquiryForm input, select,
textarea{width:100%}`와 `.inquiry-sheet-form input, select, textarea{width:100%}`가 둘 다
일반 `input` 셀렉터라 `.form-agree-input`(숨김 네이티브 체크박스, 원래 `width:1px`)에도
걸려 특이성으로 이겼다 — `position:absolute`인 채로 폭이 컨테이너 전체가 되며 뷰포트
밖으로 삐져나가 페이지 전체에 가로 스크롤이 생겼다(실제로 겪은 회귀, 사용자가 모달
스크린샷으로 제보). `.form-agree`의 특이성 버그와 동일 패턴 — `#inquiryForm .form-agree-input,
.inquiry-sheet-form .form-agree-input{...}`로 셀렉터를 넓혀 고쳤다.

### 푸터 (`.footer`)
`--coffee` 배경/`--on-coffee` 텍스트를 쓰는 다크 반전 존(히어로·맛집랭킹1위와는 다른 다크
톤 — 위 Overview 절 참고). 상단의 `.wave-rule--invert`는 2026-09-10 사용자 요청으로
제거됐다(이게 마지막 사용처였다 — `.wave-rule` 자체가 현재 0곳).
`logo_gold.png` 원본 이미지 + `.seal-badge` + 워드마크 텍스트를 함께 쓴다.

### Sticky CTA bar (`.sticky-cta`, 2026-09-08 신규)
전역 UI로 특정 섹션에 속하지 않는다(`</footer>` 뒤, body 직속). `.nav-cta`가
`max-width:1024px`에서 `display:none`이라 모바일에 상시 노출 CTA가 없던 공백을
메운다(100chae.com의 하단 고정 문의 폼바 구조 차용). `position:fixed; bottom:0`, 전화번호
+ `[data-open-inquiry]` 버튼만 담은 정적 바 — 열림/닫힘 애니메이션이 없어 "절제된
인터랙션" 원칙과 상충하지 않는다. `max-width:1024px`에서만 보이고 데스크톱에서는 숨는다.
`z-index:40`으로 `.nav`(50)/`.inquiry-sheet-backdrop`(100)보다 아래. 모바일 `.footer`는
`padding-bottom:calc(56px + 76px)`로 sticky-cta에 가려지지 않게 여유를 둔다.

### 하단 고정 문의 폼 바 (`.sticky-inquiry-bar`, 2026-09-10 신규)
`.sticky-cta`와 마찬가지로 전역 UI(`</footer>` 뒤, body 직속)지만 **표시 조건이 정반대다**
— `.sticky-cta`는 `max-width:1024px`(모바일)에서만 보이고, 이 바는 그 이상(데스크톱)
에서만 보인다(입력 필드 4개 + 버튼이 한 줄에 들어가려면 폭이 필요해서다). 豚 배지 +
"가맹 문의 1877-1960"(전화번호는 `data/content.json`의 실제 연락처, 참고 이미지의 숫자를
그대로 옮기지 않았다) + 이름/연락처 입력, 창업유형/창업희망지역 셀렉트, 개인정보수집 동의
체크박스, 문의하기 버튼을 한 줄로 배치한다. `initStickyInquiryForm`이 목업 제출(버튼
텍스트만 교체)을 처리한다. `position:fixed; bottom:0; z-index:40` — `.sticky-cta`와 같은
값이지만 표시 구간이 겹치지 않아 충돌하지 않는다. 배경은 `--coffee`/`--on-coffee`(푸터와
동일 토큰 재사용, 다크 반전 존 4번째 예외 — 위 Overview 절 참고). 데스크톱 `.footer`는
`padding-bottom:calc(56px + 84px)`로 이 바에 가려지지 않게 여유를 둔다.

**커스텀 셀렉트(`.select-field`, 2026-09-10 신규)** — 사이트의 네이티브 `<select>`는 전부
shadcn/ui Select를 참고한 커스텀 드롭다운으로 교체됐다(트리거 버튼 + `role=listbox` 패널).
처음엔 하단 고정 문의 폼 바 전용(`.sib-select`)으로 만들었으나, 사용자 요청으로 사이트
전체 셀렉트에 적용하며 `.select-field`로 이름을 바꿨다 — 05 인라인 문의 폼
(`#franchiseTypeField`, `#inquiryForm`), 문의 모달(`#inqFranchiseTypeField`,
`.inquiry-sheet-form`), 하단 고정 문의 폼 바(`#sibType`, `.sticky-inquiry-bar`)에서
재사용한다(하단 문의 폼 바의 창업희망지역 `#sibRegion`은 2026-09-10에 다시 일반
`<input type=text>`로 되돌아갔다 — 아래 단락 참고. 05 폼·모달의 창업희망지역
`#franchiseRegion`/`#inqFranchiseRegion`도 처음부터 같은 이유로 일반 텍스트로 추가됐다).
**`#typeField`/`#type`(05 폼)·`#inqTypeField`/`#inqType`(모달)은 원래 있던 문의유형
셀렉트였으나 같은 날 후속 요청으로 두 폼 모두에서 삭제됐다** — 이제 05 폼·모달에 남은
`.select-field`는 창업유형(`#franchiseTypeField`/`#inqFranchiseTypeField`) 하나뿐이다.
브라우저마다 못
건드리는 네이티브 select의 화살표/패널 스타일 대신 트리거를 다른 입력과 같은
`--radius-badge`로 맞추고, 선택 항목엔 체크 아이콘(`--bronze`)을 쓴다. **기본값은 트리거
아래로 펼치는 일반적인 드롭다운**(05 폼·모달)이고, **하단 고정 문의 폼 바에서만 위쪽으로
펼치도록 `.sticky-inquiry-bar .select-field-list`가 덮어쓴다** — 화면 맨 아래 고정이라
아래로 펼치면 뷰포트 밖으로 나가기 때문이다(shadcn 기본값은 아래쪽 펼침). 트리거 높이/패딩도
컨텍스트별로 다르다 — 하단 바는 다른 입력과 같은 고정 40px, 05 폼·모달은 형제 input과
같은 `12px 14px` 패딩(`#inquiryForm .select-field-trigger, .inquiry-sheet-form
.select-field-trigger` 오버라이드). **모든 select는 빈 placeholder로 시작한다** — 처음엔
05 폼·모달의 문의유형이 네이티브 select의 기본 동작(첫 옵션 자동 선택)을 재현해
`.has-value` + 첫 항목 `.selected`로 시작했으나, 하단 문의 폼 바의 창업유형과 상태가
달라 보인다는 사용자 지적으로 2026-09-10에 통일했다 — 이제 모든 `.select-field`가 선택
전까지 `.has-value` 클래스 없이 placeholder 텍스트만 보여준다. `initCustomSelects`
(`assets/js/script.js`)가 열기/닫기(트리거 클릭·바깥
클릭·Escape)와 방향키 탐색, 선택 상태(`.has-value`/`.selected`/숨은 `<input type=hidden>`)를
관리하며, 문서 전체의 `.select-field`를 한 번에 순회하므로 새 select를 추가할 때 JS를
따로 손댈 필요가 없다. 열기/닫기 전환은 opacity·transform 트랜지션만 쓰고(`@keyframes`
아님, transition), `prefers-reduced-motion`에서 비활성화된다.

**창업희망지역(`#sibRegion`)은 셀렉트가 아니라 일반 텍스트 입력이다**(2026-09-10 변경) —
사용자가 참고 이미지(플레이스홀더 "창업 희망 지역을 '시/도'로 알려주세요.")를 제시하며
고정 목록 대신 자유 입력으로 바꿔달라고 요청했다. 실제 희망 지역은 "시/도" 조합이 다양해
고정 옵션(서울/경기·인천/충청·강원/영남/호남·제주) 몇 개로는 다 담지 못한다는 게 이유다.
마크업은 다른 `.sticky-inquiry-form input`과 동일한 `<input type=text>`라 별도 CSS 없이
기존 인풋 스타일을 그대로 물려받는다. 창업유형(`#sibType`)은 그대로 `.select-field`
드롭다운이다 — 이 변경은 창업희망지역 한 필드에만 적용된다.

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
- 원형(`--radius-circle`)은 셀프바·고기 사진 크롭, 01 경쟁력 `.proof-circle`(증빙 통계)
  곳에만 쓴다. 05 인라인 폼·문의 모달의 동의 배지(`.form-agree-check`)는 둥근 사각형
  (`--radius-badge`)이라 이 예외에 포함되지 않는다.
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
- **원형을 배지·버튼에 쓰지 않는다** — 원형은 셀프바·고기 사진 크롭과 01 경쟁력
  `.proof-circle`(증빙 통계) 세 곳 전용이다.
- **영수증 프린터 슬롯/스캘럽/펀치홀 노치, 원형 잉크 스탬프, 매거진 컬로폰 표를 들여오지
  않는다** — A안 및 직전 B안의 폐기된 장치다. 리본 코너만 `.trust-badge`(01 경쟁력) 한
  곳에 예외로 남아 있다 — 다른 컴포넌트로 확장하지 않는다.
- **무한 반복 attention 애니메이션이나 자동 오픈 모달을 만들지 않는다** — "절제된
  인터랙션"이 컨셉의 핵심이다.
- **매출 숫자 뒤 "원" 단위를 붙이지 않는다**(A안에서 이어받은 규칙).
- **새 색상 값을 컴포넌트 안에 직접 하드코딩하지 않는다**(예외: `.proof-circle--center`의
  금박 그라디언트 hex는 `.gold-text`의 기존 값을 재사용하는 승인된 예외 — 위 Colors 절 참고).
- **`.claude/rules/*.md`를 무시하지 않는다.**
