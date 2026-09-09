이 폴더의 메모리는 `SessionStart` 훅(`.claude/hooks/load-memory.sh`)이 세션 시작 시 전부 주입한다.
0007-B는 0007(시안A)과 콘텐츠 계약은 같지만 팔레트 축이 다른 독립 시안(시안B — 카탈로그 라이트 / Ivory & Bronze Catalogue, 2026-09-07 실제 브랜드 카탈로그·레퍼런스 조사 기반 재설계).
정본은 `CLAUDE.md`/`docs/design.md`. 아래는 0007-B에도 유효한 사실/방법론 메모리만 남긴 것이고,
A 전용 시각 구현 디테일(골드/레드 토큰, RixYeoljeongdo, 영수증 스캘럽, 히어로 sticky 패럴랙스 등)은
`archive/`로 격리해 미래 세션이 확정 규칙으로 오인하지 않게 했다.

- [프로젝트 성격](gopumgyeok-landing-project.md) — 고품격대패는 실클라이언트 납품용 랜딩(0007=시안A, 0007-B=시안B), 임의 재작성 금지
- [B안 카탈로그 라이트 재설계](gopumgyeok-b-catalogue-redesign.md) — 2026-09-07, "고품격저널"(근거 없는 창작) → "카탈로그 라이트"(실제 카탈로그/레퍼런스 조사 기반)로 전면 재설계된 경위와 확정 팔레트
- [CSS 주석 `*/` 조기 종료 함정](feedback_css-comment-slash-star-trap.md) — `.a-*/.b-*` 식 표기는 주석을 조기 종료시켜 뒤 규칙을 조용히 삭제한다
- [헤드리스 시각 검증법](gopumgyeok-headless-verification.md) — 브라우저 확장 없음; 포트 8765 재사용 전 kill 필수; 정적 섹션은 해시+큰 window-size 우선, 안 되면 iframe 폴백
- [브랜드 원본 데이터](gopumgyeok-brand-data.md) — 슬로건·메뉴 9종·셀프바 25종·3개 매장 매출/수익률·연락처 (A/B 공통 사실)
- [폰트 크기 규칙 예외 처리](feedback_font-size-rule-exception.md) — 확정 규칙을 사용자가 깨려 할 때: 이력 확인→구체적 대안 제시→규칙 문서 자체 갱신 (절차 자체가 유효, 0007-B는 12~120px로 별도 확정)
- ["모든 변경 파일 커밋"의 의미](feedback_commit-all-means-literal.md) — 문자 그대로 전부(디버그/스크래치 포함)이지 프로덕션 파일만 골라 커밋하는 게 아니다
- [design.md 전체 동기화](feedback_design-doc-full-sync.md) — 같은 값이 토큰블록·표·prose·컴포넌트 절 등 여러 곳에 중복 기술돼 있어, 값 변경 시 옛 값을 grep으로 전체 검색해 모든 위치를 고쳐야 한다
- [drop-shadow + overflow:hidden 클리핑 함정](feedback_dropshadow-overflow-clip-trap.md) — Swiper 등 overflow:hidden 컨테이너 안에서 filter:drop-shadow 쓰면 그림자가 사각형으로 잘려 보인다

`archive/`(A 전용, 참고만 — B의 규칙으로 인용 금지): 디자인 시스템(골드/레드), shadcn 재설계 원복 경위,
히어로 sticky 패럴랙스, 영수증 카드 구현, 2026-09-01 시점 미해결 이슈 목록.
