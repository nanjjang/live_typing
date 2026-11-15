# livetype

코드를 한 글자씩 따라 치면, 친 만큼 오른쪽에 실제 화면이 만들어지는 코딩 타자 연습.

- `client/` — React + Vite (react-router-dom, axios, styled-components)
- `server/` — Node.js + Express (MySQL, JWT 로그인, bcrypt)
- `db/init/01-schema.sql` — `users`(회원), `records`(연습 기록) 테이블
- `db/init/02-snippets.sql` — `snippets`(커뮤니티 레슨, 핵심 데이터) 테이블

## 로컬 실행

Node.js 22.12 이상과 로컬 MySQL이 필요합니다. Express가 React 화면과 API를 같은 주소에서 제공합니다.

1. MySQL 실행 (Homebrew 기준): `brew services start mysql`
2. DB와 계정을 만들고 SQL 파일 두 개를 순서대로 실행

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS livetype_학번 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS '학번'@'localhost' IDENTIFIED BY '비밀번호';
  GRANT ALL PRIVILEGES ON livetype_학번.* TO '학번'@'localhost';"
mysql -h 127.0.0.1 -P 3306 -u 학번 -p livetype_학번 < db/init/01-schema.sql
mysql -h 127.0.0.1 -P 3306 -u 학번 -p livetype_학번 < db/init/02-snippets.sql
```

3. `server/.env`가 없으면 `server/.env.example`을 복사합니다. 만든 DB에 맞게 `DB_USER`, `DB_PASSWORD`, `DB_NAME`을 채우고 `JWT_SECRET`을 설정합니다.
4. 프로젝트 루트에서 실행합니다.

```bash
npm run setup  # 최초 설치 또는 의존성이 바뀌었을 때
npm start      # React 빌드 후 Express 시작
```

[http://localhost:3000](http://localhost:3000)에서 접속합니다. 포트는 `server/.env`의 `PORT`로 지정할 수 있습니다.

### 화면 개발

실시간 새로고침이 필요하면 별도 터미널에서 `npm run dev --prefix server`와 `npm run dev --prefix client`를 각각 실행합니다. [http://localhost:5173](http://localhost:5173)의 `/api` 요청은 Vite가 3000번 포트의 Express로 전달합니다.

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
