# MEMORY

이 프로젝트에서 얻은 사실과 내려진 결정. **왜 지금 이 상태인지**를 남긴다.
(지켜야 할 규칙과 컨벤션은 [`../rules/`](../rules/) 쪽이다.)

- [프로젝트 개요](project-overview.md) — 빌드 없는 정적 페이지, 데이터는 외부 URL 의존이라 오프라인에서 깨진다
- [ajax 동기 요청 의존성](ajax-sync-dependency.md) — `async:false` 를 비동기로 바꾸면 슬라이드가 전부 사라진다
- [Montserrat 아웃라인 결정](montserrat-outline-decision.md) — CDN 대신 겹침 병합 로컬 서브셋을 쓰는 이유
- [레이아웃 크기 제약](layout-size-constraints.md) — `min(61px, 7vh, 3.3vw)` 세 항이 각각 막는 사고
- [헤드리스 검증 장치](headless-verification-setup.md) — 실측이 테스트 역할, 창 크기·폰트 로드 함정
