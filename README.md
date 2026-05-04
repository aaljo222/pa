# 변리사 미팅 데모 v3

(주)에이아이컴퍼니의 5건 특허 portfolio + 청구항 1 시각화 + **라이브 백엔드 연결**

---

## 🎯 페이지 구성

| 라우트 | 페이지 | 용도 |
|--------|--------|------|
| `/` | 홈 (랜딩) | 회사 소개 + 5건 특허 카운터 + CTA 두 개 |
| `/demo/claim1` | **청구항 1 애니메이션** | 5단계 파이프라인 35초 자동 재생 (별창) |
| `/demo/live` | **라이브 진단** | 백엔드 호출 → 12문제 실시간 생성 |
| `/patents` | 특허 5건 portfolio | 각 특허 상세 |
| `/about` | 회사 소개 | 이재오님 약력 + 기술 자산 |

---

## 🚀 실행

### 1. 환경 설정

```bash
cp .env.example .env
# .env 파일 열어서 VITE_API_BASE 확인
```

### 2. 의존성 설치 + 실행

```bash
npm install
npm run dev
```

`http://localhost:5173` 가 자동으로 열립니다.

---

## 🔌 백엔드 연결

라이브 진단 페이지(`/demo/live`)는 백엔드를 호출합니다. 백엔드 셋업:

### 1. cloudflare_prj 백엔드에 router 추가

```bash
# diagnostic_router.py 를 cloudflare_prj/routers/diagnostic.py 로 복사
cp /path/to/diagnostic_router.py D:/leejaeoh/johungwoo/cloudflare_prj/routers/diagnostic.py

# main.py 에 한 줄 추가:
from routers import diagnostic
app.include_router(diagnostic.router)

# CORS 설정 (main.py):
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://paen.vercel.app",  # ← 실제 도메인으로
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. 환경 변수

`cloudflare_prj/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
EXAM_DATA_DIR=./exam_data
```

### 3. 헬스체크

```bash
curl https://cloudflareprj-production.up.railway.app/api/diagnostic/health
```

기대 응답:
```json
{
  "ok": true,
  "pool_size": 1200,
  "subjects": ["EE-EM", "EE-PW", "..."],
  "model": "claude-sonnet-4-5",
  "anthropic_key_set": true
}
```

---

## 📡 백엔드 API

### `GET /api/diagnostic/preview`

진단 메타 12개 즉시 반환 (3초). AI 호출 없음.

쿼리:
- `major`: `electrical` | `related` | `none`
- `months`: 학습 개월수 (정수)
- `seed`: 재현용 시드
- `limit`: 1-12 (기본 12)

### `POST /api/diagnostic/generate/stream`

SSE 로 12문제 progressive 생성. 약 4-5분 소요.

요청:
```json
{
  "user_prior": { "major": "electrical", "months": 6 },
  "seed": 42,
  "limit": 12,
  "exclude_q_uids": []
}
```

이벤트:
- `meta_selected`: 메타 12개 선정 완료 (즉시)
- `question`: 1문제 생성 완료 (×12)
- `error`: 어떤 문제 생성 실패
- `done`: 전체 종료

### `GET /api/diagnostic/health`

헬스체크.

---

## 🎬 변리사 미팅 시나리오

1. **`/` 홈** — 회사 소개, "이재오님은 5건 특허를 보유하고 있습니다"
2. **`/demo/claim1`** — "청구항 1이 이렇게 동작합니다 (35초 애니메이션)"
3. **`/demo/live`** — "그리고 실제로 우리 서비스에서 이렇게 작동합니다"
   - "메타 미리보기" 버튼 → 3초 후 12개 메타 카드 표시
   - "AI 본문 생성" 버튼 → 4-5분 동안 1개씩 카드가 위에서 아래로 떨어짐
   - 각 카드에 "✓ 검증 통과" 배지 = **청구항 19 (역변환 검증) 작동 증거**
4. **`/patents`** — 5건 portfolio 우산 구조
5. **`/about`** — 회사 신뢰성 (이재오님 약력)

---

## 🔧 트러블슈팅

**Q. CORS 에러**
A. cloudflare_prj 백엔드 `main.py`에 CORSMiddleware 의 `allow_origins` 에 프론트 도메인 추가.

**Q. 백엔드 헬스체크 실패**
A. (1) Railway 백엔드 배포 상태 확인 (2) `ANTHROPIC_API_KEY` 환경변수 설정 (3) `exam_data/` 디렉토리에 JSON 파일들 확인.

**Q. SSE 연결이 끊김**
A. Railway 의 timeout 설정 (기본 30초) 확인 필요. `--keep-alive` 옵션 또는 응답 헤더 `X-Accel-Buffering: no` 확인.

**Q. localhost:5173 시작 시 백엔드만 로컬로**
A. `.env`에서 `VITE_API_BASE=http://localhost:8000` 으로 변경하고 cloudflare_prj 도 로컬로 띄움.

---

## 📂 디렉토리 구조

```
patent-demo/
├── package.json
├── vite.config.js
├── index.html
├── .env.example
├── README.md
└── src/
    ├── main.jsx                # 라우터 진입점
    ├── Layout.jsx              # 상단 네비 + Footer
    ├── theme.js                # 디자인 토큰
    ├── api.js                  # 백엔드 호출 (preview + SSE)
    ├── PatentClaim1Demo.jsx    # 청구항 1 애니메이션 (기존)
    └── pages/
        ├── HomePage.jsx
        ├── PatentsPage.jsx
        ├── AboutPage.jsx
        └── LiveDemoPage.jsx    # 백엔드 연결 진단 페이지
```
