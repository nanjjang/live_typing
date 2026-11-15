import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import usersRouter from './routes/users.js';
import recordsRouter from './routes/records.js';
import snippetsRouter from './routes/snippets.js';
import joinRouter from './routes/join.js';

const app = express();
const PORT = process.env.PORT || 3000;
const clientDirectory = fileURLToPath(new URL('../client/dist/', import.meta.url));
const clientIndex = join(clientDirectory, 'index.html');

// 미들웨어 설정
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));  // 개발 중 Vite(5173)에서 직접 오는 요청 허용 (평소엔 Vite 프록시를 탐)
app.use(express.json());                                                // JSON 요청 본문(req.body) 파싱
app.use(express.urlencoded({ extended: true }));                        // HTML Form 방식 요청 본문 파싱

// 라우터 등록
app.use('/api/users', usersRouter);       // /api/users/signup, /login, /me (GET·PUT·DELETE)
app.use('/api/records', recordsRouter);   // /api/records
app.use('/api/snippets', snippetsRouter); // /api/snippets (커뮤니티 레슨 CRUD)
app.use('/api/join', joinRouter);         // /api/join/authors (users ⨝ snippets)
app.use('/api', (_req, res) => res.status(404).json({ message: 'API를 찾을 수 없습니다.' }));

if (existsSync(clientIndex)) {
  app.use(express.static(clientDirectory));
  // React Router의 화면 주소로 직접 들어오거나 새로고침할 때 앱을 제공한다.
  app.get('/{*path}', (req, res, next) => {
    if (extname(req.path) || req.path.startsWith('/assets/') || !req.accepts('html')) return next();
    res.sendFile(clientIndex);
  });
} else {
  app.get('/', (_req, res) => res.send('Backend Server is running...'));
}

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
