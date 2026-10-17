---
name: real-photos-introduced
description: 0009에 실사진이 2곳(히어로, 실제 후기 갤러리) 도입됨 — "전부 placeholder" 전제가 더 이상 100% 사실이 아님
metadata:
  type: project
---

2026-10-17, `data/content.json`에 `reviewGallery`(처음 8장 → 같은 날 사용자가 3장을
더 추가해 11장, `assets/imgs/realReviews/*.jpg`)를 추가하고 실제 후기 섹션의 사진
placeholder 그리드를 실사진으로 교체했다. 히어로 배경
(`assets/imgs/top-banner.png`, `.hero` CSS `background: url(...)`)도 이미 이전 세션에서
실사진으로 교체되어 있었다 — `CLAUDE.md`/`.claude/rules/01-project.md`의 "실사진이
전무하므로 placeholder만 쓴다"는 서술은 이제 두 영역에서는 사실이 아니다(다른 영역—메뉴
썸네일, 전후사진, 팀 사진—은 여전히 `tint`/`surface` placeholder 그대로).

원본 `realReviews/*.png`는 장당 ~2MB(1122×1402)였고, 그리드 셀 표시 크기(최대 ~340px)에
맞춰 `sips -Z 640 -s format jpeg -s formatOptions 75`로 리사이즈·JPEG 변환해 장당
55~80KB로 줄인 뒤 `.jpg`만 연결했다. 처음엔 원본 `.png`를 삭제하지 않고 보존했으나,
같은 날 사용자가 "폴더에 사진이 더 많다"고 오인(실제로는 `.png` 8장 + 최적화
`.jpg` 8장이 같은 폴더에 섞여 16개 파일로 보였을 뿐, 고유 사진은 8장뿐)한 뒤 상황을
설명하자 "실제 사용하는 사진 빼고 삭제해달라"고 명시적으로 요청해 `.png` 원본 8개를
전부 삭제했다. 그 직후 사용자가 `47-9.png`/`48-10.png`/`49-11.png` 3장을 실제로 폴더에
추가했고(이번엔 진짜 새 사진), 같은 `sips` 절차로 `.jpg` 변환 후 바로 원본 `.png`도
삭제했다(이번엔 매번 묻지 않고 직전 턴의 "원본은 삭제" 패턴을 그대로 적용) —
`reviewGallery`는 이제 11장, `realReviews/`에는 사용 중인 `.jpg` 11개만 남아 있다.

**Why**: `.claude/rules/01-project.md`의 "실제 인물·제품 사진을 쓰지 않는다"는 절대
규칙과 직접 충돌하는 요청이었지만, 사용자가 직접 제공한 이미지(스톡 사진 라이선스
문제의 대상이 아님)였고 `CLAUDE.md` 자체에 "실사진이 들어오면 image 필드를 추가하고
해당 render 함수에 분기를 넣는다"는 사전 승인된 절차가 이미 명시돼 있었다 — 즉 이번
건은 규칙 "위반"이 아니라 프로젝트가 처음부터 예정해 둔 전환 경로였다.

**How to apply**: 앞으로 이 프로젝트의 다른 섹션(메뉴·전후사진·팀)에 실사진 추가 요청이
오면 같은 절차(① `data/content.json`에 이미지 경로 필드 추가 ② `sips`로 표시 크기에 맞게
리사이즈·압축 ③ 해당 render 함수에 `<img>` 분기 추가)를 따르고, "실사진 금지"를 이유로
거절하지 않는다 — 다만 사용자가 제공한 파일이 맞는지(스톡 사진이 아닌지)는 확인한다.
`[[feedback_hard-rule-conflict-ask-first]]`(하드 규칙 충돌 시 먼저 확인) 패턴은 여전히
유효하지만, 이 특정 케이스(이미지 필드)는 CLAUDE.md에 이미 사전 승인돼 있어 그래도
AskUserQuestion으로 한 번 더 확인했었다(과거 사례처럼 "그라데이션 예외"는 매번 다시
확인이 필요했지만, "이미지 필드"는 문서에 이미 절차가 적혀 있던 차이가 있다).
