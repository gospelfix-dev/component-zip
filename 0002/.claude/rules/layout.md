# HISTORY 레이아웃 규칙

수치가 서로 물려 있어서 한 값만 바꾸면 다른 곳이 깨진다. 근거를 남겨둔다.

## 이중 마크업

PC 와 모바일이 **같은 데이터로 별도 마크업**을 쓴다. 하나를 고치면 다른 쪽도 확인해야 한다.

| | 조건 | 마크업 | Swiper |
|---|---|---|---|
| PC | `> 1080px` | `.history_pc` | 목록(vertical) + 썸네일(horizontal) 2개 |
| 모바일 | `≤ 1080px` | `.history_mo` | 1개 + custom pagination |

전환은 `css/index.css` 의 `@media (max-width: 1080px)` 에서 `display` 토글로만 한다.

## Swiper 인스턴스 3개

`js/index.js` 에서 만든다. 서로 클릭 이벤트로 연결되어 있다.

1. **`.history-swiper.mo`** — 모바일. `pagination.renderCustom` 으로 연/월 목록을 직접 그린다.
   `order` 인라인 스타일로 활성 항목을 맨 위로 올린다.
2. **`.history .thumbs-swiper`** — PC 우측 이미지.
   ⚠️ `init` / `slideChange` 에서 **`wrapperEl.style.transform` 을 직접 계산해 덮어쓴다.**
   슬라이드 폭이나 `margin-left/right` 를 바꾸면 이 계산도 함께 고쳐야 한다.
3. **`.history .history-swiper.pc`** — PC 좌측 목록. `direction: vertical`,
   `slidesPerView: 7`, `loopedSlides: 8`(데이터 개수와 같게 유지).

## loop 복제 슬라이드

`loop: true` 라서 DOM 에는 슬라이드가 **데이터 개수보다 많이** 존재한다(복제본).
`querySelectorAll` 로 세거나 순회할 때 중복이 잡히므로, 텍스트 등으로 중복을 걸러야 한다.
`nth-child` 기반 스타일링은 복제 때문에 신뢰할 수 없다.

## PC 좌측 목록의 수치 사슬

```
.history_pc .title-section   height: 100vh
  └ .container               height: 70%          →  70vh
      grid-template-columns: 40% 60%
      └ 좌측 컬럼                                 →  40vw
          └ .swiper-slide    width: 62%           →  24.8vw   ← 텍스트 최대 폭
             slidesPerView: 7 → 칸 높이 70vh / 7  →  10vh     ← 텍스트 최대 높이
```

그래서 글자 크기에 상한이 걸려 있다:

```css
.history_pc .swiper-slide p{ font-size: min(61px, 7vh, 3.3vw); line-height:1.1; white-space:nowrap; }
.history_pc .swiper-slide p span{ font-size: 0.46em; }   /* 연도 = 28/61 비율 */
```

| 항목 | 값 | 이유 |
|---|---|---|
| `61px` | 원 디자인 크기 | 1920×1080 에서는 이 값이 그대로 적용된다 |
| `7vh` | 칸 높이(10vh) 안에 들어오게 | `7vh × 1.1 = 7.7vh < 10vh` |
| `3.3vw` | 슬라이드 폭(24.8vw) 안에 들어오게 | 가장 긴 `DECEMBER 2022` ≈ `6.75em` → `em ≤ 3.67vw`, 여유 포함 |
| `line-height: 1.1` | 기본 `normal`(≈1.46)이 칸 높이를 잡아먹음 |
| `white-space: nowrap` | `reset.css` 의 `word-wrap: break-word` 가 연도를 다음 줄로 밀어냄 |
| `span` 을 `em` 으로 | 월과 연도의 비율을 항상 유지 |

**셋 중 하나라도 빼면 특정 화면 크기에서 글자가 겹치거나 구분선을 침범한다.**
Montserrat 은 이전 폰트보다 약 9% 넓어서 `3.55vw` 로는 부족해 `3.3vw` 로 내렸다.

## 손대면 위험한 것들

- **`.swiper-slide` 의 `width: 62%`** — 위치 기준이다. `.select-swiper` 가 `align-items: flex-end`
  라서 슬라이드는 **오른쪽 정렬**이다. 폭을 키우면 텍스트가 왼쪽으로 밀려 화면 밖으로 잘린다.
  (`100%` 로 바꿨다가 실제로 잘렸다)
- **`.thumbs-swiper .swiper-slide` 에 `overflow: hidden`** — `.activetxt` 가 `top: -29%` 로
  슬라이드 **밖에** 있다. `overflow:hidden` 을 주면 우측 상단 큰 제목이 통째로 사라진다.
- **`.swiper-slide-active` 규칙** — 활성 항목을 흰색으로 채우는 유일한 규칙이다.
  이 두 줄이 사라지면 활성 항목이 다른 항목과 구분되지 않는다.
  ```css
  .history_pc .swiper-slide.swiper-slide-active p { color:#fff; -webkit-text-stroke:1px #fff; }
  .history_pc .swiper-slide.swiper-slide-active p span { color:#fff; -webkit-text-stroke:1px #fff; }
  ```
- **`-webkit-text-fill-color`** — `color` 를 덮어쓴다. 이걸 도입하면 활성 슬라이드 규칙이
  무력화되므로 활성 쪽에도 같이 지정해야 한다.

## 배경 그라데이션과 아웃라인

`.history_pc` 배경은 `linear-gradient(180deg,#414141 0%,#000 100%)` 다.
비활성 글자는 `color: transparent` + `-webkit-text-stroke` 로 **속이 비치는** 아웃라인이라
배경이 그대로 보인다.

글자 안쪽을 단색으로 채워 배경을 흉내내려 하면 안 된다. 그라데이션과 어긋나 글자 내부가
떠 보인다. `background-clip: text` 로 같은 그라데이션을 넣는 방법도 **swiper wrapper 의
`transform` 때문에 `background-attachment: fixed` 가 뷰포트가 아닌 wrapper 기준이 되어**
어긋난다. 아웃라인 문제는 CSS 가 아니라 폰트 쪽에서 해결했다 → [`fonts.md`](./fonts.md)

## 자동 검사

위 규칙 중 기계로 잴 수 있는 것은 `.claude/hooks/measure.sh` 가 검사한다.
수치를 바꿨다면 그 스크립트 상단 `INVARIANTS` 도 함께 갱신한다.
