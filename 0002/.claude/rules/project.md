# 프로젝트 정의

HISTORY 타임라인 무한 롤링 슬라이더. 빌드 도구 없는 순수 정적 페이지다.

## 스택

| | |
|---|---|
| 라이브러리 | jQuery **1.12.3**, Swiper **8.4.7** (둘 다 로컬 번들, CDN 아님) |
| 모듈 | `js/index.js` 만 `type="module"`, 나머지는 전역 스크립트 |
| 빌드 | 없음. 트랜스파일·번들·전처리기 전부 없음 |
| 패키지 매니저 | 없음 (`package.json` 없음) |
| 버전 관리 | git 저장소 아님 |

## 구조

```
index.html              PC/모바일 마크업이 한 파일에 공존
css/
  reset.css             리셋 + @font-face(Montserrat 4종)
  swiper.css            Swiper 8.4.7 번들 CSS
  index.css             HISTORY 섹션 전체 스타일
js/
  jquery.js  swiper.js  라이브러리 번들
  ajax.js               $.ajax 래퍼 (fetchData)
  index.js              템플릿 생성 + Swiper 3개 초기화
fonts/                  Montserrat 서브셋 (→ rules/fonts.md)
data/history.json       ⚠️ 미사용 (아래 참조)
imgs/                   ⚠️ 미사용 (아래 참조)
```

## 실행

```bash
python3 -m http.server 8000
# → http://localhost:8000/index.html
```

**`file://` 로 직접 열면 동작하지 않는다.** `js/index.js` 가 ES module 이라 CORS 로 차단된다.
반드시 HTTP 서버로 띄운다.

## 데이터 흐름

```
js/index.js
  └ fetchData(외부 URL) ──→ processData()
                              ├ successTemplateSelectPc  → .select-swiper       (PC 좌측 목록)
                              ├ successTemplateImgsPc    → .thumbs-swiper       (PC 우측 이미지)
                              └ successTemplateMo        → .history_mo          (모바일)
  └ new Swiper() × 3   ← 위 DOM 삽입이 끝난 뒤에 실행되어야 한다
```

데이터 출처는 로컬이 아니라 **외부 URL** 이다:

```
https://younhoso.github.io/younhoso/blogExample/infinite_rolling/ex2/data/history.json
```

썸네일 이미지 URL 도 같은 도메인을 가리킨다. 따라서:

- **네트워크가 없으면 슬라이드가 비어 페이지가 사실상 깨진다.**
- `data/history.json` 과 `imgs/` 는 같은 내용의 로컬 사본이지만 **어디서도 참조되지 않는다.**
  로컬 자산으로 전환하려면 `js/index.js:76` 의 URL 과 JSON 안의 `thumb` 경로를 함께 바꿔야 한다.

## 건드리면 안 되는 것 — `ajax.js` 의 `async: false`

```js
// js/ajax.js
return $.ajax({ url: path, method: 'GET', dataType: 'json', async: false });
```

`async: false` 는 브라우저가 경고하는 폐기 예정 옵션이지만, **이 프로젝트는 여기에 구조적으로 의존한다.**
동기 요청이라 `processData()` 의 DOM 삽입이 끝난 뒤에 `new Swiper()` 가 실행되고, 그래서
Swiper 가 슬라이드 개수를 제대로 인식한다.

비동기(`async: true`, `fetch`, `await`)로 바꾸면 **슬라이드가 0개인 상태에서 Swiper 가 초기화되어
목록과 이미지가 전부 사라진다.** 비동기로 바꾸려면 Swiper 초기화를 `.done()` 콜백 안으로
옮기고, 세 인스턴스가 서로를 참조하는 클릭 핸들러까지 함께 이동시켜야 한다.

## 알려진 이슈 (아직 안 고침)

수정 요청을 받은 적이 없어 그대로 둔 것들이다. 건드릴 일이 생기면 참고한다.

1. **`js/index.js` 의 `handleError()` 가 죽는다**
   ```js
   function handleError(error) {            // 파라미터는 error
     const errorHTML = errorTemplate(errorThrown);   // 정의되지 않은 errorThrown 참조
   ```
   통신 실패 시 에러 템플릿 대신 `ReferenceError` 가 난다. `error` 로 바꾸면 된다.

2. **`index.html` 의 viewport meta 값이 깨져 있다**
   ```html
   <meta name="viewport" content="width=\, initial-scale=1.0">
   ```
   `width=device-width` 여야 한다. 현재 모바일 실기기에서 스케일이 의도대로 안 잡힌다.

## 코드 컨벤션

- 주석과 커밋 메시지는 한국어
- `css/index.css` 는 한 줄 압축 규칙과 여러 줄 규칙이 섞여 있다. **주변 스타일을 따라간다**
- 클래스 네이밍은 `history_pc` / `history_mo` 처럼 스네이크와 케밥이 혼재한다. 기존 것을 따른다
- CSS 는 `.history_pc` / `@media (max-width:1080px)` 두 블록으로 나뉜다. 새 규칙도 해당 블록 안에 넣는다

## 수정 후에는 반드시

```bash
.claude/hooks/measure.sh     # 레이아웃 규칙 검사 (위반 시 exit 1)
.claude/hooks/shot.sh        # 통과하면 눈으로 확인
```

자세한 내용은 [`.claude/README.md`](../README.md) 참조.
