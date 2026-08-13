# CSS 규칙

## 파일 순서

`css/style.css` 는 이 순서를 유지한다. 새 스타일은 해당 구획 안에 넣는다.
각 구획에는 `/* ---------- N. 이름 ---------- */` 주석이 있다.

1. 전역 `:root` 토큰
2. 리셋
3. 배경 장식
4. 페이지 레이아웃
5. 갤러리 (Swiper 슬라이더 + 컨트롤)
6. 카드 셸 (**카드 스코프 토큰 선언 위치**)
7. 히어로 / 아바타
8. 아이덴티티 (이름·로고·칩·메타·배치 4종)
9. 연락처 (row / stack)
10. 링크 / 소개 / 슬로건
11. 테마 (`--dark` `--paper` `--light` `--blue` `--navy`)
12. 상태 (토스트·포커스)
13. 반응형
14. `prefers-reduced-motion`

## 명명

BEM 을 따른다: `블록__요소--수식어`

```
.namecard        .namecard__hero      .namecard--dark
.identity        .identity__name      .identity--overlay
.contact         .contact__value      .contact--stack
```

블록 이름을 바꿀 때는 `index.html` 의 `<template>`, `js/app.js` 의 `querySelector`,
`css/style.css` 를 **동시에** 수정한다. 한 곳만 바꾸면 카드가 렌더링되지 않는다.

## 테마는 토큰 재정의로만 만든다

**테마마다 컴포넌트 규칙을 새로 쓰지 않는다.** `.namecard` 에 선언된 카드 스코프 토큰을
테마 클래스에서 덮어쓰는 방식만 쓴다.

```css
.namecard { --card-surface: #fff; --card-ink: #16181d; }
.namecard--dark { --card-surface: #0f1013; --card-ink: #fff; }
```

`--card-accent` 는 예외적으로 **JS 가 `cards.json` 의 `accent` 값을 인라인으로 주입한다.**
CSS 에 카드별 강조색을 하드코딩하지 않는다.

새 테마를 추가하면 `js/app.js` 의 `THEMES` 맵과 `04-data-contract.md` 의 목록도 함께 갱신한다.

## Swiper 스타일 덮어쓰기

`css/swiper.css` 는 **벤더 파일이므로 고치지 않는다.** `css/style.css` 에서 덮어쓴다.
`index.html` 에서 `swiper.css` → `style.css` 순서로 읽으므로 같은 특정성이면 우리 쪽이 이긴다.

**단, Swiper 는 복합 선택자를 자주 쓴다.** 클래스 하나(0-1-0)로는 못 이기는 경우가 있다.

```css
/* .swiper-pagination-bullets.swiper-pagination-horizontal 이 width:100% (0-2-0) */
.gallery__controls .gallery__pagination { width: auto; }  /* 같은 0-2-0 으로 맞춘다 */
```

`!important` 로 해결하지 말고 **특정성을 같은 무게로 맞춘다.**
안 먹는 것 같으면 추측하지 말고 `getComputedStyle` 로 실제 값을 확인한다.

카드 폭·높이는 `.swiper-slide` 와 `.namecard` 가 함께 읽으므로 `--card-w` / `--card-h` 를
**`:root` 에서만** 바꾼다. 미디어쿼리에서도 `.namecard` 가 아니라 `:root` 를 재정의한다.

## 값 작성

- **색상은 반드시 토큰을 쓴다.** 컴포넌트 규칙 안에 헥사값을 직접 넣지 않는다.
  새 색이 필요하면 `:root` 또는 `.namecard` 에 토큰을 먼저 추가한다.
- **크기는 `clamp()` 로 반응형 처리한다.** 미디어쿼리로 폰트 크기를 계단식 변경하지 않는다.
- 카드 폭·높이는 `--card-w` / `--card-h` 토큰으로만 조절한다. 미디어쿼리에서도 이 토큰만 바꾼다.

## 글래스 오버레이

`.identity--overlay` 의 반투명 배경은 **요소 자체가 아니라 `::before` 에 건다.**
요소에 `opacity` 를 주면 그 위의 텍스트까지 흐려진다.
`backdrop-filter` 는 미지원 브라우저에서 무시되어도 `--glass-alpha` 덕분에 대비가 유지된다.

## 애니메이션

- 전환은 `transform` 과 `opacity` 만 쓴다. `width`/`height`/`top` 을 전환하지 않는다.
- 이징은 `var(--ease)` (`cubic-bezier(0.22, 1, 0.36, 1)`) 로 통일한다.
- **새 애니메이션을 추가하면 `prefers-reduced-motion` 블록에도 반드시 예외를 추가한다.**

## 반응형 분기점

| 폭 | 카드 폭(`--card-w`) | 비고 |
|---|---|---|
| 기본 | `390px` | 여러 장이 보이고 좌우 슬라이드 |
| ≤ 900px | `min(390px, 86vw)` | |
| ≤ 580px | `calc(100vw - 32px)` | 1장씩, 호버 확대 해제 |

슬라이드 간격은 CSS `gap` 이 아니라 **Swiper 의 `breakpoints.spaceBetween`** 이 정한다
(`js/app.js` 의 `initSwiper`). 분기점을 바꾸면 양쪽을 함께 맞춘다.
