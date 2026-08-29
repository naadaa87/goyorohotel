# 고요로 GOYORO — 브랜드 홈페이지

고요한 길 위의 하루. 도심형 캡슐호텔 브랜드 **고요로**의 고객용 홈페이지입니다.
빌드 도구 없이 동작하는 정적 사이트라서, 저장소를 그대로 Cloudflare Pages에 연결하면 배포가 끝납니다.

---

## 1. 폴더 구조

```
.
├── index.html            홈
├── brand.html            브랜드 — 이름의 뜻, 심볼, 세 가지 약속, 디자인 방향
├── rooms.html            객실 — 4종 상세, 유닛 사양, 요금표
├── facilities.html       시설 — 라운지·샤워·세탁·복도, 층별 안내, 하우스룰
├── amenity.html          어메니티 — 웰컴 파우치, 침구, 유닛 설비, 사인 시스템
├── guide.html            이용안내 — 6단계 여정, 체크인/아웃, 이용 정책
├── safety.html           안전 — 6개 영역 안전 기준, 야간 운영 체계
├── location.html         지점 — 오픈 예정 안내, 입지 기준, 검토 권역
├── faq.html              자주 묻는 질문 — 4개 그룹 22문항
├── reserve.html          오픈 알림 신청 — 신청 폼, 단체·제휴 문의
├── 404.html
│
├── assets/
│   ├── css/style.css     전체 스타일 (브랜드 토큰 포함)
│   ├── js/main.js        내비게이션·스크롤 등장·폼 처리
│   └── img/              WebP 사진 20종 × 2사이즈, 로고 SVG 6종, og.jpg
│
├── favicon.svg / favicon-32.png / apple-touch-icon.png
├── robots.txt / sitemap.xml
└── _headers              Cloudflare Pages 캐시·보안 헤더
```

---

## 2. 로컬에서 미리 보기

파일을 더블클릭해도 열리지만, 간단한 서버로 띄우는 쪽이 정확합니다.

```bash
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000
```

---

## 3. GitHub에 올리기

```bash
git init
git add .
git commit -m "고요로 브랜드 홈페이지"
git branch -M main
git remote add origin https://github.com/<계정>/<저장소>.git
git push -u origin main
```

---

## 4. Cloudflare Pages 배포

1. Cloudflare 대시보드 → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 방금 올린 저장소를 선택합니다.
3. 빌드 설정은 아래처럼 **비워 둡니다.**

   | 항목 | 값 |
   |---|---|
   | Framework preset | `None` |
   | Build command | *(비움)* |
   | Build output directory | `/` |
   | Root directory | *(비움)* |

4. **Save and Deploy.** 1분 안에 `<프로젝트명>.pages.dev` 주소가 나옵니다.
5. 이후 `main` 브랜치에 push할 때마다 자동으로 다시 배포됩니다.

### 도메인 연결

Pages 프로젝트 → **Custom domains** → **Set up a domain** 에서 `goyoro.kr` 을 추가합니다.
도메인이 Cloudflare에 등록되어 있으면 DNS 레코드가 자동으로 생성됩니다.

도메인을 붙인 뒤에는 **`build/layout.py` 상단의 `SITE` 값과 각 HTML의 canonical·og:url을
실제 도메인으로 맞춰 주세요.** 현재는 `https://goyoro.kr` 로 되어 있습니다.

---

## 5. 오픈 알림 신청 폼 연결

`reserve.html` 의 폼은 기본 상태에서 **메일 앱을 여는 방식**으로 동작합니다.
별도 설정 없이도 신청을 받을 수 있지만, 서버로 바로 수집하려면 아래 둘 중 하나를 쓰시면 됩니다.

### 방법 A — 외부 폼 서비스 (가장 간단)

Formspree, Getform, Basin 같은 서비스에서 엔드포인트 주소를 발급받아
`reserve.html` 의 폼 태그에 넣기만 하면 됩니다.

```html
<form id="notify-form" data-endpoint="https://formspree.io/f/xxxxxxx" novalidate>
```

### 방법 B — Cloudflare Pages Functions

저장소 루트에 `functions/api/notify.js` 를 만들면 같은 프로젝트 안에서 처리됩니다.

```js
export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const data = Object.fromEntries(form);
  // 예: KV에 저장하거나 메일 API로 전달
  await env.NOTIFY.put(`${Date.now()}`, JSON.stringify(data));
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

그리고 폼에 엔드포인트를 지정합니다.

```html
<form id="notify-form" data-endpoint="/api/notify" novalidate>
```

---

## 6. 내용 수정하기

### 자주 바꾸게 될 값

| 무엇 | 어디 |
|---|---|
| 객실 요금 | `rooms.html` (카드 4곳 + 요금표), `index.html` 객실 미리보기 |
| 체크인·체크아웃 시간 | `guide.html` 상단 숫자 블록, `faq.html` |
| 층별 구성 | `facilities.html` 의 `.floors` 영역 |
| 검토 권역 | `location.html` 의 `.area-list`, `reserve.html` 의 권역 선택지 |
| 연락처 메일 | 각 페이지 하단 푸터, `location.html`, `reserve.html` |
| 브랜드 색상 | `assets/css/style.css` 최상단 `:root` |

### 1호점이 확정되면

`location.html` 의 "오픈 예정" 안내를 실제 주소·오픈일로 바꾸고,
`index.html` 히어로의 `서울 도심 1호점 준비 중` 배지와 푸터 문구도 함께 수정하시면 됩니다.

### 이미지 교체

`assets/img/` 안의 파일명을 그대로 유지한 채 덮어쓰면 모든 페이지에 반영됩니다.
큰 이미지는 `이름.webp` (1448px), 작은 이미지는 `이름@sm.webp` (800px) 두 벌을 함께 넣어 주세요.

---

## 7. 브랜드 자산

| 파일 | 용도 |
|---|---|
| `logo-h.svg` / `logo-h-light.svg` | 가로형 (헤더용 / 어두운 배경용) |
| `logo-v.svg` / `logo-v-light.svg` | 세로형 (푸터·인쇄물용) |
| `logo-mark.svg` / `logo-mark-light.svg` | 심볼 단독 |
| `og.jpg` | 카카오톡·SNS 공유 미리보기 (1200×630) |

모두 벡터 SVG라 어떤 크기로 키워도 깨지지 않습니다.

### 컬러

| 이름 | 값 | 쓰임 |
|---|---|---|
| Ivory | `#F1EBE1` | 강조 섹션 배경 |
| Warm Gray | `#CDC4BB` | 테두리, 보조선 |
| Stone | `#AA9E94` | 영문 라벨, 캡션 |
| Taupe | `#C8B7A6` | 어두운 배경 위 보조 텍스트 |
| Charcoal | `#2E2E2E` | 본문, 푸터 배경 |
| Deep Red | `#671816` | 포인트 — 버튼과 점 표시에만 |

### 서체

국문 **Pretendard**, 영문 **Sora**. 둘 다 CDN에서 불러오며 별도 설치가 필요 없습니다.

---

## 8. 참고

- 사이트에 쓰인 사진은 모두 **브랜드 개발용 콘셉트 이미지**이며 준공 사진이 아닙니다.
  해당 문구를 관련 페이지에 표기해 두었습니다.
- 요금·유닛 수·층별 구성은 1호점 계획안 기준이며, 확정 시 교체가 필요합니다.
- 접근성: 건너뛰기 링크, 키보드 포커스 표시, `prefers-reduced-motion` 대응이 적용되어 있습니다.

---

운영 (주)블랭크 · 대표 최시준
