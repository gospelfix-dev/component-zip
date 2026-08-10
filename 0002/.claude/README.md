# .claude — 이 프로젝트의 검증 장치

테스트 프레임워크도 git 도 없는 정적 페이지라, **스크린샷과 DOM 실측이 사실상 테스트** 역할을 한다.
CSS 한 줄을 고치면 다른 곳이 조용히 깨지므로, 수정 후에는 아래를 돌린다.

## 구성

```
.claude/
├── rules/                  이 프로젝트를 다룰 때 지켜야 할 것
│   ├── project.md          스택·구조·데이터 흐름·알려진 이슈·컨벤션
│   ├── layout.md           HISTORY 레이아웃 수치 사슬과 위험 지점
│   └── fonts.md            폰트 자산 규칙과 재생성 절차
├── memory/                 왜 지금 이 상태인지 (결정과 근거)
│   ├── MEMORY.md           인덱스
│   └── *.md                사실 하나당 파일 하나
├── agents/
│   ├── layout-measure.md   실측 → 규칙 위반 검출 (읽기 전용, haiku)
│   └── visual-check.md     스크린샷 → 눈으로 판정 (읽기 전용, opus)
└── hooks/
    ├── measure.sh          실측 + 규칙 검사 → JSON (위반 시 exit 1)
    └── shot.sh             뷰포트별 스크린샷 → hooks/out/
```

`rules/` 와 `memory/` 는 역할이 다르다. **규칙을 찾으면 `rules/`, 이유를 찾으면 `memory/`** 다.
예를 들어 "폰트를 CDN 으로 바꾸지 말 것"은 `rules/fonts.md`, "왜 CSS 로는 못 풀었는지"는
`memory/montserrat-outline-decision.md` 에 있다.

`measure.sh` 는 계측용 iframe 페이지와 규칙 정의를 스스로 만들어 쓰고 끝나면 지운다.
따라서 파일은 `.sh` 두 개뿐이고, 의존성은 `python3` 와 Chrome 뿐이다.
Chrome 경로가 다르면 `CHROME` 환경변수로 지정한다.

## 사용

```bash
.claude/hooks/measure.sh                    # 전 뷰포트 검사
.claude/hooks/measure.sh 1440x828           # 특정 뷰포트
.claude/hooks/shot.sh                       # 전 뷰포트 캡처 → .claude/hooks/out/
SCALE=3 .claude/hooks/shot.sh 1920x1080     # 아웃라인 확대 확인
```

## 권장 순서

```
CSS/JS 수정
  → measure.sh (빠르고 쌈. 여기서 깨지면 스크린샷 볼 필요 없음)
  → 통과하면 shot.sh + 눈으로 판정
```

## 검사하는 규칙

`measure.sh` 상단 `INVARIANTS` 블록에 있다. 전부 이 프로젝트에서 실제로 났던 사고에서 나왔다.

| 규칙 | 막으려는 사고 |
|---|---|
| `text_fits_slide_height` | `font-size` 고정값 → 낮은 화면에서 위아래 슬라이드와 겹침 |
| `text_fits_slide_width` | 긴 월 이름이 가운데 구분선 침범 |
| `single_line` | 연도가 줄바꿈되어 아래 항목과 겹침 |
| `no_left_clipping` | 슬라이드 폭 변경 → 텍스트가 화면 왼쪽으로 밀려 잘림 |
| `activetxt_visible` | `overflow:hidden` 추가 → 우측 큰 제목이 잘려 사라짐 |
| `active_slide_filled` | 활성 슬라이드가 흰색으로 안 채워짐 |
| `no_horizontal_overflow` | 가로 스크롤 발생 |
| `breakpoint_layout` | 1080px 기준 PC/모바일 전환 실패 |

## 설계 의도

- **측정과 수정을 분리한다.** 두 에이전트 모두 `tools: Bash, Read` 만 갖는다(읽기 전용).
  재는 쪽이 고치기 시작하면 "측정값에 맞춰 고친 것"과 "고쳐서 좋아진 것"을 구분할 수 없다.
- **판정은 에이전트, 실행은 스크립트.** 매번 Chrome 옵션을 재발명하면 결과가 흔들린다.
- **수치 우선.** "글자가 깨져 보인다"로는 못 고쳤고, `82.8px 칸에 178px 텍스트`가 나온 뒤에야
  원인이 확정됐다.

## 함정 두 가지 (이미 스크립트에 반영됨)

1. **폰트 로드 대기.** `document.fonts.status === 'loaded'` 전에 재면 폭이 틀리게 나온다.
2. **헤드리스 창 크기를 믿지 말 것.** `--window-size` 는 최소 창 크기(약 500px)와 창 장식 때문에
   그대로 적용되지 않는다(`430x932` 요청 → `500x845`). 측정 뷰포트는 계측 페이지가
   iframe 크기로 못박는다. 이걸 놓치면 **그럴듯하지만 틀린 값**이 조용히 나온다.

## 규칙을 고쳐야 할 때

레이아웃 구조를 의도적으로 바꿨다면(칸 개수, 슬라이드 폭 비율 등) `INVARIANTS` 도 함께 고친다.
단, **에이전트가 아니라 사람이 판단해서** 고친다. 통과시키려고 느슨하게 만드는 건
회귀를 덮는 것과 같다.

## 참고

에이전트는 `.claude/hooks/` 를 자동으로 발견하지 않는다. `agents/*.md` 본문에 경로가
적혀 있어서 쓰는 것이다. 스크립트를 옮기면 그 md 도 함께 고쳐야 한다.
