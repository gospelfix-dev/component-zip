---
name: feedback_chrome-automation-stylesheet-cache
description: claude-in-chrome으로 띄워둔 탭에서 CSS/애니메이션을 라이브 검증할 때, computed style만 보고 "정상 동작"이라 판단하면 안 된다 — 탭이 수정 전 stylesheet를 캐시해 둔 채일 수 있다
metadata:
  type: feedback
---

2026-10-14, `.marquee-track`에 `@keyframes marquee-scroll ... infinite`를 추가하고 같은
`claude-in-chrome` 탭에서 재검증했다. `getComputedStyle(track)`은 `animationName:
"marquee-scroll"`, `animationPlayState: "running"`을 정확히 보여줬지만, `getBoundingClientRect()`
위치는 1.5초 넘게 전혀 움직이지 않았고 `track.getAnimations()`는 빈 배열(`[]`)을 반환했다.

원인: 탭이 이전에 로드한 `animations.css`(마퀴 키프레임이 없던 버전)를 그대로 쓰고 있었다.
`getComputedStyle`의 `animation-name`/`animation-play-state`는 **선언된 값을 그대로
echo할 뿐, 그 이름에 해당하는 `@keyframes`가 실제로 존재/로드됐는지는 검증하지 않는다** —
그래서 이름이 안 맞아도(또는 키프레임 자체가 없어도) "running"이라고 태연히 보고한다.
`document.styleSheets`에서 해당 시트의 `cssRules`를 직접 순회해 키프레임 이름 목록을
뽑아봐야 실제 로드된 내용을 확인할 수 있었다. 고친 방법: `<link>`의 `href`에
`?v=${Date.now()}` 같은 캐시 버스터를 붙여 JS로 강제 재요청(`?v=N` 쿼리를 index.html
URL에만 붙이는 건 효과 없음 — 그 안에서 참조하는 CSS 파일 자체의 URL도 바꿔야 한다).

**Why**: 이 프로젝트는 로컬 `python3 -m http.server`로 서빙하는데 정적 파일 서버라 캐시
제어 헤더가 느슨하고, 같은 탭에서 여러 번 edit→navigate를 반복하면 브라우저가 이전
리소스를 그대로 재사용하는 경우가 실제로 생긴다. computed style은 "선언값 echo"이지
"실행 결과 보증"이 아니라는 점을 체감했다.

**How to apply**: 이 프로젝트에서 CSS 애니메이션/키프레임을 수정한 뒤 같은 브라우저 탭으로
재검증할 때는 (1) `getComputedStyle`만으로 "정상"이라 결론 내지 않는다, (2) 의심되면
`element.getAnimations().length`(0이면 실제로는 미적용) 또는
`[...document.styleSheets].find(...).cssRules`로 실제 로드된 규칙을 직접 확인한다,
(3) 문제가 있으면 `<link>.href`에 타임스탬프 쿼리를 붙여 그 리소스만 강제 재요청하거나,
아예 새 탭(`tabs_create_mcp`)으로 다시 연다.
