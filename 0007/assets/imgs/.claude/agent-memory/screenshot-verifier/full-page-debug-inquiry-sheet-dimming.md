---
name: full-page-debug-inquiry-sheet-dimming
description: CLAUDE.md 의 _debug_full.html 풀페이지 캡처 기법을 쓸 때, 문의하기 Bottom Sheet 가 자동으로 열려 전체 화면이 40%로 어두워지는 2차 함정
metadata:
  type: project
---

CLAUDE.md 가 안내하는 `_debug_full.html`(히어로 sticky/100vh 무력화) 풀페이지 캡처 기법에는
문서화되지 않은 2차 함정이 하나 더 있다: `--window-size` 의 높이를 문서 전체 높이(예:5200px)로
크게 잡으면, `position:fixed` 인 `#inquirySheetBackdrop`(문의하기 Bottom Sheet 배경)이 뷰포트
전체(=문서 전체 높이)를 덮게 된다. 이 시트는 `#menu` 섹션에 스크롤로 진입할 때마다 자동으로
열리는데(`initInquirySheet`, CLAUDE.md 문의하기 Bottom Sheet 절 참고), 풀페이지 렌더에서는
`#menu` 가 뷰포트 안에 들어오는 순간 옵저버가 발동해 시트가 열리고, `rgba(0,0,0,.6)` 배경이
전체 캡처 화면(모든 섹션)을 균일하게 ~40% 밝기로 뒤덮는다. 실제로 hero CTA 버튼(`--gold`
`#C9A227`)이 스크린샷에서 `(80,65,16)` ≈ 40%로 찍혀 이 현상을 확인했다.

**증상**: 풀페이지 캡처의 모든 색상(배지 빨강, 골드 버튼 등)이 실제 hex 값보다 전체적으로
어둡게 나온다 — CSS 버그가 아니라 캡처 아티팩트다. 색상 검증을 할 때 미리 실제 hex와
스크린샷 픽셀을 대조해보지 않으면 "색이 이상하다"고 오판할 수 있다.

**해결**: `_debug_full.html` 에 `<style>#inquirySheetBackdrop{ display:none !important; }</style>`
를 추가 주입하면 해당 배경이 사라지고 색상이 정상으로 찍힌다. 레이아웃/간격(gap) 측정은 이
디밍의 영향을 받지 않는다(균일하게 어두워질 뿐 경계선 위치는 그대로) — 색상 값 자체를 검증할
때만 이 오버라이드가 필요하다.

관련: [[gopumgyeok-review-badge-overlap-gap]]
