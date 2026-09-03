---
name: gopumgyeok-receipt-reveal-logic
description: 0007 assets/js/script.js 의 initReceiptReveal() 구조 — 섹션 단위 IntersectionObserver + rootMargin 트릭으로 03 수익분석 영수증 전체를 동시에 리빌하는 방식. 2026-09-03 이전 개별 .receipt-col 옵저버 방식에서 변경됨
metadata:
  type: project
---

`assets/js/script.js` 의 `initReceiptReveal()`(2026-09-03 기준 122~140행 부근)은 `#profit`
섹션 하나를 대상으로 `new IntersectionObserver(cb, {threshold:0, rootMargin:'0px 0px -100% 0px'})`
를 만들고, 콜백에서 모든 `.receipt-col` 에 `classList.toggle('in-view', entry.isIntersecting)`
를 건다. 이전엔 `.receipt-col` 마다 각각 옵저버를 붙여 35% 이상 보이면 개별적으로 열리는
방식이었는데, "스크롤이 섹션 상단에 닿는 순간 3장이 한꺼번에 열려야 한다"는 요구로 바뀌었다.

**rootMargin `'0px 0px -100% 0px'` 의 의미**: bottom margin 이 뷰포트 높이의 -100% 이므로
유효 root 사각형의 bottom 이 top 과 같아져(뷰포트 높이만큼 아래에서 올려붙임) 사실상 "뷰포트
최상단의 높이 0 인 선"이 된다. 타겟(`#profit`)이 이 선과 겹치는 동안(= 섹션의 top 이 0 이하이고
bottom 이 아직 0 이상인 동안)만 `isIntersecting=true`. 섹션 상단이 뷰포트 상단을 지나는 순간
켜지고, 섹션이 통째로 스크롤을 다 지나가면(=매우 많이 스크롤해야 함, 섹션이 900px 뷰포트보다
훨씬 크므로 실사용 스크롤 범위 안에서는 꺼지지 않음) 꺼진다. 위로 다시 스크롤해 섹션 상단이
뷰포트 상단 위로 올라가면(=아직 안 닿은 상태로 되돌아가면) 즉시 꺼진다 — `.toggle()` 을 쓰고
`unobserve()` 를 호출하지 않으므로 반복 재생(양방향 토글)이 코드 구조상 보장된다.

**검증 상태(2026-09-03)**: 정적 코드 분석으로 위 로직이 요구사항과 정확히 일치함을 확인했고,
스크롤 0 상태에서 `.receipt-mask` 가 `max-height:0` 으로 접혀 있는 초기 상태는 스크린샷으로 실제
확인했다. 다만 **"스크롤이 섹션 상단에 정확히 닿는 라이브 순간 in-view 가 켜지는지"는 헤드리스
환경의 한계로 자동 스크린샷/dump-dom 증거를 얻지 못했다** — [[headless-intersection-observer-limitation]]
참고. 실제 브라우저(사용자가 직접 스크롤)에서는 정상 동작할 것으로 코드상 강하게 신뢰하지만,
"확인함"이라고 단정하지 않고 이 한계를 사용자에게 그대로 보고했다.
