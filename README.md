# Mail Dashboard

Google Sheets를 데이터 소스로 하는 읽기 전용 메일 현황 대시보드.

---

## STEP 0 — 컬럼 매핑 결과 (dummy mail data 탭)

| # | 헤더 | 타입 | 시각화 |
|---|------|------|--------|
| A | 티켓ID | `freetext` | 테이블 ID |
| B | 최근수신(KST) | `datetime` | 스파크라인 + 히트맵 |
| C | 경과(일) | `numeric` | KPI / 테이블 |
| D | 발신자 | `email` | 발신자·도메인 랭킹 |
| E | 발신자유형 | `category` | 도넛 + 비율 리스트 |
| F | 언어 | `category` | (단일값 — 생략) |
| G | 분류 | `category` | 도넛 + 비율 리스트 |
| H | 담당부서 | `category` | 도넛 + 비율 리스트 |
| I | 중요도 | `numeric` | 테이블 |
| J | 감정 | `category` | 도넛 + 비율 리스트 |
| K | SLA기한 | `datetime` | 스파크라인 |
| L | 지연 | `boolean` | KPI — SLA 지연 수 |
| M | 처리상태 | `status` | KPI + 도넛 + pill 뱃지 |
| N | 회신여부 | `status` | KPI — 미회신 수 + pill |
| O | 검토필요 | `boolean` | KPI + 검토뷰 필터 |
| P | AI회신초안/조치 | `longtext` | 검토 뷰 카드 |
| Q | Gmail링크 | `url` | 테이블 ↗ 링크 + 카드 링크 |
| R | Draft상태 | `status` | pill 뱃지 |

컬럼 매핑은 런타임에 자동 추론 (하드코딩 없음). 시트 구조가 바뀌어도 `GOOGLE_SHEET_TAB`만 변경하면 됩니다.

---

## 환경 설정

### 1. `.env.local` 채우기

```env
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}  # JSON을 한 줄로
GOOGLE_SHEETS_ID=1zVrJhs_0sB3wSP-vpV23usjBfS7zfPeBi8oTx_jZ9qw
GOOGLE_SHEET_TAB=dummy mail data
GOOGLE_CLIENT_ID=<OAuth 클라이언트 ID>
GOOGLE_CLIENT_SECRET=<OAuth 클라이언트 시크릿>
ALLOWED_HOSTED_DOMAINS=krema.ai          # 허용할 도메인 (쉼표 구분). 비우면 전체 허용
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

### 2. 서비스 계정 만들기

1. Google Cloud Console → IAM → 서비스 계정 생성
2. **역할**: `역할 없음` (Sheets API는 역할 없이 키만 필요)
3. **키 생성** → JSON 다운로드
4. JSON 파일을 한 줄로 압축하여 `GOOGLE_SERVICE_ACCOUNT_JSON`에 붙여넣기
   ```bash
   cat service-account.json | tr -d '\n'
   ```
5. **시트 공유**: 구글 시트 → 공유 → 서비스 계정 이메일 추가 (뷰어 권한)

### 3. Google OAuth 설정 (웹 유형)

1. Google Cloud Console → API 및 서비스 → 사용자 인증 정보 → `+ 사용자 인증 정보 만들기` → OAuth 2.0 클라이언트 ID
2. 애플리케이션 유형: **웹 애플리케이션**
3. 승인된 리디렉션 URI 추가:
   - 로컬: `http://localhost:3000/api/auth/callback/google`
   - 프로덕션: `https://your-domain.vercel.app/api/auth/callback/google`
4. 클라이언트 ID / 시크릿을 `.env.local`에 입력

---

## 로컬 실행

```bash
npm install
npm run dev        # http://localhost:3000
```

타입 체크:
```bash
npx tsc --noEmit
```

---

## Vercel 배포

```bash
npx vercel --prod
```

환경변수를 Vercel 대시보드 또는 CLI로 설정:
```bash
vercel env add GOOGLE_SERVICE_ACCOUNT_JSON
vercel env add GOOGLE_SHEETS_ID
# ... 나머지 변수도 동일하게
```

`NEXTAUTH_URL`은 프로덕션 URL(`https://your-app.vercel.app`)로 변경.
