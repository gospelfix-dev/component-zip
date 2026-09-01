---
name: portrait-licensing-constraint
description: 명함 제품에 스톡 인물 사진을 쓰면 라이선스 위반 — AI 생성이 오히려 안전한 이유
metadata: 
  node_type: memory
  type: project
  originSessionId: 9a65e34e-a16f-4843-ae49-fbf658a2f1c7
  modified: 2026-08-13T04:04:37.844Z
---

`0004` 명함 컴포넌트의 인물 사진 조달 제약. 코드에는 드러나지 않는다.

대부분의 스톡 사진 라이선스는 **모델이 실제 그 사람인 것처럼 표현하는 것**을 금지한다
(sensitive/defamatory use 조항). 지금처럼 데모·템플릿이면 문제없지만,
실서비스에서 사용자 명함에 스톡 모델 얼굴이 들어가면 위반이다.

**Why:** 명함은 본질적으로 특정 실존 인물의 신원을 나타내는 매체라,
스톡 모델 사용이 라이선스가 금지하는 표현에 정확히 해당한다.

**How to apply:** 명함용 인물은 AI 생성을 기본으로 한다 — 실존 인물이 아니므로 이 조항을
피해 간다. 제3자 클레임 **면책**까지 필요하면 Adobe Firefly 또는 Getty 의 AI 생성기를 쓴다
(라이선스된 데이터로만 학습해 면책을 제공). Midjourney·Gemini 는 생성물의 상업 이용을
약관으로 허용할 뿐 면책은 없다. 한국인 실사가 꼭 필요하면 크라우드픽·이미지투데이 등
국내 스톡이 물량이 낫지만, 위 조항은 그대로 적용된다.

[[user-profile]]
