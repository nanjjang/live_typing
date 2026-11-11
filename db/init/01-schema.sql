-- Docker MySQL 최초 실행 시 자동 생성되는 스키마입니다.
-- 새 볼륨으로 컨테이너를 처음 띄울 때만 실행됩니다.
-- (로컬 MySQL을 쓴다면 이 파일을 직접 실행하세요: mysql -u <user> -p <DB_NAME> < db/init/01-schema.sql)

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 레슨 한 번 완주할 때마다 한 줄씩 쌓이는 연습 기록
CREATE TABLE IF NOT EXISTS records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id VARCHAR(50) NOT NULL,
  wpm DECIMAL(6,2) NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  duration_ms INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_records_user_lesson (user_id, lesson_id),
  CONSTRAINT fk_records_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
