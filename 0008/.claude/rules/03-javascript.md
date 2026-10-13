# JavaScript 규칙

## 문법 수준

**ES6 문법으로 작성한다.** `var`/IIFE/ES5 강제는 하지 않는다.

- `const`/`let`을 쓴다
- 화살표 함수, 템플릿 리터럴을 쓴다
- 모듈 시스템(`import`/`type="module"`)은 쓰지 않는다 — 파일 하나에 전역 함수로 둔다

`fetch`와 `Promise`로 `data/content.json`을 읽는다.

## 구조

```
DOMContentLoaded
 └─ boot()  데이터 무관 인터랙션 먼저 붙임 →
      fetch → renderAll() 로 10개 섹션 렌더 →
      DOM 에 올라온 뒤에만 관찰 가능한 리빌/카운트업 함수들을 붙임
 ├─ initSmoothScroll()     [data-target] 클릭 스크롤 + 모바일 nav 닫기
 ├─ initMobileNav()        햄버거 토글
 ├─ initScrollSpy()        헤더 .is-scrolled 토글
 ├─ initInquiryForm()      인라인 폼(#inquiryForm) mock 제출
 ├─ initStickyInquiryBar() 데스크톱 하단 고정 바(#stickyForm) mock 제출
 ├─ initInquiryFab()       모바일 FAB → 모달 오픈/닫기 + 모달 폼 mock 제출
 ├─ renderProcess / renderTrustStats / renderEquipment
 ├─ renderMenu(+initMenuTabs) / renderProfitCards
 ├─ renderCost(+initCostTierToggle — 탭 전환 시 합계 재계산)
 ├─ renderStores(+initStoreFilter, +initStoreSwiper — 지역 필터 변경 시 Swiper
 │                         destroy(true,true) 후 재생성)
 ├─ renderContact / initCountdown()  inquiry.deadlineDate 기준 실제 Date 계산
 ├─ initScrollReveal(sel)  공용 1회성 스크롤 리빌 유틸(IntersectionObserver, threshold 0.15)
 └─ initCountUp(sel)       공용 1회성 카운트업 유틸(threshold 0.4) — 신뢰지표/매출 숫자
```

## 렌더링

- 텍스트는 `esc()`로 이스케이프해서 넣는다. `desc`류 필드만 `<b>` 같은 인라인 태그를
  허용해 HTML로 삽입한다.
- 각 렌더 함수는 `fill(id, html)` 유틸로 대상 컨테이너의 `innerHTML`을 **한 번만** 교체한다
  (여러 항목을 문자열 배열로 모아 `join('')`한 뒤 한 번에 삽입 — 항목마다 개별
  `appendChild`를 반복하지 않는다).
- 테이블 행(`<tr>`)처럼 컨텍스트에 민감한 마크업은 반드시 실제 `<tbody>`/`<tfoot>` 요소에
  직접 `innerHTML`을 설정한다(중간에 `<div>` 래퍼를 거치면 `<tr>`이 파싱 과정에서 버려진다).

## 오류 처리

`fetch` 실패는 정상 경로다(주로 `file://`로 연 경우). 해당 자리에 이유를 문구로 보여준다
(`showFetchError()`). `FALLBACK` 사본을 JS에 두지 않는다 — `data/content.json`을 고쳐도
화면이 안 바뀌는 함정이 생긴다.

## 절제된 인터랙션 원칙

무한 반복 attention 애니메이션, 스크롤로 섹션을 드나들 때마다 반복 재생되는 리빌,
자동으로 튀어나오는 모달을 만들지 않는다(모바일 FAB→모달은 사용자가 FAB를 클릭해야만
열린다 — 자동 오픈 없음). 스크롤 리빌/카운트업은 `IntersectionObserver`로 진입 시 1회만
클래스를 붙이거나 애니메이션을 실행하고, 반드시 `unobserve`한다.

창업문의 카운트다운(`initCountdown`)은 `inquiry.deadlineDate`를 실제 `Date` 객체로 계산한
D-day 텍스트를 1분마다 갱신하는 것이다 — 가짜 할인 타이머(허위 긴급성 연출)를 만들지 않는다.
