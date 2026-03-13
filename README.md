# 🎬 CinePick — AI 기반 OTT 콘텐츠 추천 플랫폼

> "오늘 뭐 볼지 모르겠다면? CinePick이 골라드립니다."

---

## 🏗️ 프로젝트 구조

```
cinepick/
├── frontend/                # Next.js 14 프론트엔드
│   ├── app/
│   │   ├── page.jsx         # 홈 페이지
│   │   ├── layout.jsx       # 루트 레이아웃
│   │   ├── globals.css      # 글로벌 스타일
│   │   ├── quick-pick/      # 퀵픽 페이지
│   │   ├── movie/[id]/      # 영화 상세 페이지
│   │   ├── genre/           # 장르 탐색 페이지
│   │   ├── watchlist/       # 찜 목록 페이지
│   │   └── login/           # 로그인/회원가입
│   ├── components/
│   │   ├── Navbar.jsx       # 네비게이션 바
│   │   ├── HeroBanner.jsx   # 히어로 배너 (자동 슬라이드)
│   │   ├── MovieCard.jsx    # 영화 카드
│   │   └── MovieRow.jsx     # 가로 스크롤 영화 목록
│   └── lib/
│       ├── api.js           # API 클라이언트
│       └── store.js         # Zustand 전역 상태
│
├── backend/                 # Express + Node.js 백엔드
│   └── src/
│       ├── index.js         # 서버 진입점
│       ├── lib/
│       │   ├── supabase.js  # Supabase 클라이언트
│       │   └── openai.js    # AI 추천 엔진
│       ├── middleware/
│       │   └── auth.js      # JWT 인증 미들웨어
│       └── routes/
│           ├── movies.js    # 영화 API
│           ├── ai.js        # AI 추천 API
│           ├── users.js     # 사용자 API
│           ├── watchlist.js # 찜 목록 API
│           └── auth.js      # 인증 API
│
└── database/
    ├── schema.sql           # DB 스키마 (PostgreSQL)
    └── seed.sql             # 샘플 영화 데이터 (15개)
```

---

## 🚀 시작하기

### 1. Supabase 설정

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `database/schema.sql` 실행
3. SQL Editor에서 `database/seed.sql` 실행
4. Settings → API에서 URL, anon key, service role key 복사

### 2. OpenAI API Key 발급

1. [platform.openai.com](https://platform.openai.com)에서 API 키 발급

### 3. 백엔드 실행

```bash
cd backend

# 환경변수 설정
cp .env.example .env
# .env 파일 수정 (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY)

# 의존성 설치 및 실행
npm install
npm run dev
```

백엔드: `http://localhost:4000`

### 4. 프론트엔드 실행

```bash
cd frontend

# 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일 수정

# 의존성 설치 및 실행
npm install
npm run dev
```

프론트엔드: `http://localhost:3000`

---

## 📡 API 엔드포인트

### 영화 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/movies` | 영화 목록 (필터/정렬/페이지네이션) |
| GET | `/api/movies/trending` | 트렌딩 영화 |
| GET | `/api/movies/new-releases` | 신작 영화 |
| GET | `/api/movies/quick-pick` | 기분/시간/장르 기반 추천 |
| GET | `/api/movies/genres` | 장르 목록 |
| GET | `/api/movies/:id` | 영화 상세 |
| GET | `/api/movies/:id/similar` | 유사 영화 |

### AI API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/ai/recommend` | AI 영화 추천 (GPT-4o-mini) |
| GET | `/api/ai/personalized` | 개인화 추천 (인증 필요) |

### 사용자 & 찜 목록 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/users/me` | 내 프로필 |
| PUT | `/api/users/me/preferences` | 선호도 업데이트 |
| POST | `/api/users/me/watch-history` | 시청 기록 추가 |
| GET | `/api/watchlist` | 찜 목록 조회 |
| POST | `/api/watchlist` | 찜 추가 |
| DELETE | `/api/watchlist/:movie_id` | 찜 제거 |
| PATCH | `/api/watchlist/:movie_id/watched` | 시청 완료 표시 |

### 인증 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/logout` | 로그아웃 |
| POST | `/api/auth/refresh` | 토큰 갱신 |

---

## 🗄️ 데이터베이스 스키마

### movies
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| title | VARCHAR | 제목 |
| poster | VARCHAR | 포스터 URL |
| backdrop | VARCHAR | 배경 이미지 URL |
| genre | TEXT[] | 장르 배열 |
| mood | TEXT[] | 분위기 배열 |
| duration | INTEGER | 상영 시간 (분) |
| rating | DECIMAL | 평점 |
| description | TEXT | 줄거리 |
| ott_platform | TEXT[] | 시청 가능 플랫폼 |
| trending_score | INTEGER | 트렌딩 점수 |
| is_new | BOOLEAN | 신작 여부 |

### users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key (Supabase Auth 연동) |
| email | VARCHAR | 이메일 |
| preferences | JSONB | 장르/분위기/최대시간 선호도 |
| watch_history | UUID[] | 시청 기록 (영화 ID 배열) |

### watchlist
| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_id | UUID | 사용자 FK |
| movie_id | UUID | 영화 FK |
| watched | BOOLEAN | 시청 완료 여부 |
| user_rating | DECIMAL | 사용자 평점 |

---

## 🎨 주요 기능

### 퀵픽 (Quick Pick)
3가지 질문 (기분 → 시간 → 장르) 으로 AI가 최적의 영화 추천

### 홈 화면
- 자동 슬라이드 히어로 배너
- 트렌딩 / 신작 / 장르별 가로 스크롤 섹션
- 로그인 시 AI 맞춤 추천

### 영화 상세
- 풀 배경 이미지, 상세 정보
- 유사 영화 추천
- 찜하기 기능

### 찜 목록
- 시청 전/후 필터
- 시청 완료 표시

---

## 🛠️ 기술 스택

| 분야 | 기술 |
|------|------|
| Frontend | Next.js 14, React, Tailwind CSS |
| State | Zustand |
| Backend | Node.js, Express |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + JWT |
| AI | OpenAI GPT-4o-mini |
| Font | Bebas Neue (디스플레이), DM Sans (본문) |
