# 폰트 자산 규칙

```
fonts/
  montserrat-400.woff2   각 약 18KB
  montserrat-500.woff2
  montserrat-600.woff2
  montserrat-700.woff2
  OFL.txt                SIL Open Font License 1.1
```

`css/reset.css` 상단 `@font-face` 4개로 등록되고, 본문 폰트는
`'Montserrat', 'Noto Sans KR', sans-serif` 다.

## 왜 CDN 이 아니라 로컬 파일인가

**Google Fonts 배포본을 그대로 쓰면 아웃라인 글자가 깨져 보인다.**

Montserrat 은 글리프가 획별로 **겹친 컨투어(overlapping contours)** 로 되어 있다.
비활성 월 이름은 `color: transparent` + `-webkit-text-stroke` 로 그리는데, stroke 는
바깥 윤곽선뿐 아니라 **획이 만나는 안쪽 경계선까지** 그린다. 그래서 `A`, `P`, `R`, `E`,
`B`, `F` 안에 없어야 할 선이 보인다.

fontTools 로 확인한 겹침 (700 기준, 컨투어 수 변화):

```
R: 3 → 2    E: 2 → 1    B: 2 → 3    F: 2 → 1
```

그래서 **겹침을 병합한 파일을 만들어 프로젝트에 넣었다.** CSS 로는 해결되지 않는다
(시도한 우회책과 실패 이유는 [`layout.md`](./layout.md) 참조).

## 하지 말 것

- `fonts/*.woff2` 를 Google Fonts CDN(`fonts.googleapis.com/css2?family=Montserrat`)으로
  되돌리는 것 → 아웃라인 겹침선이 즉시 재발한다
- 원본 Montserrat 배포본으로 교체하는 것 → 같은 이유
- weight 를 줄이는 것 → 400·500·600·700 이 모두 실제로 쓰인다
  (본문 400 / 모바일 bullet 500 / `.activetxt .year` 600 / 제목·월 이름 700)

## 서브셋 범위

`U+0020–U+007E` (기본 라틴)만 들어 있다. 페이지에 쓰이는 문자가 영문 대문자·숫자뿐이라
이 범위로 충분하고, 덕분에 파일이 각 18KB 다.

**한글은 이 폰트에 없다.** `'Noto Sans KR'` 로 넘어가는데 웹폰트로 로드하지 않으므로
결국 사용자 시스템 폰트에 의존한다. 한글 텍스트를 추가할 계획이면 이 부분을 먼저 정해야 한다.

## 재생성 절차

폰트를 다시 만들어야 할 때(weight 추가, 서브셋 범위 변경 등)의 전체 절차다.

```bash
# 1. 도구 설치 (프로젝트 밖 임시 가상환경에서)
python3 -m venv /tmp/fontvenv
/tmp/fontvenv/bin/pip install "fonttools[woff]" skia-pathops

# 2. 가변 폰트 원본 내려받기
curl -L -o "/tmp/Montserrat[wght].ttf" \
  "https://github.com/google/fonts/raw/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf"
```

```python
# 3. weight 별로 인스턴스 → 겹침 병합 → 서브셋 → woff2
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.ttLib.removeOverlaps import removeOverlaps
from fontTools.subset import Subsetter, Options

for w in [400, 500, 600, 700]:
    f = TTFont("/tmp/Montserrat[wght].ttf")
    instancer.instantiateVariableFont(f, {"wght": w}, inplace=True, updateFontNames=True)
    removeOverlaps(f)                      # ← 이 한 줄이 핵심

    opts = Options()
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    sub = Subsetter(options=opts)
    sub.populate(unicodes=list(range(0x20, 0x7F)))
    sub.subset(f)

    f.flavor = "woff2"
    f.save("fonts/montserrat-%d.woff2" % w)
```

```bash
# 4. 검증 — 아웃라인 안쪽에 선이 없는지 확대해서 확인
SCALE=3 .claude/hooks/shot.sh 1920x1080
```

`removeOverlaps` 에는 `skia-pathops` 가 필요하다. 없으면 조용히 실패하지 않고 import 에러가 난다.

## 라이선스

Montserrat 은 SIL OFL 1.1 이라 **수정·재배포·임베딩이 모두 허용**된다.
서브셋과 컨투어 병합도 허용 범위 안이다. 라이선스 원문을 `fonts/OFL.txt` 에 함께 둔다.
이 파일을 지우면 안 된다.

## 폰트를 바꾸면 레이아웃도 다시 재야 한다

글자 폭이 달라지면 슬라이드 폭을 넘길 수 있다. Montserrat 은 이전 폰트보다 약 9% 넓어
`font-size` 의 `vw` 상한을 `3.55vw → 3.3vw` 로 내려야 했다.

```bash
.claude/hooks/measure.sh    # text_fits_slide_width 위반이 없어야 한다
```
