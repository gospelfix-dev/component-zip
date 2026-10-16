# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"연두"(yeondu) — 아직 실존 클라이언트가 확정되지 않은 플레이스홀더 뷰티샵 브랜딩
랜딩페이지. 단일 `index.html` + 빌드 도구 없는 순수 정적 파일(HTML/CSS/바닐라 ES6
JS)로만 구성된 1페이지 사이트다. npm, 번들러, 프레임워크가 전혀 없다 — 브라우저가
파일을 그대로 읽어 동작한다. 외부 CDN도 원칙적으로 쓰지 않지만, 2026-10-16 사용자
확정으로 애니메이션 라이브러리 motion.dev(Motion)만 `index.html`에 CDN(`<script>`
전역 빌드)으로 불러오는 단일 예외가 있다(`.claude/rules/01-project.md` 참고).

이 저장소는 `component-zip` 모노레포 안의 번호 폴더 하나(`0009`)다. 형제 폴더
(`0007`, `0007-B`, `0008`)는 업종·브랜드·콘텐츠 계약이 전혀 다른 독립 프로젝트이므로
참고하지 않는다 — 엔지니어링 패턴(파일 분리, fetch→render 구조, mock 폼, 1회성 스크롤
리빌 등)만 선례로 재사용 가능하다.

## Commands

빌드/린트/테스트 도구가 없다(`package.json`도 없음 — 빌드 단계 자체를 금지하는 프로젝트
규칙). 유일한 "명령"은 로컬 정적 서버 구동이다:

```bash
python3 -m http.server 8765
# http://localhost:8765/index.html
```

`index.html`을 `file://`로 직접 열면 `fetch('data/content.json')`이 CORS로 막혀
콘텐츠가 비어 보인다(안내 문구만 표시 — 정상 동작이다, 버그 아님). 반드시 위 로컬
서버로 확인한다.

자동화된 테스트가 없으므로 변경 검증은 브라우저 수동 확인(스크린샷 포함)으로 한다.
회귀 체크용 grep/검증 명령:

```bash
grep -n "#[0-9A-Fa-f]\{3,6\}" assets/css/style.css   # :root 선언부 외에 나오면 컬러 토큰 위반
grep -n "box-shadow\|border:" assets/css/*.css       # init.css 리셋 외에 나오면 위반
grep -n "infinite" assets/css/*.css                  # 이 프로젝트엔 승인된 무한반복 예외가 없음(빈 결과가 정상)
python3 -c "import json; json.load(open('data/content.json'))"  # JSON 문법 확인
```

## Architecture

### 문서 계층 — 어디서 무엇을 찾는가

세 층위가 서로 다른 역할을 맡는다. 겹치는 내용을 고칠 때는 어느 문서가 정본인지 먼저
확인할 것:

1. **`README.md`** — 브랜드 아이덴티티("왜 이렇게 보이는가": 브랜드명·컬러의 상징적
   의미, 톤앤보이스, "하지 않는 것"). 구현 수치는 담지 않는다.
2. **`docs/`**(`docs/DESIGN.md`가 목차) — 디자인 시스템 정본. 색상·타이포·간격·모서리·
   컴포넌트의 정확한 px/HEX 값. 수치가 다른 문서와 어긋나면 `docs/02~09`가 우선한다.
3. **`.claude/rules/01~04`** — 위 디자인 토큰을 실제 코드에 어떻게 반영하는지의 구현
   규칙과, 과거에 내린 결정·실수의 이력(예: 브랜드명·포인트 컬러 변경 사유). 에이전트가
   실제로 따라야 할 1차 레퍼런스다.
4. **`data/content.json`** + **`docs/10-data-contract.md`** — 실제 카피·수치의 단일
   진실 공급원과 그 스키마.

### 렌더링 파이프라인 (`assets/js/script.js`)

빌드가 없는 바닐라 JS라 전역 함수만으로 된 파일 하나에 전체 흐름이 들어있다:

```
DOMContentLoaded → boot()
  데이터 무관 인터랙션(스무스스크롤 / 모바일 nav / 스크롤스파이 / 챗봇 토글 /
  예약폼 제출)부터 먼저 연결
  → fetch('data/content.json') → renderAll(data)
      섹션별 render*(data) 함수가 fill(id, html)로 해당 컨테이너의
      innerHTML을 한 번만 교체
  → initMenuCategoryTabs(data), initScrollReveal('.reveal')
```

- `index.html`은 콘텐츠가 들어갈 자리마다 **빈 id 컨테이너**만 있는 뼈대다
  (`#menuList`, `#teamGrid`, `#reviewGrid`, `#priceTableBody` 등). 실제 텍스트는 전부
  JS가 `data/content.json`을 읽어 채운다 — 카피를 바꿀 땐 `index.html`이 아니라
  `data/content.json`을 고친다.
- id는 **`index.html` 마크업 ↔ `script.js`의 `getElementById`/`fill()` 대상 ↔
  `style.css` 셀렉터** 세 곳이 동기화돼야 한다. 하나라도 어긋나면 에러 없이 화면만
  조용히 비어 보인다.
- 예약/문의 폼은 **`#reservationForm` 하나만** 쓴다. 헤더·히어로·하단 고정 바의 모든
  CTA는 새 모달을 만들지 않고 이 폼으로 스크롤 + 포커스만 한다 — 과거에 중복 폼(FAB,
  모달, 하단바 전용 폼)을 만들었다가 전부 삭제하고 하나로 합친 선례가 있어 되살리지
  않는다.
- 챗봇(`#chatFab`/`#chatPanel`)은 정적 FAQ 트리아지다(`buildChatReply()`의 switch문) —
  실제 AI/백엔드 호출이 아니다. 답변 본문은 `data.pricing`/`data.contact`를 그 자리에서
  포맷해 만들고 `chatbot` 아래에 같은 값을 중복 저장하지 않는다.

### CSS 아키텍처 (`assets/css/`)

4개 파일로 역할이 고정 분리돼 있다 — 새 규칙을 `style.css`에 섞어 넣지 않는다:
`init.css`(리셋) → `fonts.css`(`@font-face`만) → `animations.css`(`@keyframes`만) →
`style.css`(`:root` 토큰 + 컴포넌트, 미디어쿼리는 해당 컴포넌트 블록 바로 뒤에 붙임).

색상은 `:root` 토큰 8개(`ink`/`gray`/`surface`/`surfaceHover`/`lime`/`limeHover`/
`tint`/`white`)만 쓴다. 포인트 컬러 `lime`(`#EFF382`)은 **배경 전용**이다 — 밝은 색이라
대비가 거의 없어서(흰 배경 위 약 1.1:1) 글자·아이콘색으로 쓰면 안 되고, `lime`/`tint`
배경 위 글자는 항상 `ink`다. 그 외: 그림자·테두리·그라데이션 없음(레이어 구분은 배경색
차이로만), 이탤릭·장식 폰트 없음(Noto Sans KR 단일), 승인된 무한 반복 애니메이션 없음,
반응형 분기점은 `max-width:1024px` 하나뿐.

폰트는 Noto Sans KR 5웨이트(400/500/700/800/900, 2026-10-16 800·900 추가)를
`assets/fonts/`에 self-host한다 — Google
Fonts 등 폰트 CDN에 의존하지 않는다. 아이콘도 CDN이 아니라 인라인 SVG로만 추가한다.

### 콘텐츠 모델

`data/content.json`이 브랜드·연락처·내비·히어로·메뉴·전후사진·팀·후기·가격·챗봇·푸터를
전부 담은 단일 JSON이다(스키마는 `docs/10-data-contract.md`). 실사진이 전무하므로
**`image` 필드를 의도적으로 두지 않는다** — JS가 필드 부재를 기준으로 `tint`/`surface`
색상 블록 placeholder를 렌더링한다(스톡 사진 라이선스 문제 회피). 실사진이 생기면
`image` 필드를 추가하고 해당 render 함수에 분기를 넣는다.
