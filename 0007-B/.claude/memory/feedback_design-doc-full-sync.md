---
name: feedback_design-doc-full-sync
description: "docs/design.md는 같은 값(토큰/px/clamp)을 코드블록·표·prose 여러 곳에 중복 기술한다 — 값이 바뀌면 그 값이 언급된 모든 곳을 grep으로 찾아 전부 고쳐야 한다"
metadata:
  type: feedback
---

2026-09-08 히어로를 다크 배너(`--ink` 재사용)로 재작업했을 때, "다크 반전 존" 설명이 있는
CLAUDE.md/docs/design.md의 해당 단락은 그때그때 갱신했다. 그런데 이후 배경색을 `#373332`로
바꿔 `--hero-ink` 전용 토큰을 새로 만들고, `.hero-right`(제품 사진 겹침 레이어)의
`left`/`top`/`width`와 `.hero-photo-badge`의 `top`을 사용자가 여러 차례 미세 조정하는
동안 CSS 파일만 고치고 문서는 손대지 않았다. 나중에 `docs/design.md`를 다시 훑어보니
**같은 사실이 최소 5곳에서 stale해져 있었다**: `:root` 토큰 코드블록(신규 토큰 자체가
없음), 토큰 표의 `--ink` 행 설명("히어로 배경으로 재해석"), Overview 절의 다크존 설명
prose, Layout 절의 "좌우 비대칭 2단(0.55fr/0.45fr) 정적 스프레드"라는 구식 레이아웃
서술(다크 배너 재작업 이전 문구가 그대로 남아있었음), Typography 표의 히어로 헤드라인
`clamp(48px,8vw,108px)`(실제 코드는 `clamp(48px,8.5vw,120px)`), Hero 컴포넌트 절의
`.hero-right` 좌표 리터럴(`left:300px; top:-60px`, 실제는 여러 번의 사용자 조정 끝에
`left:470px; top:-30px; width:650px`).

**Why**: `docs/design.md`는 값을 "왜 이 값인지" 설명하는 prose와 "정확히 몇 px인지" 보여주는
코드블록/표를 같은 개념에 대해 중복해서 담고 있다. 변경이 생겼을 때 가장 눈에 띄는 prose
한 군데만 고치고 넘어가면, 코드블록·표·다른 섹션(Typography/Layout처럼 컴포넌트 절과
분리된 곳)에 박제된 구값이 조용히 남는다 — grep 없이 "관련 있어 보이는 문단만" 손으로
찾아 고치면 반드시 놓친다.

**How to apply**: CSS 토큰 값·clamp 범위·`position`류 리터럴(px)을 바꾼 뒤 `docs/design.md`를
동기화할 때는, 바뀐 **옛 값 자체**(예: 옛 hex, 옛 px 숫자, 옛 토큰명)를 `grep -n`으로
`docs/design.md` 전체에서 찾아 나오는 모든 위치를 확인한다 — "다크 반전 존" 같은 관련
단락 하나만 고치고 끝내지 않는다. 코드블록(`:root` 예시), 표(Colors/Typography), Overview
prose, 해당 컴포넌트 절, 이렇게 최소 4곳을 각각 점검하는 습관을 들인다. `CLAUDE.md`에도
같은 사실이 요약되어 있으면 동일하게 grep-and-fix.
