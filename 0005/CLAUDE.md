# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Product Card — 상품 상세 카드 (Iconly 스타일)

빌드 도구 없이 동작하는 정적 상품 카드 컴포넌트. HTML5/CSS3/JS(ES6)/JSON 만으로 구성된다.
뒤로가기·찜·공유·이미지 캐러셀·사이즈 선택·장바구니 담기까지 카드 하나 안에서 상호작용한다.

이 폴더는 `component-zip` 저장소의 독립 컴포넌트 하나다. 형제 폴더(`0001`~`0004`)는
서로 의존하지 않는다. 저장소 전체가 GitHub Pages 로 배포된다(`.github/workflows/static.yml`)
— 빌드 단계 없음.

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

**두 경로가 같은 화면이어야 한다.** 다르면 `data/products.json` 과 `js/app.js` 의
`FALLBACK` 이 어긋난 것이다. 테스트 러너·린터·빌드는 없다. 검증은 아래 세 가지가 전부다.

```bash
# 1. 데이터 정합성 훅 — 출력이 없으면 통과, 문제가 있으면 decision:block JSON 을 뱉는다
echo "{\"tool_input\":{\"file_path\":\"$PWD/data/products.json\"}}" | bash .claude/hooks/validate-product.sh

# 2. JSON 유효성
jq -e '.products | length' data/products.json

# 3. 헤드리스 스크린샷 (시각 검증)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=900,1200 --virtual-time-budget=9000 \
  --screenshot=/tmp/shot.png "http://localhost:8765/index.html"
```

---

## 아키텍처

### 데이터가 두 곳에 있다 (의도된 중복)

`data/products.json` 이 단일 진실 공급원이지만, `js/app.js` 상단의 `FALLBACK` 상수가
같은 내용을 복제한다. `file://` 로 열면 `fetch` 가 CORS 로 막히기 때문이다.

**데이터를 고칠 때는 항상 두 파일을 함께 고친다.** `.claude/hooks/validate-product.sh` 가
이 정합성을 자동으로 검사한다.

같은 이유로 `<script type="module">` / `import` 를 쓰지 않는다. ES6 문법은 쓰되
파일 분리는 IIFE + 전역 하나(`window.ProductCard`)로 한다.

### 상품 이미지는 사용자가 직접 채운다

`imgs/` 는 비어 있다. `data/products.json` 의 `images` 경로는 아직 존재하지 않는
파일을 가리킨다 — 사용자가 사진을 넣기 전까지는 `js/app.js` 의 `<img onerror>` 가
빗금 자리표시자(`.card__photo[data-fallback="true"]`)로 대체한다. 자세한 규칙은
`imgs/README.md`.

### 렌더 파이프라인

```
fetch(products.json) ─실패→ FALLBACK
   └→ render()
        └→ buildCard() ×N  <template> cloneNode → 블록별 채우기 → 상호작용 바인딩
             ├→ bindImageCarousel  이미지 배열 순환
             ├→ bindWishlist       찜 토글
             ├→ bindShare          Web Share API → 클립보드 폴백
             ├→ bindSizePicker     커스텀 드롭다운
             └→ bindAddToCart      사이즈 미선택 시 토스트로 안내
   └→ DocumentFragment 로 1회 삽입
```

마크업은 JS 문자열이 아니라 `index.html` 의 `<template>` 3종에서 온다.

### 카드 안 이미지 캐러셀 = Swiper, 바깥 상품 갤러리 = 스크롤 스냅

카드 안의 `< >` 화살표(`.card__photo-nav`)는 `0002`/`0004` 와 같은 버전(8.4.7)의
Swiper 가 담당한다(`js/swiper.js`/`css/swiper.css`, 벤더 파일 — 수정 금지). 카드마다
독립된 `new Swiper()` 인스턴스를 만들고, `navigation.nextEl/prevEl` 에는 문자열
선택자가 아니라 **그 카드 안의 버튼 엘리먼트를 직접** 넘긴다 — 모든 카드가 같은
클래스명을 쓰기 때문이다.

반면 `data/products.json` 의 `products` 배열이 2개 이상일 때 카드 여러 장을 넘기는
바깥 가로 스크롤(`.gallery__track`)은 Swiper 가 아니라 CSS `scroll-snap-type: x` 다.
두 영역 모두 가로 제스처라 겹칠 수 있다 — 자세한 트레이드오프는
`.claude/memory/decisions.md`.

---

## 전용 에이전트

| 에이전트 | 용도 |
|---|---|
| `product-card-design-qa` | 시안과 구현의 시각적 차이 대조 |

## 자동 검사

`data/products.json` 또는 `js/app.js` 를 수정하면 `PostToolUse` 훅이 데이터 정합성을 검사한다
(필수 필드, `categoryIcon` 화이트리스트, `id` 중복, `brand.color` hex 형식, `FALLBACK` 동기화).
차단되면 무시하지 말고 실제로 두 파일을 맞춘다.

세션 시작 시 `SessionStart` 훅이 `.claude/memory/decisions.md` 를 컨텍스트로 주입한다.
코드만 봐서는 알 수 없는 **"왜"** 는 그 파일에 있다 — 설계 판단을 뒤집기 전에 먼저 읽는다.
