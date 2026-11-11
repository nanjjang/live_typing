import express from 'express';
import db from '../db.js';

const router = express.Router();

// 화면에 그대로 보여 줄 JOIN 쿼리 (users ⨝ snippets)
const SUMMARY_SQL = `SELECT u.id, u.nickname,
       COUNT(s.id)                        AS snippet_count,
       SUM(s.track = 'html')              AS html_count,
       SUM(s.track = 'css')               AS css_count,
       SUM(s.track = 'js')                AS js_count,
       MAX(s.created_at)                  AS last_posted
FROM users u
INNER JOIN snippets s ON s.user_id = u.id
GROUP BY u.id, u.nickname
ORDER BY snippet_count DESC, last_posted DESC`;

const ROWS_SQL = `SELECT s.id, s.title, s.track, s.created_at,
       u.nickname, u.created_at AS joined_at
FROM snippets s
INNER JOIN users u ON s.user_id = u.id
ORDER BY s.created_at DESC`;

// 작성자별 레슨 현황 (두 테이블 JOIN 결과)
// GET /api/join/authors  ->  { summary: { sql, rows }, detail: { sql, rows } }
router.get('/authors', async (req, res) => {
  try {
    const [summary] = await db.query(SUMMARY_SQL);
    const [detail] = await db.query(ROWS_SQL);
    // SUM()은 DECIMAL 문자열로 오므로 숫자로 바꿔서 보낸다
    const toNum = (r) => ({
      ...r,
      snippet_count: Number(r.snippet_count),
      html_count: Number(r.html_count),
      css_count: Number(r.css_count),
      js_count: Number(r.js_count),
    });
    return res.json({
      summary: { sql: SUMMARY_SQL, rows: summary.map(toNum) },
      detail: { sql: ROWS_SQL, rows: detail },
    });
  } catch (error) {
    console.error('JOIN 조회 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

export default router;
