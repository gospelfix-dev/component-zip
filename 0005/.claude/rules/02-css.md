# CSS 규칙

## 파일 순서

`css/style.css` 는 이 순서를 유지한다. 새 스타일은 해당 구획 안에 넣는다.
각 구획에는 `/* ---------- N. 이름 ---------- */` 주석이 있다.

1. 전역 `:root` 토큰
2. 리셋
3. 페이지 레이아웃
4. 갤러리 (가로 스크롤 트랙)
5. 카드 셸
6. 아이콘 버튼 (원형)
7. 상단 바
8. 상품 이미지 스테이지 (오빗 링 + 캐러셀 화살표)
9. 배지 / 카테고리 아이콘
10. 제목 / 브랜드 / 가격
11. 하단 액션 (사이즈 · 360도 · 장바구니)
12. 사이즈 드롭다운
13. 토스트
14. 반응형
15. `prefers-reduced-motion`

## 명명

BEM 을 따른다: `블록__요소--수식어`

```
.card          .card__title       .card--??
.iconbtn       .iconbtn__icon      .iconbtn--outline
.pillbtn       .pillbtn__icon      .pillbtn--primary
```

블록 이름을 바꿀 때는 `index.html` 의 `<template>`, `js/app.js` 의 `querySelector`,
`css/style.css` 를 **동시에** 수정한다. 한 곳만 바꾸면 카드가 렌더링되지 않는다.

## 값 작성

- **색상은 반드시 토큰을 쓴다.** 컴포넌트 규칙 안에 헥사값을 직접 넣지 않는다.
  예외는 `card__brand-avatar` 하나뿐이다 — 브랜드마다 색이 달라 JS 가 `style.background` 로
  `products.json` 의 `brand.color` 를 인라인 주입한다. 이유는 `.claude/memory/decisions.md`.
- 카드 폭은 `--card-w` 토큰으로만 조절한다. 미디어쿼리에서도 이 토큰만 바꾼다.

## 상품 이미지 스테이지 (Swiper)

- `.card__orbit` 은 상품이 떠 있는 느낌을 주는 장식용 타원 테두리다. `.card__swiper` 보다
  `z-index` 가 낮게 고정되어 있다 — 슬라이드 뒤에 항상 깔려야 한다.
- `.card__photo` 는 `object-fit: contain` 으로 원본 비율을 유지한다. `cover` 로 바꾸면
  사용자가 넣는 세로형/가로형 사진이 잘려나간다.
- 이미지 로드 실패 시의 자리표시자 스타일(`[data-fallback="true"]`)을 지우지 않는다 —
  `imgs/` 가 비어 있는 초기 상태에서 카드가 완전히 빈 박스로 보이는 것을 막아준다.
- `.card__photo-nav`(캐러셀 화살표)는 `z-index: 2` 로 Swiper 슬라이드 위에 떠 있다.
  Swiper 관련 요소에 새 `z-index` 를 추가하면 이 값보다 낮게 잡는다.

## Swiper 스타일 덮어쓰기

`css/swiper.css` 는 **벤더 파일이므로 고치지 않는다.** `css/style.css` 에서 덮어쓴다.
`index.html` 에서 `swiper.css` → `style.css` 순서로 읽으므로 같은 특정성이면 우리 쪽이 이긴다.
Swiper 는 복합 선택자를 자주 써서 클래스 하나(0-1-0)로는 못 이기는 경우가 있다 — 그럴 땐
`!important` 대신 특정성을 같은 무게로 맞춘다. 안 먹는 것 같으면 추측하지 말고
`getComputedStyle` 로 실제 값을 확인한다.

## 애니메이션

- 전환은 `transform`, `opacity`, `box-shadow` 만 쓴다. `width`/`height`/`top` 을 전환하지 않는다.
- 이징은 `var(--ease)` (`cubic-bezier(0.22, 1, 0.36, 1)`) 로 통일한다.
- **새 애니메이션을 추가하면 `prefers-reduced-motion` 블록에도 반드시 예외를 추가한다.**

## 반응형 분기점

| 폭 | 카드 폭(`--card-w`) | 비고 |
|---|---|---|
| 기본 | `400px` | |
| ≤ 480px | `min(400px, 88vw)` | 하단 액션 3버튼이 줄바꿈된다 |
