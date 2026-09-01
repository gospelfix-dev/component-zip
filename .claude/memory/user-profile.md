---
name: user-profile
description: 정적 HTML/CSS/JS 컴포넌트 데모를 번호 폴더로 쌓는 한국어 퍼블리셔 — 시안 재현 정확도를 중시
metadata: 
  node_type: memory
  type: user
  originSessionId: 9a65e34e-a16f-4843-ae49-fbf658a2f1c7
  modified: 2026-08-13T04:04:26.760Z
---

`component-zip` 저장소에 번호 폴더(`0001`, `0002`, …)로 독립 컴포넌트 데모를 하나씩 쌓는다.
빌드 도구 없는 순수 정적 파일(HTML/CSS/JS/JSON)을 일관되게 고수한다.

작업 요청 패턴이 반복된다: **디자인 시안 이미지 여러 장을 주고 "UX/UI 동일한 디자인"을
만들어 달라고 한다.** 텍스트·이미지는 JSON 으로 분리해 관리하기를 원한다.
인물 사진은 Gemini 로 직접 생성해 쓴다 (`0003/imgs/Gemini_Generated_Image_*.png`).

`.claude/` 하위에 rules·agents·hooks·memory 를 갖춘 구조를 직접 요청할 만큼
Claude Code 설정에 익숙하다. 작업 후 `/init`, 메모리 저장 같은 정리 단계를 챙긴다.

[[proceed-without-asking]] · [[portrait-licensing-constraint]]
