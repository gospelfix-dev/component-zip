---
name: feedback-web-only
description: 크리스마스 트리는 웹(index.html + style.css + script.js) 버전만 만든다. 터미널 Python 버전은 사용자가 원하지 않아 폐기됨. 옛 plan 파일은 낡음
metadata:
  type: feedback
---

ASCII 크리스마스 트리는 브라우저에서 도는 `index.html` 하나로만 발전시킨다. 터미널 버전(Python, `christmas_tree.py`)은 제안하거나 되살리지 않는다.

**Why:** 처음 계획은 터미널 애니메이션이었지만 사용자가 터미널 버전을 원하지 않았다. 2026-11-19 정리 때 `christmas_tree.py`와 `requirements.txt`는 휴지통으로 옮겼다.

**How to apply:**
- `~/.claude/plans/fluttering-painting-pine.md`에는 아직 터미널 버전 계획(numpy, Ghostty, `--frames`)이 들어 있다. 이 계획은 낡았으므로 따르지 않는다.
- ~~새 기능은 모두 `index.html`에 넣는다.~~ 정정 (2026-11-19): 사용자 요청으로 `index.html`(마크업), `style.css`, `script.js` 세 파일로 나눴다. 새 기능은 성격에 맞는 파일에 넣는다. 빌드 과정 없이 유지한다.

관련: [[user-profile]]
