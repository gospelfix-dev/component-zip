---
name: feedback_form-scoped-selector-specificity-trap
description: "이 프로젝트에서 3번 반복된 CSS 버그 — 폼 범위의 일반 element 셀렉터(#inquiryForm input, .inquiry-sheet-form input 등)가 같은 요소를 쓰는 좁은 목적의 유틸리티 클래스를 특이성으로 조용히 덮어쓴다"
metadata:
  type: feedback
---

`#inquiryForm`/`.inquiry-sheet-form` 안에 새 컴포넌트를 추가할 때, 이미 걸려 있는 폼 범위
일반 규칙(`#inquiryForm label{display:block;...}`, `#inquiryForm input, select, textarea{width:100%;...}`
같은 "이 폼 안의 모든 `<input>`/`<label>`에 적용" 규칙)이 새 컴포넌트의 좁은 목적 클래스를
특이성으로 조용히 이겨버리는 사고가 이 프로젝트에서 **3번 반복**됐다:

1. `.proof-circle.in-view{animation:badgeIn}`(클래스 2개, 0,2,0)가 `.proof-circle--center{animation:proofShine}`
   (클래스 1개, 0,1,0)를 덮어써 금박 배경 애니메이션이 조용히 안 돌았다.
2. `#inquiryForm label{display:block;...}`(ID+element, 1,0,1)가 `.form-agree{display:flex;...}`
   (클래스 1개, 0,1,0)를 덮어써 동의 체크박스·문구·"전문보기" 링크가 세로로 쪼개져 보였다.
3. `#inquiryForm input, select, textarea{width:100%}`/`.inquiry-sheet-form input, select, textarea{width:100%}`
   가 시각적으로 숨긴 네이티브 체크박스 `.form-agree-input{position:absolute; width:1px; height:1px;}`
   에도 적용돼 `width:100%`로 폭이 뒤집히며 뷰포트 밖으로 삐져나가 **페이지 전체 가로
   스크롤**을 만들었다(사용자가 스크린샷으로 제보한 뒤에야 발견됨).

**Why**: 이 프로젝트의 폼 CSS는 "폼 안의 모든 input/label/select에 공통 스타일을 준다"는
편의상 일반 셀렉터(`#inquiryForm input`, `.inquiry-sheet-form .field label` 등)를 广범위로
걸어두는 패턴을 쓴다. 이후 그 폼 **안에** 추가되는 새 컴포넌트가 같은 태그(`<input>`,
`<label>`)를 쓰면서 다른 크기/표시 방식이 필요하면(시각적으로 숨긴 체크박스, flex 레이아웃
label 등), 새 컴포넌트의 클래스 셀렉터가 특이성에서 밀려 스타일이 조용히 무시된다 — 에러도
안 나고 레이아웃만 깨져서 원인 추적이 오래 걸린다.

**How to apply**: `#inquiryForm`/`.inquiry-sheet-form`(또는 유사하게 넓은 폼 범위 셀렉터가
걸린 다른 컨테이너) 안에 새 `<input>`/`<label>`/`<select>` 기반 컴포넌트를 추가할 때는,
그 컴포넌트의 스타일 규칙을 처음부터 `#inquiryForm .새컴포넌트, .inquiry-sheet-form .새컴포넌트`
처럼 상위 폼 셀렉터를 포함해 특이성을 최소 동급 이상으로 맞춰 작성한다(둘 다 특이성이
필요한 값보다 크거나 같아야 함 — ID가 있는 쪽은 ID를 포함한 셀렉터로만 이길 수 있다).
새 컴포넌트를 추가한 뒤에는 헤드리스 스크린샷만으로 끝내지 말고, CDP로 `getComputedStyle`/
`getBoundingClientRect`를 찍어 의도한 값(`display`, `width`, `animation`)이 실제로 적용됐는지
확인하는 습관이 이 버그 계열을 가장 빨리 잡는다. [[gopumgyeok-headless-verification]]
