-- 커뮤니티 레슨 (핵심 데이터): 회원이 직접 올리는 연습용 코드
-- 이미 만들어 둔 DB에 추가할 때: mysql -u <user> -p <DB_NAME> < db/init/02-snippets.sql

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS snippets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,                                   -- 작성자 (users.id)
  title VARCHAR(100) NOT NULL,
  track ENUM('html', 'css', 'js') NOT NULL DEFAULT 'html', -- 미리보기 방식
  summary VARCHAR(200) NOT NULL DEFAULT '',
  code TEXT NOT NULL,                                     -- 따라 칠 코드
  base_html TEXT NULL,                                    -- css/js 레슨 미리보기용 HTML (따라 치지 않음)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_snippets_user (user_id),
  CONSTRAINT fk_snippets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
