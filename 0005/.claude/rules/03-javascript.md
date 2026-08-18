# JavaScript 규칙

## 문법 수준 — ES6

`const` / `let`, 화살표 함수, 템플릿 리터럴, 구조분해, 기본 매개변수, `async/await` 를 쓴다.
`var` 와 `function () {}` 로 되돌리지 않는다.

## 단, ES Modules 는 쓰지 않는다

**`<script type="module">` / `import` / `export` 를 도입하지 않는다.**
`file://` 로 열면 모듈 로딩이 CORS 로 막혀 화면이 비어버린다.
더블클릭으로 확인하는 워크플로가 이 프로젝트의 요구사항이므로, 모듈 대신
**IIFE + 전역 네임스페이스 하나**로 파일을 나눈다.

```js
(function (global) {
  "use strict";
  // ...
  global.ProductCard = { render, FALLBACK };
})(window);
```

현재 전역은 `window.ProductCard`(app.js) 하나뿐이다. 파일을 더 쪼개도 전역을 늘리지 않는다.

## 로드 순서

`index.html` 에서 `js/swiper.js` → `js/app.js` 순서로 읽는다. `app.js` 는
`window.Swiper` 에 의존하므로 순서를 바꾸면 카드 이미지 캐러셀이 초기화되지 않는다.

## 렌더링

- 카드 마크업은 JS 문자열이 아니라 `index.html` 의 `<template>` 을 `cloneNode(true)` 해서 만든다.
  템플릿은 `tpl("productCardTemplate")` 헬퍼로 가져온다.
- 텍스트는 `textContent` 로 넣는다. `innerHTML` 을 쓰지 않는다.
- DOM 삽입은 `DocumentFragment` 에 모아 **한 번만** 수행한다 (`track.replaceChildren(fragment)`).
- 값이 비면 `setText()` 가 해당 요소를 제거한다. 빈 요소를 남겨 여백이 생기지 않게 한다.

## 상품 이미지 캐러셀 (Swiper)

- `bindImageCarousel()` 한 곳에서만 슬라이드를 만들고 `new Swiper()` 를 호출한다.
  **슬라이드(`<template id="photoSlideTemplate">` clone)를 `.swiper-wrapper` 에
  전부 채운 뒤에** 초기화한다. 빈 wrapper 에서 초기화하면 슬라이드 수가 0으로 잡힌다.
- 카드마다 별도의 Swiper 인스턴스를 만든다. `navigation.nextEl` / `prevEl` 에는
  **문자열 선택자가 아니라 그 카드 안의 버튼 엘리먼트를 직접 넘긴다.** 모든 카드가
  같은 클래스명(`.card__photo-prev` 등)을 쓰므로, 문자열 선택자를 쓰면 Swiper 가
  `document` 전체에서 첫 번째 매치만 찾아 모든 카드가 같은 버튼을 공유하게 된다.
- 이미지가 1장뿐이어도 Swiper 는 그대로 초기화한다. 대신 캐러셀 화살표
  (`.card__photo-nav`)를 `data-single="true"` 로 숨긴다 — 눌러도 아무 변화가 없는
  버튼을 보여주지 않기 위해서다.
- `onerror` 핸들러는 슬라이드별 `<img>` 에 각각 걸리며, **한 번 실행 후 스스로를
  해제한다** (`photo.onerror = null`). 해제하지 않으면 자리표시자로 바뀐 뒤에도
  다시 실패했을 때 무한 루프에 빠질 수 있다.
- 상품 갤러리(`.gallery__track`, 여러 상품을 넘기는 바깥 스크롤)는 Swiper 대상이
  아니다. CSS `scroll-snap` 이 담당한다 — 자세한 이유는 `.claude/memory/decisions.md`.

## 사이즈 드롭다운

- 열림 상태는 `aria-expanded` 하나로만 판단한다. 클래스와 속성을 이중으로 두지 않는다.
- 바깥 클릭으로 닫을 때 `document` 리스너는 **메뉴가 열려 있을 때만** 등록하고 닫히면 해제한다.
  항상 등록해두면 카드가 여러 장일 때 리스너가 계속 쌓인다.

## 장바구니 버튼

- 사이즈를 고르지 않은 상태에서 누르면 담지 않고 토스트로만 안내한다 (`card__size-label`
  텍스트가 기본값 `"Choose size"` 인지로 판단). 실제 장바구니 상태 저장소는 없다 — 이 컴포넌트는
  시각적 상호작용 데모이며 담긴 개수를 유지하지 않는다.

## 오류 처리

`fetch` 실패는 정상 경로다. `console.warn` 으로 알리고 `FALLBACK` 으로 렌더링한다.
사용자에게 에러 화면을 띄우지 않는다.
`navigator.share`/`navigator.clipboard` 가 없으면 공유 기능만 조용히 건너뛴다.
