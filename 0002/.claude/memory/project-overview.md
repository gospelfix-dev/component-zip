---
name: project-overview
description: HISTORY 무한 롤링 슬라이더 — 빌드 없는 정적 페이지, 데이터는 외부 URL 의존
metadata:
  type: project
---

`/Users/mac/Downloads/0002` 는 HISTORY 타임라인 무한 롤링 슬라이더다.
jQuery 1.12.3 + Swiper 8.4.7 을 로컬 번들로 쓰는 정적 페이지이며, 빌드 도구도
패키지 매니저도 git 저장소도 없다.

슬라이드 데이터와 썸네일 이미지는 로컬이 아니라 외부 URL
(`younhoso.github.io/younhoso/blogExample/infinite_rolling/ex2/`)에서 가져온다.
`data/history.json` 과 `imgs/` 는 같은 내용의 로컬 사본이지만 **어디서도 참조되지 않는다.**

**Why:** 네트워크가 없으면 슬라이드가 비어 페이지가 사실상 깨진다. "왜 아무것도 안 보이지"의
1순위 원인이 코드가 아니라 네트워크일 수 있다는 뜻이다. 로컬 사본이 있다는 사실 때문에
오프라인에서도 동작할 거라 착각하기 쉽다.

**How to apply:** 페이지가 비어 보이면 CSS/JS 를 뜯기 전에 먼저 외부 요청 성공 여부를 확인한다.
로컬 자산으로 전환하려면 `js/index.js:76` 의 URL 과 JSON 안의 `thumb` 경로를 **함께** 바꿔야 한다.
`file://` 로 열면 ES module 이 CORS 로 차단되므로 반드시 `python3 -m http.server` 로 띄운다.

관련: [[ajax-sync-dependency]], [[headless-verification-setup]]
