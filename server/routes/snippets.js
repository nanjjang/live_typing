import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

const TRACKS = ['html', 'css', 'js'];

// 목록/상세에서 공통으로 쓰는 SELECT (snippets + users JOIN 으로 작성자 닉네임까지)
const SELECT_SNIPPET = `
  SELECT s.id, s.user_id, s.title, s.track, s.summary, s.code, s.base_html, s.created_at, s.updated_at,
         u.nickname AS author
  FROM snippets s
  INNER JOIN users u ON s.user_id = u.id`;

// 타자 엔진이 다룰 수 있게 코드를 정리: 줄바꿈 LF, 탭 -> 공백 2칸, 줄 끝 공백 제거
const normalizeCode = (code) =>
  String(code ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, '  ')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/^\n+|\n+$/g, '');

// 요청 본문 검사 -> { error } 또는 { data }
function validate(body) {
  const title = String(body.title ?? '').trim();
  const summary = String(body.summary ?? '').trim();
  const track = String(body.track ?? '');
  const code = normalizeCode(body.code);
  // html 레슨은 코드 자체가 화면이므로 미리보기용 HTML이 필요 없다
  const baseHtml = track === 'html' ? '' : String(body.base_html ?? '').trim();

  if (!title || title.length > 100) return { error: '제목은 1~100자로 입력해 주세요.' };
  if (summary.length > 200) return { error: '한 줄 설명은 200자 이하로 입력해 주세요.' };
  if (!TRACKS.includes(track)) return { error: '언어를 선택해 주세요.' };
  if (!code) return { error: '따라 칠 코드를 입력해 주세요.' };
  if (code.length > 4000) return { error: '코드는 4000자 이하로 입력해 주세요.' };
  // 한글 등은 IME 입력이라 한 글자씩 비교할 수 없으므로 영문/숫자/기호만 허용
  if (baseHtml.length > 4000) return { error: '미리보기용 HTML은 4000자 이하로 입력해 주세요.' };
  if (/[^\x20-\x7E\n]/.test(code)) return { error: '코드에는 영문, 숫자, 기호만 쓸 수 있습니다. (한글·이모지 제외)' };

  return { data: { title, summary, track, code, baseHtml: baseHtml || null } };
}

// 본인 글인지 확인 -> 없으면 404, 남의 글이면 403
async function checkOwner(id, userId) {
  const [rows] = await db.query('SELECT user_id FROM snippets WHERE id = ?', [id]);
  if (rows.length === 0) return { status: 404, message: '레슨을 찾을 수 없습니다.' };
  if (rows[0].user_id !== userId) return { status: 403, message: '본인이 작성한 레슨만 수정/삭제할 수 있습니다.' };
  return null;
}

// 1. 전체 목록 (누구나 조회 가능)
// GET /api/snippets?track=html  (user=<회원 id> 로 특정 회원 글만)
router.get('/', async (req, res) => {
  const where = [];
  const params = [];
  if (TRACKS.includes(req.query.track)) {
    where.push('s.track = ?');
    params.push(req.query.track);
  }
  if (req.query.user) {
    where.push('s.user_id = ?');
    params.push(Number(req.query.user));
  }

  try {
    const [rows] = await db.query(
      `${SELECT_SNIPPET} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY s.created_at DESC, s.id DESC`,
      params
    );
    return res.json(rows);
  } catch (error) {
    console.error('레슨 목록 조회 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 2. 하나 조회 (누구나)
// GET /api/snippets/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`${SELECT_SNIPPET} WHERE s.id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '레슨을 찾을 수 없습니다.' });
    return res.json(rows[0]);
  } catch (error) {
    console.error('레슨 조회 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 3. 등록 (로그인 회원만)
// POST /api/snippets  body: { title, track, summary, code, base_html? }
router.post('/', authenticateToken, async (req, res) => {
  const { error, data } = validate(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const [result] = await db.query(
      'INSERT INTO snippets (user_id, title, track, summary, code, base_html) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, data.title, data.track, data.summary, data.code, data.baseHtml]
    );
    return res.status(201).json({ message: '레슨이 등록되었습니다.', id: result.insertId });
  } catch (err) {
    console.error('레슨 등록 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 4. 수정 (본인 글만)
// PUT /api/snippets/:id
router.put('/:id', authenticateToken, async (req, res) => {
  const { error, data } = validate(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const denied = await checkOwner(req.params.id, req.user.id);
    if (denied) return res.status(denied.status).json({ message: denied.message });

    await db.query(
      'UPDATE snippets SET title = ?, track = ?, summary = ?, code = ?, base_html = ? WHERE id = ? AND user_id = ?',
      [data.title, data.track, data.summary, data.code, data.baseHtml, req.params.id, req.user.id]
    );
    return res.json({ message: '레슨이 수정되었습니다.' });
  } catch (err) {
    console.error('레슨 수정 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 5. 삭제 (본인 글만)
// DELETE /api/snippets/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const denied = await checkOwner(req.params.id, req.user.id);
    if (denied) return res.status(denied.status).json({ message: denied.message });

    await db.query('DELETE FROM snippets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return res.json({ message: '레슨이 삭제되었습니다.' });
  } catch (err) {
    console.error('레슨 삭제 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

export default router;
