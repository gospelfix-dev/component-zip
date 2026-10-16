---
name: feedback_chrome-automation-stylesheet-cache
description: claude-in-chrome으로 띄워둔 탭에서 CSS/JS/JSON을 라이브 검증할 때, computed style나 동작 결과만 보고 "정상/비정상"을 판단하면 안 된다 — 탭(또는 새 탭이라도 같은 브라우저 프로필)이 수정 전 리소스를 캐시해 둔 채일 수 있다
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

**2026-10-16 재확인·확장, 0009**: 같은 함정이 `assets/js/script.js`(스크롤 애니메이션 코드)와
`data/content.json`(브랜드 워드마크 텍스트)에서도 그대로 재현됐다 — `index.html?v=N`처럼
HTML URL에만 캐시버스터를 붙이는 건 그 안에서 `<script src="assets/js/script.js">`나
`fetch('data/content.json')`처럼 **상대경로가 그대로인 하위 리소스에는 전혀 효과가 없다**.
심지어 `tabs_create_mcp`로 완전히 새 탭을 열어도 재현됐다 — HTTP 캐시는 탭이 아니라
**브라우저 프로필 단위**로 공유되기 때문에 "새 탭이니까 깨끗하겠지"라는 가정도 틀렸다.
실제로 벌어진 일: 코드를 여러 번 고쳐도 브라우저는 계속 구버전 JS를 실행해서 "방금 고친
기능이 전혀 동작 안 함"처럼 보였고, 한참 디버깅(console.log 삽입, Motion.animate 몽키패치
등)한 뒤에야 `fetch(url, {cache:'no-store'})`로 서버의 실제 파일 내용을 확인해 캐시 문제임을
특정했다. 확인/해결 절차: (1) 의심되면 `fetch(resourceUrl, {cache:'no-store'})`로 서버의
실제 최신 내용을 먼저 확인해 "서버는 맞는데 탭이 캐시 중"인지 가른다, (2)
`fetch(resourceUrl, {cache:'reload'})`를 한 번 호출해 그 URL의 HTTP 캐시 엔트리 자체를
최신으로 갱신한 뒤 페이지를 다시 navigate한다, (3) 영구 조치가 필요하면 `<script src>`에도
`<link>`와 동일하게 임시 캐시버스터 쿼리를 붙였다가 검증 후 제거한다. `python3 -m
http.server`는 캐시 제어 헤더를 거의 안 보내 이 문제가 CSS/JS/JSON 구분 없이 전부
재발하므로, 이 프로젝트에서 "코드를 고쳤는데 브라우저에서 반영이 안 된다"는 보고를
받으면 로직 버그보다 캐시를 먼저 의심한다.
