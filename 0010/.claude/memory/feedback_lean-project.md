---
name: feedback-lean-project
description: 사용자는 프로젝트를 작게 유지하길 원함. 보조 스크립트나 불필요한 파일은 설명을 듣고 바로 삭제시킴 (play.command, 옛 Python 파일)
metadata:
  type: feedback
---

이 프로젝트에는 꼭 필요한 파일만 둔다. 실행 보조 스크립트, 런처, 테스트 하네스 같은 부가 파일은 먼저 묻고 만들고, 만들었다면 scratchpad에 둔다.

**Why:** 2026-11-19에 사용자가 "불필요한 것 모두 삭제"로 옛 파일을 정리했다. 같은 날 `play.command`가 무슨 파일인지 묻고, 설명을 들은 뒤 바로 "삭제해줘"라고 했다. 자동 재생을 위해 만든 런처였지만, 파일이 하나 더 있는 것보다 첫 클릭에 음악이 나오는 쪽을 택했다.

**How to apply:**
- 요청을 이루려고 프로젝트 폴더에 새 파일을 추가해야 하면, 그 파일이 왜 필요한지 먼저 말한다.
- 파일을 지우면 그 파일을 언급하던 README.md와 CLAUDE.md도 함께 고친다.

관련: [[user-profile]], [[feedback-web-only]]
