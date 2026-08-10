---
name: layout-size-constraints
description: PC 목록 글자 크기가 min(61px, 7vh, 3.3vw) 인 이유 — 세 항 모두 필요하다
metadata:
  type: project
---

`css/index.css` 의 `.history_pc .swiper-slide p { font-size: min(61px, 7vh, 3.3vw) }` 에서
세 항은 각각 다른 사고를 막는다. 하나라도 빼면 특정 화면 크기에서 깨진다.

- `61px` — 원 디자인 크기. 1920×1080 에서는 이 값이 그대로 적용된다
- `7vh` — 칸 높이(컨테이너 70vh ÷ slidesPerView 7 = 10vh) 안에 들어오게
- `3.3vw` — 슬라이드 폭(40vw × 62% = 24.8vw) 안에 들어오게

함께 있는 `line-height: 1.1` 과 `white-space: nowrap` 도 장식이 아니다.
전자는 기본 `normal`(≈1.46)이 칸 높이를 잡아먹는 걸 막고, 후자는 `reset.css` 의
`word-wrap: break-word` 가 연도를 다음 줄로 밀어내는 걸 막는다.

**Why:** 원래는 `font-size: 61px` 고정이었다. 1920×1080 에서는 멀쩡했지만 화면 높이가
828px 인 환경에서 텍스트 높이가 178px 이 되어(칸 높이는 82.8px) 위아래 슬라이드와 겹쳤다.
"폰트가 깨져 보인다"는 증상의 실제 원인이 이것이었다. 고정 px 는 vh 기반 칸 높이와
비율이 맞지 않아 특정 화면에서만 깨지고, 넓은 화면에서 테스트하면 발견되지 않는다.

**How to apply:** 이 값을 조정하면 반드시 `.claude/hooks/measure.sh` 로 여러 뷰포트를 다시 잰다.
1920×1080 하나만 보고 판단하면 안 된다 — 원래 버그도 거기서는 통과했다.
`.swiper-slide` 의 `width: 62%` 는 폭 제한이 아니라 오른쪽 정렬 기준점이므로 함께 건드리지 않는다.

관련: [[montserrat-outline-decision]], [[headless-verification-setup]]
