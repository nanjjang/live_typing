-- SQL 활용 실습 보고서 (윤준서/20613) — DB: livetype_20613
-- 실행 순서대로 정리. 캡쳐는 report/captures/qN.png

USE livetype_20613;

-- 1. 회원가입
INSERT INTO users (email, password, nickname)
VALUES ('25s075@sunrint.hs.kr', '$2b$10$QfsYmKjv7ybkLqYRJSo6he/IZJlm4H3ZMevy6N7Iij4H/0DFT0due', '윤준서');

SELECT * FROM users;

-- 2. 회원조회(로그인)
SELECT id, email, password, nickname, created_at
FROM users
WHERE email = '25s075@sunrint.hs.kr';

-- 3. 회원정보 수정
UPDATE users
SET nickname = '윤준서_20613'
WHERE id = 4;

SELECT id, email, nickname, created_at, updated_at FROM users WHERE id = 4;

-- 4. 회원탈퇴
DELETE FROM users
WHERE id = 3;

SELECT id, email, nickname, created_at FROM users;

-- 5. 핵심데이터 등록
INSERT INTO snippets (user_id, title, track, summary, code)
VALUES (4, '자기소개 카드', 'html', '이름과 학번을 소개하는 카드',
        '<div class="card">\n  <h1>Yoon Junseo</h1>\n  <p>Sunrint 20613</p>\n</div>');

SELECT * FROM snippets;

-- 6. 핵심데이터 조회
SELECT id, user_id, title, track, summary, created_at
FROM snippets
ORDER BY created_at DESC, id DESC;

-- 8. 핵심데이터 수정
UPDATE snippets
SET title = '자기소개 명함', summary = '이름, 학번, 학교를 담은 명함 카드'
WHERE id = 5 AND user_id = 4;

SELECT id, user_id, title, summary, created_at, updated_at FROM snippets WHERE id = 5;

-- 9. 핵심데이터 삭제
DELETE FROM snippets
WHERE id = 3 AND user_id = 1;

SELECT id, user_id, title, track FROM snippets;

-- 10. 회원 ⨝ 핵심데이터 JOIN
SELECT s.id AS snippet_id, s.title, s.track, s.created_at,
       u.id AS user_id, u.nickname, u.email
FROM snippets s
INNER JOIN users u ON s.user_id = u.id
ORDER BY s.id;
