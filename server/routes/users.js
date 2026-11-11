import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, nickname: user.nickname },
    process.env.JWT_SECRET ?? 'fallback_secret_key',
    { expiresIn: '7d' }
  );

// 1. 회원가입 API (가입 성공 시 자동 로그인을 위한 토큰 즉시 반환)
// POST /api/users/signup
router.post('/signup', async (req, res) => {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    return res.status(400).json({ message: '이메일, 비밀번호, 닉네임을 모두 입력해 주세요.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: '비밀번호는 6자 이상이어야 합니다.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)',
      [email, hashedPassword, nickname]
    );

    const user = { id: result.insertId, email, nickname };
    return res.status(201).json({ message: '회원가입이 완료되었습니다.', token: signToken(user), user });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '이미 가입된 이메일입니다.' });
    }
    console.error('회원가입 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 2. 로그인 API
// POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해 주세요.' });
  }

  try {
    const [rows] = await db.query('SELECT id, email, password, nickname FROM users WHERE email = ?', [email]);

    // 회원이 아닌 경우 (404 -> 프론트에서 회원가입 이동 유도)
    if (rows.length === 0) {
      return res.status(404).json({ message: '등록된 회원 정보가 없습니다.' });
    }

    const [row] = rows;
    const isPasswordMatch = await bcrypt.compare(password, row.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    const user = { id: row.id, email: row.email, nickname: row.nickname };
    return res.status(200).json({ message: '로그인 성공', token: signToken(user), user });
  } catch (error) {
    console.error('로그인 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 3. 내 정보 조회
// GET /api/users/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, email, nickname, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    return res.json(users[0]);
  } catch (error) {
    console.error('GET /api/users/me 에러:', error);
    return res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
  }
});

// 4. 내 정보 수정 (마이페이지)
// PUT /api/users/me  body: { nickname, currentPassword?, newPassword? }
// 닉네임은 바로 바꾸고, 비밀번호를 바꿀 때는 현재 비밀번호를 확인한다.
router.put('/me', authenticateToken, async (req, res) => {
  const nickname = String(req.body.nickname ?? '').trim();
  const { currentPassword, newPassword } = req.body;

  if (!nickname || nickname.length > 50) {
    return res.status(400).json({ message: '닉네임은 1~50자로 입력해 주세요.' });
  }
  if (newPassword && newPassword.length < 6) {
    return res.status(400).json({ message: '새 비밀번호는 6자 이상이어야 합니다.' });
  }

  try {
    const [rows] = await db.query('SELECT id, email, password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    if (newPassword) {
      const ok = currentPassword && (await bcrypt.compare(currentPassword, rows[0].password));
      if (!ok) {
        return res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      await db.query('UPDATE users SET nickname = ?, password = ? WHERE id = ?', [nickname, hashed, req.user.id]);
    } else {
      await db.query('UPDATE users SET nickname = ? WHERE id = ?', [nickname, req.user.id]);
    }

    // 토큰 안에 닉네임이 들어 있으므로 새 토큰을 함께 내려준다
    const user = { id: rows[0].id, email: rows[0].email, nickname };
    return res.json({ message: '회원 정보가 수정되었습니다.', token: signToken(user), user });
  } catch (error) {
    console.error('PUT /api/users/me 에러:', error);
    return res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
  }
});

// 5. 회원 탈퇴
// DELETE /api/users/me  body: { password }
// 비밀번호를 한 번 더 확인한 뒤 삭제한다. (작성한 레슨과 기록은 FK ON DELETE CASCADE로 함께 삭제)
router.delete('/me', authenticateToken, async (req, res) => {
  const { password } = req.body ?? {};
  if (!password) {
    return res.status(400).json({ message: '비밀번호를 입력해 주세요.' });
  }

  try {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    if (!(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    return res.json({ message: '회원 탈퇴가 완료되었습니다.' });
  } catch (error) {
    console.error('DELETE /api/users/me 에러:', error);
    return res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
  }
});

export default router;
