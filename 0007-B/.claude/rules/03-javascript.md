# JavaScript 규칙

## 문법 수준

**ES6 문법으로 작성한다** (A안 `0007`과 동일 스타일 계승). `var`/IIFE/ES5 강제는 하지 않는다.

- `const`/`let`을 쓴다
- 화살표 함수, 템플릿 리터럴을 쓴다
- 모듈 시스템(`import`/`type="module"`)은 쓰지 않는다 — 파일 하나에 전역 함수로 둔다

`fetch`와 `Promise`로 `data/content.json`을 읽는다.

## 구조

```
DOMContentLoaded
 └─ boot()  데이터 무관 인터랙션 먼저 붙임 →
      fetch → renderAll() 로 8개 영역 렌더 →
      DOM 에 올라온 뒤에만 관찰 가능한 리빌 함수들과 initStoreSwiper() 를 붙임
 ├─ initSmoothScroll()
 ├─ initMobileNav()
 ├─ initScrollSpy()
 ├─ initInquiryForm()      05 인라인 폼 mock 제출
 ├─ initInquirySheet()     [data-open-inquiry] 클릭으로만 열림 — A와 달리 자동 오픈 없음
 ├─ initScrollReveal(sel)  01/02/03/04 공용 1회성 스크롤 리빌 유틸. 03 수익분석 행에서는
 │                         같은 콜백 안에서 animateCount() 로 매출 숫자 카운트업도 시작한다
 └─ initStoreSwiper()      05 Swiper 캐러셀 + syncCaption()
```

## 렌더링

- 텍스트는 `textContent`로 넣는다. `desc`류 필드만 `<b>` 같은 인라인 태그를 허용해 HTML로
  삽입하고, 그 외 필드는 이스케이프한다.
- DOM 삽입은 `DocumentFragment`에 모아 렌더 함수당 한 번만 수행한다.

## 오류 처리

`fetch` 실패는 정상 경로다(주로 `file://`로 연 경우). 해당 자리에 이유를 문구로 보여준다.
`FALLBACK` 사본을 JS에 두지 않는다 — `data/content.json`을 고쳐도 화면이 안 바뀌는 함정이
생긴다.

## 절제된 인터랙션 원칙

무한 반복 attention 애니메이션, 스크롤로 섹션을 드나들 때마다 반복 재생되는 리빌,
자동으로 튀어나오는 모달을 만들지 않는다. 스크롤 리빌은 `IntersectionObserver`로 진입
시 1회만 클래스를 붙이고, 필요하면 `unobserve`한다.
