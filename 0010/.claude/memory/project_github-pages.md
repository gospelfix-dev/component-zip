---
name: project-github-pages
description: 0010은 이제 component-zip 저장소(git)의 일부이고 GitHub Pages(https://gospelfix-dev.github.io/component-zip/0010/)로 배포됨. main에 푸시하면 약 1분 뒤 반영
metadata:
  type: project
---

이 폴더는 2026-11-19부터 `gospelfix-dev/component-zip` 저장소의 `0010/` 폴더로 커밋·푸시된다. 사용자는 GitHub Pages 주소 https://gospelfix-dev.github.io/component-zip/0010/ 에 올려 두고 확인한다. main에 푸시하면 Pages에 1분쯤 뒤 반영된다.

**Why:** 사용자가 "변경 파일 모두 커밋 푸쉬해줘"로 0010을 처음 올렸고, 이후 수정도 같은 방식으로 반영하길 원했다. 실제 방문자가 보는 곳은 Live Server가 아니라 이 Pages 주소다.

**How to apply:**
- 수정을 마치면 커밋 후 `git push origin main`, 그다음 `curl`로 Pages에 새 내용이 떴는지 확인한다. 커밋 메시지는 `feat: 0010 …` / `style: 0010 …`처럼 한국어로 쓴다.
- 사용자가 "안 바뀌었다"고 하면 먼저 강력 새로고침(Cmd+Shift+R)을 안내한다.
- ⚠️ 후속 조치 필요: `CLAUDE.md`의 "The folder is not a git repository, so deletions cannot be undone" 문장은 이제 틀렸다. 저장소 루트는 상위 `component-zip/`이다. 다음 세션에서 이 문장과 Publishing 절(아티팩트만 언급)을 고치자고 제안할 것.

관련: [[feedback-start-gate]], [[user-profile]]
