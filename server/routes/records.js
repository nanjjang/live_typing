import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// 모든 기록 API는 로그인 회원 전용
router.use(authenticateToken);

// DB 한 줄 -> 프론트에서 쓰는 run 객체 { wpm, acc, ms, at }
const toRun = (r) => ({
  wpm: Number(r.wpm),
  acc: Number(r.accuracy),
  ms: r.duration_ms,
  at: new Date(r.created_at).getTime(),
});

// 1. 내 레슨별 기록 요약
// GET /api/records  ->  { [lessonId]: { runs, done, best, last } }
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT lesson_id, wpm, accuracy, duration_ms, created_at
       FROM records WHERE user_id = ? ORDER BY created_at ASC, id ASC`,
      [req.user.id]
    );

    const summary = {};
    for (const r of rows) {
      const run = toRun(r);
      const rec = summary[r.lesson_id] || { runs: 0, done: true, best: null, last: null };
      rec.runs += 1;
      rec.last = run;
      if (!rec.best || run.wpm > rec.best.wpm) rec.best = run;
      summary[r.lesson_id] = rec;
    }
    return res.json(summary);
  } catch (error) {
    console.error('기록 조회 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 2. 레슨 완주 기록 저장
// POST /api/records  body: { lessonId, wpm, acc, ms }
router.post('/', async (req, res) => {
  const { lessonId, wpm, acc, ms } = req.body;

  if (!lessonId || [wpm, acc, ms].some((v) => typeof v !== 'number' || !Number.isFinite(v))) {
    return res.status(400).json({ message: '기록 정보가 올바르지 않습니다.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO records (user_id, lesson_id, wpm, accuracy, duration_ms) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, String(lessonId).slice(0, 50), wpm, acc, Math.round(ms)]
    );
    return res.status(201).json({ message: '기록이 저장되었습니다.', recordId: result.insertId });
  } catch (error) {
    console.error('기록 저장 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

export default router;
