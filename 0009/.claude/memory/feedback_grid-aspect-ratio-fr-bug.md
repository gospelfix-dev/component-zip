---
name: grid-aspect-ratio-fr-bug
description: grid item에 aspect-ratio를 직접 걸면 서로 다른 fr 비율의 grid-template-columns가 전부 동일 폭으로 렌더링되는 Chrome 특성(버그) — 회귀 체크 시 getComputedStyle로 확인 필수
metadata:
  type: feedback
---

2026-10-17, 후기 섹션에 참고 이미지(비대칭 인스타그램 그리드)를 반영하며
`.review-photo-grid { grid-template-columns: 1fr 1.3fr 1.3fr 1fr; }` + 각 셀에
`aspect-ratio: 1 / 1.05`를 걸었다. 소스는 정확히 파싱됐고(`document.styleSheets`로
직접 확인) 미디어쿼리도 비활성 상태였는데, `getComputedStyle(grid).gridTemplateColumns`가
4칸 전부 동일 px로 나왔다 — `[Image]`로 본 화면도 4칸이 똑같은 폭이었다.

원인 격리: 같은 컨테이너에 `aspect-ratio`가 있는 자식 8개를 넣으면 재현되고, 똑같은
자식에서 `aspect-ratio` 대신 고정 `height`(+`min-width:0`)를 쓰면 1:1.3:1.3:1 비율대로
정확히 갈라졌다(`height` 버전은 225:293:293:225px, `aspect-ratio` 버전은 4칸 모두
292.78px). grid item의 `aspect-ratio`가 "auto" 행 트랙과 맞물리며 열 크기 분배 계산에
개입해 fr 비율을 무시하고 균등 분배로 떨어지는 것으로 보인다(Chrome 렌더링 엔진의
grid+aspect-ratio 상호작용 특성).

**Why**: `[[feedback_chrome-automation-stylesheet-cache]]`(computed style은 선언값
echo일 뿐 실행 보증이 아니다)와 비슷하게, 이번엔 캐시가 아니라 **레이아웃 엔진 자체가
의도와 다르게 계산**하는 경우였다 — 소스 CSS가 맞다고 확인해도 computed 결과가 다르면
"브라우저가 틀렸을 수도 있다"는 가설까지 검증 범위에 넣어야 한다는 사례.

**How to apply**: 이 프로젝트에서 grid-template-columns에 서로 다른 fr 값을 쓰고
grid item에 세로 크기를 고정하고 싶을 때는 `aspect-ratio`를 쓰지 말고 **고정
`height`(+`min-width:0`) + 반응형 분기(`max-width:1024px`)에서 높이만 줄이는 방식**을
쓴다(`assets/css/style.css`의 `.review-photo-cell` 참고). 비대칭 grid를 만들고 computed
결과를 검증할 때는 화면만 보지 말고 `getComputedStyle(el).gridTemplateColumns`를
직접 찍어 선언한 비율과 실제 렌더링 비율이 일치하는지 확인한다.
