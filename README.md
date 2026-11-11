# livetype

코드를 한 글자씩 따라 치면, 친 만큼 오른쪽에 실제 화면이 만들어지는 코딩 타자 연습.

- `client/` — React + Vite (react-router-dom, axios, styled-components)
- `server/` — Node.js + Express (MySQL, JWT 로그인, bcrypt)
- `db/init/01-schema.sql` — `users`(회원), `records`(연습 기록) 테이블
- `db/init/02-snippets.sql` — `snippets`(커뮤니티 레슨, 핵심 데이터) 테이블

## 로컬 개발

```bash
docker compose up -d db                 # MySQL만 컨테이너로 (호스트 3307 포트)
cp server/.env.example server/.env      # DB_PORT=3307 로 바꾸기 (로컬 MySQL이면 3306 그대로)
cd server && npm install && npm run dev # http://localhost:5000
cd client && npm install && npm run dev # http://localhost:5173  (/api 는 5000으로 프록시)
```

로컬 MySQL을 쓸 때는 DB(`livetype_학번`)를 만들고 SQL 파일 두 개를 순서대로 실행하세요.

```bash
mysql -u 학번 -p livetype_학번 < db/init/01-schema.sql
mysql -u 학번 -p livetype_학번 < db/init/02-snippets.sql
```

## Docker로 전체 실행

```bash
cp .env.example .env
docker compose up -d --build            # http://localhost:8080
```

## API

| Method | Path | 설명 |
|---|---|---|
| POST | `/api/users/signup` | 회원가입 `{ email, password, nickname }` → `{ token, user }` (bcrypt 암호화) |
| POST | `/api/users/login` | 로그인 `{ email, password }` → `{ token, user }` |
| GET | `/api/users/me` | 내 정보 (토큰 필요) |
| PUT | `/api/users/me` | 프로필 수정 `{ nickname, currentPassword?, newPassword? }` (토큰 필요) |
| DELETE | `/api/users/me` | 회원 탈퇴 `{ password }` (토큰 필요, 레슨·기록도 함께 삭제) |
| GET | `/api/snippets` | 커뮤니티 레슨 전체 목록 (누구나, `?track=html`) |
| GET | `/api/snippets/:id` | 레슨 하나 (누구나) |
| POST | `/api/snippets` | 레슨 등록 `{ title, track, summary, code, base_html? }` (토큰 필요) |
| PUT | `/api/snippets/:id` | 레슨 수정 (본인 글만) |
| DELETE | `/api/snippets/:id` | 레슨 삭제 (본인 글만) |
| GET | `/api/join/authors` | `users ⨝ snippets` JOIN 결과 (작성자별 레슨 수 + 전체 목록) |
| GET | `/api/records` | 레슨별 기록 요약 `{ [lessonId]: { runs, best, last } }` (토큰 필요) |
| POST | `/api/records` | 완주 기록 저장 `{ lessonId, wpm, acc, ms }` (토큰 필요) |

## 화면

| 경로 | 설명 |
|---|---|
| `/` | 메인 — 기본 레슨 + **커뮤니티 레슨 최신 목록**(모든 회원 글) |
| `/signup`, `/login` | 회원가입, 로그인 |
| `/mypage` | 마이페이지 — 프로필 조회·수정, 내가 올린 레슨, 회원 탈퇴 |
| `/community` | 커뮤니티 레슨 전체 목록 (본인 글에만 수정/삭제 버튼) |
| `/community/new`, `/community/:id/edit` | 레슨 등록·수정 (로그인 필요) |
| `/community/:id` | 커뮤니티 레슨 따라 치기 |
| `/join` | 작성자 현황 — JOIN 결과 조회 메뉴 |

로그인하지 않으면 기록은 브라우저(localStorage)에만 저장됩니다.
