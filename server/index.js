import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './routes/users.js';
import recordsRouter from './routes/records.js';
import snippetsRouter from './routes/snippets.js';
import joinRouter from './routes/join.js';

// 환경변수 및 Express 앱 초기화
dotenv.config();                                    // .env 파일에 저장된 설정값들을 process.env로 불러옴
const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));  // 개발 중 Vite(5173)에서 직접 오는 요청 허용 (평소엔 Vite 프록시를 탐)
app.use(express.json());                                                // JSON 요청 본문(req.body) 파싱
app.use(express.urlencoded({ extended: true }));                        // HTML Form 방식 요청 본문 파싱

// 기본 루트 엔드포인트 : http://localhost:5000 접속 시 문구가 보이면 서버 실행 성공
app.get('/', (req, res) => {
  res.send('Backend Server is running...');
});

// 라우터 등록
app.use('/api/users', usersRouter);       // /api/users/signup, /login, /me (GET·PUT·DELETE)
app.use('/api/records', recordsRouter);   // /api/records
app.use('/api/snippets', snippetsRouter); // /api/snippets (커뮤니티 레슨 CRUD)
app.use('/api/join', joinRouter);         // /api/join/authors (users ⨝ snippets)

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
