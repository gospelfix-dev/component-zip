---
name: gopumgyeok-swiper-creative-loop-bug
description: Swiper effect:'creative'와 loop:true를 같이 쓰면 활성 슬라이드가 컨테이너 중앙에서 실제로 벗어나 보이는 회귀가 있다 — fade + 별도 CSS 키프레임으로 우회
metadata:
  type: feedback
---

히어로(`.hero-swiper`, `initHeroSwiper`)의 고기 사진 전환에 "아래에서 위로 슥 올라오는"
모션을 넣으려고 `effect:'fade'`를 `effect:'creative'`(`creativeEffect.next.translate`로
Y축 이동 + opacity)로 바꿨더니, 실제 기기 화면에서 활성 슬라이드가 배경 브론즈 띠 중앙을
벗어나 오른쪽으로 밀려 보이는 버그가 생겼다 — 사용자가 실제 스크린샷으로 두 번 재현해
보고했다.

`translate`의 이동 거리(100%→30%→15%→7%→1%→5%)를 아무리 줄여도, `Z`축 성분을 빼도,
`centeredSlides:true`를 추가해도 재현됐다. [[gopumgyeok-headless-verification]]에 적은
대로 `--virtual-time-budget` 헤드리스 스크린샷으로는 100% 재현됐지만, CDP로 실시간
`getBoundingClientRect()`를 찍어보면 슬라이드 rect가 컨테이너와 정확히 일치했다 — 즉
버그는 **Swiper `effect:'creative'` + `loop:true`(3장 슬라이드) 조합 자체의 내부 상태
관리 문제**로 보이며, 헤드리스 가상시간 환경에서 훨씬 잘(항상) 드러나고 실기기에서는
타이밍에 따라 간헐적으로 나타나는 것으로 추정된다. 근본 원인을 Swiper 소스 레벨까지는
확정하지 못했다.

**Why:** 이 프로젝트는 헤드리스 스크린샷이 유일한 시각 검증 수단인데, `effect:'creative'`
류의 트랜스폼 기반 이펙트는 그 검증 수단 자체를 신뢰할 수 없게 만든다 — 재현되는 버그가
진짜인지 테스트 아티팩트인지 구분하는 데만 CDP 실시간 디버깅까지 동원해야 했다.

**How to apply:** 이 프로젝트의 Swiper 인스턴스(히어로, 맛집랭킹1위 `.ranking-phone__screen`,
05 매장위치 `.store-swiper`)에 `effect:'creative'`(또는 `cube`/`flip` 등 3D 계열)를 쓰지
않는다 — `loop:true`와 결합 시 이 회귀가 재현될 위험이 크다. 슬라이드 자체의 위치는 검증된
`effect:'fade'`(크로스페이드)로 유지하고, "슬라이드업"·"바운스" 같은 부가 모션이 필요하면
Swiper의 transform 엔진과 완전히 분리된 별도 CSS `@keyframes`를 `.swiper-slide-active`
(또는 그 안의 `<img>`) 에 얹는다 — Swiper가 전환마다 `.swiper-slide-active` 클래스를 새
DOM 엘리먼트로 옮겨 붙이므로, 클래스가 바뀔 때마다 그 요소에 건 애니메이션은 자연히
재생된다(별도 재시작 트리거 불필요). `animations.css`의 `heroPhotoUp` 키프레임이 그 예시다.
