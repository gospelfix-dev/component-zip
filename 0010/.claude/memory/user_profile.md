---
name: user-profile
description: 사용자는 한국어로 소통하는 웹 개발자. 참고 이미지로 기능을 하나씩 요청하고, VS Code Live Server(5500)로 직접 확인함
metadata:
  type: user
---

- 한국어로 대화한다. 답변과 화면 문구는 한국어, 코드 주석은 영어로 쓴다.
- 일하는 방식: 릴스나 스크린샷 같은 참고 이미지를 주고 기능을 하나씩 요청한다. 직접 확인한 뒤 "좋았어! 확인했어!"로 승인하고 다음 요청으로 넘어간다.
- 평소 VS Code Live Server(포트 5500)로 `index.html`을 연다. 다른 실행 경로에서만 확인한 수정은 Live Server에서 깨질 수 있다. 2026-11-19에 실제로 이 일이 있었다.
- 효과가 바로 보이는 것을 중요하게 여긴다. 예: 페이지를 열면 음악이 즉시 재생되는 것.
  - 정정 (2026-11-19): 이 요청 때문에 만든 자동 재생 런처 `play.command`를, 사용자가 무엇인지 들은 뒤 바로 지우게 했다. 즉시 재생보다 프로젝트를 단순하게 유지하는 쪽을 택했고, 첫 클릭에 음악이 나오는 것은 받아들였다. 우회용 스크립트나 별도 브라우저 실행 같은 것은 먼저 묻는다. [[feedback-lean-project]]

관련: [[feedback-web-only]], [[feedback-lean-project]], [[feedback-memory-location]]
