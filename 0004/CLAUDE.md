# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Digital Name Card — 모바일 명함

빌드 도구 없이 동작하는 정적 명함 컴포넌트. HTML5/CSS3/JS(ES6)/JSON 만으로 구성된다.
테마 하나(`dark` `paper` `light` `blue` `navy`)로 명함 레이아웃 전체가 바뀐다.

이 폴더는 `component-zip` 저장소의 독립 컴포넌트 하나다. 형제 폴더(`0001`~`0003`)는
서로 의존하지 않는다. `Swiper` 는 `0002` 에서 가져온 같은 벤더 파일이다.
저장소 전체가 GitHub Pages 로 배포된다(`.github/workflows/static.yml`) — 빌드 단계 없음.

## 규칙

아래 문서가 이 프로젝트의 작업 규칙이다. 코드를 수정하기 전에 해당하는 규칙을 따른다.

@.claude/rules/01-project.md
@.claude/rules/02-css.md
@.claude/rules/03-javascript.md
@.claude/rules/04-data-contract.md

---

## 명령어

```bash
# 로컬 서버 — fetch 경로로 렌더된다
python3 -m http.server 8765     # http://localhost:8765/index.html

# file:// 경로 — FALLBACK 상수로 렌더된다. 반드시 둘 다 확인할 것
open index.html
```

**두 경로가 같은 화면이어야 한다.** 다르면 `data/cards.json` 과 `js/app.js` 의 `FALLBACK` 이
어긋난 것이다. 테스트 러너·린터·빌드는 없다. 검증은 아래 세 가지가 전부다.

```bash
# 1. 데이터 정합성 훅 — 출력이 없으면 통과, 문제가 있으면 decision:block JSON 을 뱉는다
echo "{\"tool_input\":{\"file_path\":\"$PWD/data/cards.json\"}}" | bash .claude/hooks/validate-cards.sh

# 2. JSON 유효성
jq -e '.cards | length' data/cards.json

# 3. 헤드리스 스크린샷 (시각 검증)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=1600,1180 --virtual-time-budget=9000 \
  --screenshot=/tmp/shot.png "http://localhost:8765/index.html"
```

### 헤드리스 검증 요령

- **`--window-size` 의 폭이 500px 미만이면 macOS 에서 무시된다.** 캡처만 잘리고 뷰포트는
  500px 로 렌더되어 "레이아웃이 넘친다"는 착시를 준다. 좁은 뷰포트를 보려면
  임시 `iframe` 래퍼 HTML 을 만들어 그 안에 `index.html` 을 폭 고정으로 띄운다.
- 계산값·Swiper 상태를 확인할 때는 추측하지 말고 프로브 스크립트를 주입해 `--dump-dom` 으로
  읽는다 (`getComputedStyle`, `window.NameCard.swiper`). CSS 특정성 문제는 눈으로 못 잡는다.
- 임시로 만든 `__*.html` 파일은 작업 후 지운다.

---

## 아키텍처

### 데이터가 두 곳에 있다 (의도된 중복)

`data/cards.json` 이 단일 진실 공급원이지만, `js/app.js` 상단의 `FALLBACK` 상수가
같은 내용을 복제한다. `file://` 로 열면 `fetch` 가 CORS 로 막히기 때문이다.

**데이터를 고칠 때는 항상 두 파일을 함께 고친다.** 훅이 `id` 목록 수준에서 검사하고,
값 수준의 불일치는 `contact-link-check` 에이전트가 잡는다.

같은 이유로 `<script type="module">` / `import` 를 쓰지 않는다. ES6 문법은 쓰되
파일 분리는 IIFE + 전역 하나(`window.NameCard`, `window.Avatar`)로 한다.

### 테마 = 두 축의 조합

테마는 색 세트가 아니라 **레이아웃 조합**이다. `js/app.js` 의 `THEMES` 맵이 유일한 분기점이다.

| theme | `identity` (아이덴티티 배치) | `contact` (연락처 형태) |
|---|---|---|
| `dark` `paper` | `overlay` — 사진 위 글래스 박스 | `row` — 레이블 ─ 값 › |
| `light` | `header` — 회색 헤더 + 원형 프로필 | `stack` — 레이블/값 + 아이콘 버튼 |
| `blue` | `banner` — 솔리드 배너 + 증명사진 | `stack` |
| `navy` | `stacked` — 사진 아래 흰 블록 | `row` |

빌더 함수 안에 `if (theme === "dark")` 같은 분기를 흩지 않는다. 알 수 없는 `theme` 은
`dark` 로 조용히 흡수되므로 **오타가 화면상 티가 안 난다** — 훅이 이걸 잡는다.

**테마를 추가하려면 세 곳을 함께 고친다:** `cards.json` 의 `theme` 값 ·
`css/style.css` 의 `.namecard--*` 블록 · `app.js` 의 `THEMES` 맵.

### 색은 토큰 캐스케이드로만 흐른다

```
:root              페이지 색 + --card-w / --card-h (크기는 여기서만 바꾼다)
  .namecard        카드 스코프 토큰 기본값 (--card-surface, --card-ink, --glass-* …)
    .namecard--*   테마가 그 토큰만 재정의 — 컴포넌트 규칙은 한 벌뿐
      style=""     JS 가 카드별 --card-accent 를 인라인 주입
```

`--card-accent` 만 CSS 가 아니라 JS 가 넣는다. 같은 `dark` 테마여도 카드마다 강조색이
다르기 때문이다(이한결 네이비 / 이수환 그린). 컴포넌트 규칙에 헥사값을 직접 쓰지 않는다.

`--card-w` 는 `.swiper-slide` 와 `.namecard` 가 함께 읽으므로 **`:root` 에서만** 바꾼다.

### 렌더 파이프라인

```
fetch(cards.json) ─실패→ FALLBACK
   └→ renderHead()      section 키를 [data-bind] 요소에 매핑
   └→ buildCard() ×N    <template> cloneNode → 테마 클래스 → 블록별 채우기
        └→ buildIdentity / buildContactRow|Stack / buildLink / buildPhoto
   └→ DocumentFragment 로 1회 삽입 → initSwiper()
```

마크업은 JS 문자열이 아니라 `index.html` 의 `<template>` 8개에서 온다.
`innerHTML` 은 `Avatar.render()` 가 만든 SVG 문자열에만 쓴다.

**BEM 블록 이름을 바꾸면 세 파일을 동시에 고쳐야 한다** —
`index.html` 의 `<template>`, `css/style.css`, `js/app.js` 의 `querySelector`.
한 곳만 바꾸면 카드가 조용히 안 그려진다.

### 연락처 링크

`toHref(type, value)` **한 곳에서만** `href` 를 만든다. 컴포넌트 코드에 `"tel:" + ...` 를
직접 쓰지 않는다. `type` 이 스킴을 결정한다 — `mobile|tel → tel:`, `email → mailto:`,
`web → https://`, `address → 네이버 지도 검색 URL`.

### 사진과 SVG 폴백

`photo` 가 `null` 이면 `js/avatar.js` 가 카드 `id` 를 시드로 인물 SVG 를 그린다.
`Math.random()` 이 아니라 시드 난수(mulberry32)라 새로고침해도 같은 얼굴이 나온다.
`photoShape` 3종(`hero` / `circle` / `portrait`)은 **같은 그림의 다른 `viewBox` 크롭**이므로,
인물 좌표를 바꾸면 세 크롭이 전부 영향을 받는다.

사진 파일명은 카드의 `id` 와 같게 짓는다(`imgs/lee-hangyeol.jpg`).

### 슬라이더 (Swiper 8.4.7, 벤더링)

`js/swiper.js` / `css/swiper.css` 는 저장소에 직접 둔 벤더 파일이다. **고치지 않는다.**
CDN 으로 바꾸면 `file://` 에서 죽는다. 스타일을 바꿔야 하면 `css/style.css` 에서 덮어쓴다 —
Swiper 는 복합 선택자를 자주 써서 클래스 하나(0-1-0)로는 못 이기는 경우가 있다.
`!important` 대신 특정성을 같은 무게로 맞춘다.

- `initSwiper()` 는 `render()` 가 `.swiper-wrapper` 를 채운 **뒤에** 부른다.
- 이전/다음은 반드시 `<button>` — Swiper 는 `BUTTON` 일 때만 끝단에서 `disabled` 를 건다.
  우리가 다시 걸지 않는다. 포커스 튕김만 `keepNavFocus()` 가 `focusout` 으로 처리한다.

---

## 전용 에이전트

| 에이전트 | 용도 |
|---|---|
| `card-design-qa` | 시안과 구현의 시각적 차이 대조 |
| `markup-a11y` | 시맨틱 마크업·접근성·색상 대비 (수치로 계산) |
| `contact-link-check` | 연락처 링크 스킴·데이터 정합성 점검 |

## 자동 검사

`data/cards.json` 또는 `js/app.js` 를 수정하면 `PostToolUse` 훅이 데이터 정합성을 검사한다
(필수 필드, `theme`·`type`·`action` 화이트리스트, `id` 중복, 사진 경로, `FALLBACK` 동기화).
차단되면 무시하지 말고 실제로 두 파일을 맞춘다.

세션 시작 시 `SessionStart` 훅이 `.claude/memory/decisions.md` 를 컨텍스트로 주입한다.
코드만 봐서는 알 수 없는 **"왜"** 는 그 파일에 있다 — 설계 판단을 뒤집기 전에 먼저 읽는다.
