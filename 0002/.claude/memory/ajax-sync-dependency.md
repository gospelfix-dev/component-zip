---
name: ajax-sync-dependency
description: js/ajax.js 의 async:false 는 폐기 예정 옵션이지만 Swiper 초기화 순서가 여기 의존한다
metadata:
  type: project
---

`js/ajax.js` 의 `$.ajax({ ..., async: false })` 는 브라우저가 경고하는 폐기 예정 옵션이지만
**함부로 비동기로 바꾸면 안 된다.**

**Why:** 동기 요청이라서 `processData()` 의 DOM 삽입이 끝난 뒤에야 `new Swiper()` 가 실행된다.
Swiper 는 초기화 시점의 슬라이드 개수를 기준으로 loop 복제본과 레이아웃을 만들기 때문에,
비동기로 바꾸면 슬라이드가 0개인 상태에서 초기화되어 **PC 목록과 이미지가 전부 사라진다.**
`async: false` 경고를 보고 "현대적으로 고치는" 리팩터링이 곧바로 페이지를 깨뜨리는 구조다.

**How to apply:** 비동기로 전환하려면 옵션만 바꾸는 것으로는 안 되고, `new Swiper()` 세 개와
이들을 서로 연결하는 클릭 핸들러(`subThumbs`/`historySwiperPc` 를 참조하는 부분)를 전부
`.done()` 콜백 안으로 옮겨야 한다. 그 작업을 하지 않을 거면 `async: false` 를 그대로 둔다.

관련: [[project-overview]]
