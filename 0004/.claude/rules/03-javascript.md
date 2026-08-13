# JavaScript 규칙

## 문법 수준 — ES6

`const` / `let`, 화살표 함수, 템플릿 리터럴, 구조분해, 기본 매개변수, `class` 를 쓴다.
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
  global.NameCard = { render, toHref, THEMES };
})(window);
```

현재 전역은 `window.NameCard`(app.js) 와 `window.Avatar`(avatar.js) 둘뿐이다. 더 늘리지 않는다.

## 로드 순서

`index.html` 에서 `js/swiper.js` → `js/avatar.js` → `js/app.js` 순서로 읽는다.
`app.js` 는 `window.Swiper` 와 `global.Avatar.render` 에 의존하므로
순서를 바꾸면 슬라이더가 초기화되지 않거나 아바타가 그려지지 않는다.

## 슬라이더

좌우 슬라이드는 Swiper 8.4.7 이 담당한다. 초기화는 `initSwiper()` **한 곳**에만 둔다.

- **슬라이드는 렌더가 끝난 뒤에 초기화한다.** `render()` 가 `.swiper-wrapper` 를 채운 다음
  마지막에 `initSwiper()` 를 부른다. 빈 DOM 에서 초기화하면 슬라이드 수가 0으로 잡힌다.
- 다시 렌더할 때는 `swiper.destroy(true, true)` 로 먼저 정리한다. 인스턴스가 쌓이면
  이벤트가 중복 바인딩된다.
- 카드 폭은 CSS 의 `--card-w` 가 정하므로 `slidesPerView` 는 항상 `"auto"` 다.
  JS 에 픽셀 폭을 적지 않는다.
- **`touchAngle` 을 낮추지 않는다.** 카드 안쪽(`.namecard__scroll`)이 세로로 스크롤되므로,
  값이 크면 세로 스와이프가 가로 슬라이드로 오인된다.
- `a11y` 옵션의 문구는 한국어로 유지한다. Swiper 가 슬라이드에 `role="group"` 과
  `aria-label="1 / 6"` 을 자동으로 붙인다.
- **이전/다음은 반드시 `<button>` 으로 둔다.** Swiper 는 nav 요소가 `BUTTON` 일 때만
  끝단에서 `disabled` 속성을 자동으로 건다. `<a>` 로 바꾸면 그 동작이 사라진다.
  우리가 `disabled` 를 다시 걸지 않는다 — 중복이다.
- 끝단에서 포커스가 튕기는 건 `keepNavFocus()` 가 `focusout` 으로 처리한다.
  Swiper 가 `disabled` 를 거는 시점이 `slideChange` 보다 빨라 사전 처리는 불가능하다.

## 렌더링

- 카드 마크업은 JS 문자열이 아니라 `index.html` 의 `<template>` 을 `cloneNode(true)` 해서 만든다.
  템플릿은 `tpl("cardTemplate")` 헬퍼로 가져온다.
- 텍스트는 `textContent` 로 넣는다. **`innerHTML` 은 `Avatar.render()` 가 만든 SVG 문자열에만 쓴다.**
- DOM 삽입은 `DocumentFragment` 에 모아 **한 번만** 수행한다.
- 값이 비면 `setText()` 가 해당 요소를 제거한다. 빈 요소를 남겨 여백이 생기지 않게 한다.

## 테마 분기

테마별 차이는 `THEMES` 맵 한 곳에만 둔다. 컴포넌트 빌더 함수 안에
`if (theme === "dark")` 같은 분기를 흩어놓지 않는다.

```js
const THEMES = {
  dark: { identity: "overlay", contact: "row" },
  // identity: overlay | header | banner | stacked
  // contact:  row | stack
};
```

알 수 없는 `theme` 값은 `dark` 로 흡수한다. 렌더를 중단하지 않는다.

## 링크 생성

전화·문자·메일·홈페이지·주소의 `href` 는 **`toHref(type, value)` 한 곳에서만** 만든다.
컴포넌트 코드에 `"tel:" + ...` 를 직접 쓰지 않는다.
전화번호는 `digits()` 로 하이픈을 제거한 뒤 붙인다.

## 결정성

`Avatar` 의 인물 일러스트는 `Math.random()` 이 아니라 **시드 기반 난수**(mulberry32)를 쓴다.
새로고침할 때마다 얼굴이 바뀌면 안 된다. 시드는 카드의 `id` 에서 해싱한다.

## 오류 처리

`fetch` 실패는 정상 경로다. `console.warn` 으로 알리고 `FALLBACK` 으로 렌더링한다.
사용자에게 에러 화면을 띄우지 않는다.
`navigator.clipboard` 가 없으면 복사 기능만 조용히 건너뛴다.
