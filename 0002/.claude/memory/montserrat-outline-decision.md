---
name: montserrat-outline-decision
description: 2026-08-10, 아웃라인 겹침선 때문에 Montserrat 을 CDN 이 아닌 겹침 병합 로컬 서브셋으로 넣기로 결정
metadata:
  type: project
---

2026-08-10 에 폰트를 Montserrat 으로 교체하면서, Google Fonts CDN 대신
**겹친 컨투어를 병합한 로컬 서브셋**(`fonts/montserrat-*.woff2`)을 쓰기로 결정했다.

**Why:** Montserrat 배포본은 글리프가 획별로 겹친 컨투어라, `-webkit-text-stroke` 로 그리는
아웃라인 글자에서 획이 만나는 안쪽 경계선까지 그려진다(`R`,`E`,`B`,`F` 등에서 확인).
CSS 로 우회하려 했으나 다음이 모두 실패했다:

- `paint-order: stroke fill` + 단색 fill → 배경 그라데이션과 fill 색이 어긋나 글자 안쪽이 뜸
- 그라데이션 `background-clip: text` → 배경 페인트는 `paint-order` 영향을 안 받아 겹침선 그대로
- `text-shadow` 아웃라인 → 그림자가 배경 위에 그려져 글자가 통째로 채워짐
- 2레이어(`::before` stroke + 그라데이션 fill) → swiper wrapper 의 `transform` 때문에
  `background-attachment: fixed` 가 뷰포트가 아닌 wrapper 기준이 되어 배경과 불일치

즉 **CSS 로는 풀리지 않고 폰트 파일에서 해결해야 하는 문제**였다. fontTools 의
`removeOverlaps` 로 병합하니 CSS 는 원래의 단순한 `-webkit-text-stroke` 그대로 두고 해결됐다.

**How to apply:** 아웃라인 안쪽에 선이 다시 보이면 폰트가 원본으로 되돌아간 것이다.
CSS 를 뜯지 말고 `fonts/*.woff2` 부터 확인한다. 재생성 절차는
`.claude/rules/fonts.md` 에 그대로 재현 가능하게 적어뒀다.
폰트를 바꾸면 글자 폭이 달라지므로 `measure.sh` 로 폭 규칙을 다시 재야 한다
(Montserrat 은 이전 폰트보다 약 9% 넓어 `vw` 상한을 `3.55vw → 3.3vw` 로 내렸다).

관련: [[layout-size-constraints]], [[headless-verification-setup]]
