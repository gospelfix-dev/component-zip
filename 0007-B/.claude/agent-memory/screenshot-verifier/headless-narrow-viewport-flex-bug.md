---
name: headless-narrow-viewport-flex-bug
description: "헤드리스 Chrome(이 환경, v152.x)에서 좁은 뷰포트(~450px 미만)의 percentage/auto 폭 flex 컨테이너가 자식 요소를 화면 밖으로 잘못 배치하는 렌더링 버그"
metadata:
  type: project
---

2026-09-07, 0007-B 모바일 헤더의 `.nav-toggle`(햄버거 버튼)이 `--window-size=390,...` 헤드리스
스크린샷에서 완전히 안 보이는 문제를 조사했다. CSS(`position:fixed;left:0;right:0;display:flex;
justify-content:space-between`)는 지극히 표준적인 패턴이었고, `display:flex !important;
background:red !important; width/height:50px !important`로 강제해도 여전히 안 보였다.

**격리 테스트로 확인한 사실**:
- 완전히 독립된 최소 HTML(`position:fixed;left:0;right:0;display:flex;justify-content:
  space-between`, 자식 2개)로 재현됨 — 실제 사이트 코드와 무관, 순수 브라우저(도구) 버그.
- 컨테이너 폭이 **리터럴 px 값**(`width:390px` 등)이면 정상 렌더링됨.
- 컨테이너 폭이 **`%`/`vw`/`calc(100%...)`/암묵적 auto**(즉 `position:fixed;left:0;right:0`로
  뷰포트에 맞춰지는 경우 포함)면, **뷰포트 폭이 약 450~460px 미만일 때만** 두 번째 flex
  자식이 완전히 사라짐(반씩 걸치는 것도 아니고 0개 픽셀도 안 그려짐).
- 자식 콘텐츠 길이는 무관("A" 한 글자로 줄여도 동일하게 재현됨) — 순수하게 "좁은 뷰포트 +
  percentage/auto 폭 flex 컨테이너" 조합의 문제.
- `--headless=new`와 레거시 `--headless` 둘 다 동일하게 재현됨.
- `justify-content:space-between` 대신 `margin-left:auto` 기법으로 바꿔도 동일하게 재현됨
  (justify-content 자체의 문제가 아니라 percentage-width 플렉스 폭 계산 전반의 문제로 보임).

**결론 및 대응**: 이건 실사용 브라우저(Chrome/Safari/Firefox 안정 버전)에서는 절대 나타나지
않을 것으로 판단되는, 이 샌드박스의 특정 헤드리스 Chrome 빌드(버전 152.0.7977.76, 비정상적으로
높은 버전 번호 — 아마 이 환경 전용/실험 빌드)의 결함이다. `display:flex;justify-content:
space-between` + 퍼센트/auto 폭 컨테이너는 웹에서 가장 흔한 반응형 헤더 패턴이라, 실제로
깨져 있다면 훨씬 광범위하게 알려졌을 것이다.

**How to apply**: 모바일 뷰포트(특히 360~440px 폭)에서 헤더/내비게이션의 우측 정렬 요소
(햄버거 버튼, 우측 CTA 등)가 헤드리스 스크린샷에 전혀 안 보이면, 먼저 이 문제를 의심할 것.
확인 방법: 같은 요소를 **1000px 이상 폭**으로 스크린샷했을 때 정상적으로 보이면(이 프로젝트
0007-B의 나브 토글이 실제로 그랬다), CSS 버그가 아니라 이 헤드리스 렌더링 결함일 가능성이
매우 높다 — 실제 CSS를 억지로 리터럴 px 폭으로 바꾸는 등 "고치려" 하지 말 것(반응형이 깨짐).
대신 이 사실을 보고하고, 가능하면 [[gopumgyeok-headless-verification]] 방법론대로 데스크톱
폭(≥1024px) 스크린샷과 코드 리뷰로 검증을 대체한다. 진짜 실기기/실브라우저 검증이 필요하면
claude-in-chrome 확장(연결되어 있다면) 또는 사용자에게 직접 확인을 요청한다.
