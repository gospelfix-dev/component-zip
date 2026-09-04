이 폴더의 메모리는 `SessionStart` 훅(`.claude/hooks/load-memory.sh`)이 세션 시작 시 전부 주입한다.
원문 출처는 `0007/README.md`(고품격대패 CLI 인계문서).

- [프로젝트 성격](gopumgyeok-landing-project.md) — 0007은 실클라이언트 납품용 랜딩 시안A_v2, 임의 재작성 금지
- [디자인 시스템](gopumgyeok-design-system.md) — 골드/레드 토큰(--bg-card는 흰색), Pretendard self-host+RixYeoljeongdo, 5섹션+히어로+문의 Bottom Sheet
- [shadcn 재설계 후 원복](gopumgyeok-shadcn-detour-reverted.md) — 2026-09-04 shadcn 전면 재설계했다가 같은 날 골드/레드로 되돌림, CLAUDE.md 등 문서는 아직 shadcn 기준(불일치 주의)
- [히어로 sticky 패럴랙스](gopumgyeok-hero-parallax.md) — 히어로 전체 고정, 그 여파로 생긴 z-index·웨이브 투과 함정(웨이브는 wave--from-profit 1개만 남음)
- [헤드리스 시각 검증법](gopumgyeok-headless-verification.md) — 브라우저 확장 없음, iframe 래퍼로 찍고 숫자로 재는 법
- [영수증 카드 구현 교훈](gopumgyeok-receipt-card.md) — 그림자는 wrapper에 drop-shadow, 절취선은 mask-image 스캘럽
- [브랜드 원본 데이터](gopumgyeok-brand-data.md) — 슬로건·메뉴 9종·셀프바 25종·3개 매장 매출/수익률·연락처
- [미해결 항목](gopumgyeok-open-issues.md) — 창업비용 금액 미확보, 시각검증 미완, Next.js+Supabase 마이그레이션 대기, 메뉴 png 20MB 미최적화
- [폰트 크기 규칙 예외 처리](feedback_font-size-rule-exception.md) — "18~96px 예외 없음" 규칙을 사용자가 깨려 할 때: 이력 확인→구체적 대안 제시→규칙 문서 자체 갱신
- ["모든 변경 파일 커밋"의 의미](feedback_commit-all-means-literal.md) — 문자 그대로 전부(디버그/스크래치 포함)이지 프로덕션 파일만 골라 커밋하는 게 아니다
