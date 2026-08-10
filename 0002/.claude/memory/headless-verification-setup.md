---
name: headless-verification-setup
description: 테스트가 없는 프로젝트라 헤드리스 Chrome 실측이 테스트 역할을 한다 — 창 크기와 폰트 로드 함정 포함
metadata:
  type: project
---

테스트 프레임워크도 git 도 없어서, **헤드리스 Chrome 의 DOM 실측과 스크린샷이 사실상 테스트**다.
`.claude/hooks/measure.sh` (규칙 검사) 와 `.claude/hooks/shot.sh` (캡처) 로 정리해뒀고,
읽기 전용 서브에이전트 `layout-measure` / `visual-check` 가 이를 호출한다.

**Why:** CSS 한 줄을 고치면 다른 곳이 조용히 깨진다. 실제로 슬라이드 폭을 `100%` 로 바꿨더니
텍스트가 화면 왼쪽으로 잘렸고, 썸네일에 `overflow:hidden` 을 줬더니 우측 큰 제목이 사라졌다.
둘 다 수치나 스크린샷 없이는 발견하지 못했을 회귀다.
또한 "글자가 깨져 보인다"는 서술만으로는 원인을 못 찾았고,
`82.8px 칸에 178px 텍스트` 라는 수치가 나온 뒤에야 확정됐다.

**How to apply:** CSS/JS/폰트를 수정하면 `measure.sh` 를 먼저 돌리고(빠르고 쌈),
통과하면 `shot.sh` 로 눈으로 본다. 다음 두 함정은 이미 스크립트에 반영돼 있으니
직접 Chrome 명령을 새로 쓸 때만 주의하면 된다:

1. **폰트 로드 대기** — `document.fonts.status === 'loaded'` 전에 재면 글자 폭이 틀리게 나온다.
2. **헤드리스 창 크기를 믿지 말 것** — `--window-size` 는 최소 창 크기(약 500px)와 창 장식 때문에
   그대로 적용되지 않는다(`430x932` 요청 → 실제 `500x845`). 그래서 계측 페이지가 iframe 크기로
   뷰포트를 못박는다. 이걸 놓치면 **그럴듯하지만 틀린 값**이 조용히 나온다.

덧붙여 `python3 - <<'PY'` 형태는 heredoc 이 stdin 을 점유해 파이프 입력을 못 읽는다.
파이프로 데이터를 넘길 때는 `python3 -c` 나 별도 파일을 쓴다.

관련: [[layout-size-constraints]], [[montserrat-outline-decision]]
