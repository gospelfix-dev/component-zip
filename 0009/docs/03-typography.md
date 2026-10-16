# 03. 타이포그래피

`DESIGN.md` "3. 타이포그래피" 섹션에서 옮겨왔습니다.

폰트는 Noto Sans KR 하나만 씁니다 (400 / 500 / 700 / 800 / 900). 장식 폰트는 쓰지 않습니다.

| 스타일 | 크기 / 행간 | 굵기 | 용도 |
| --- | --- | --- | --- |
| H1 | 32 / 40 | 700 | 히어로 헤드라인 |
| H2 | 22 / 30 | 700 | 섹션 제목 |
| Body | 16 / 26 (모바일 15 / 24 허용) | 400 | 본문 |
| Button | 15 / 24 | 500 | 버튼 라벨 |
| Caption | 13 / 20 | 500 (보조 설명은 400) | 태그, 메타, 보조 설명 |

폰트 로딩은 `next/font/google`의 `Noto_Sans_KR`(weight 400, 500, 700)을 씁니다
([09-shadcn-tokens.md](09-shadcn-tokens.md) 참고).

**예외(2026-10-16, 사용자 확정)**: 히어로 `<h1>`과 히어로 설명 `<p>`만 표를 넘겨 확대했다
(`assets/css/style.css` `.hero-content h1`/`.hero-content p`). 히어로 헤드라인의 시각적
임팩트를 키워달라는 요청에 따른 의도적 예외이며, H2 이하 다른 헤딩이나 다른 섹션의
Body 텍스트에는 적용하지 않는다 — 새 헤딩/본문에 이 값을 그대로 가져오지 않는다.
- `.hero-content h1`: `clamp(28px, 6.5vw, 44px)` / line-height 52px (표의 H1 32/40 대신)
- `.hero-content p`: `clamp(16px, 3.2vw, 18px)` / line-height 28px (표의 Body 16/26 대신)

**예외(2026-10-16, 사용자 확정)**: 웨이트 스케일을 400/500/700에서 800(ExtraBold)/900(Black)
까지 확장했다(`assets/fonts/NotoSansKR-ExtraBold.woff2`, `NotoSansKR-Black.woff2`,
`assets/css/fonts.css`에 `@font-face` 추가). 기존 3웨이트와 동일한 글리프 커버리지로
서브셋했다(Noto Sans KR 가변폰트를 `fonttools`로 800/900 인스턴스화 후 서브셋). 아직
H1/H2/Button/Caption 등 표의 굵기 지정에는 적용하지 않은 상태이며, 800/900을 실제로 쓸
컴포넌트가 생기면 이 표에 용도를 추가한다.
