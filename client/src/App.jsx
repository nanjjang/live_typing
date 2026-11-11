import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import Layout from './Layout.jsx'
import Landing from './pages/Landing.jsx'
import Practice from './pages/Practice.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import MyPage from './pages/MyPage.jsx'
import CommunityPage from './pages/CommunityPage.jsx'
import CommunityPractice from './pages/CommunityPractice.jsx'
import SnippetFormPage from './pages/SnippetFormPage.jsx'
import JoinPage from './pages/JoinPage.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import api, { getToken } from './lib/api.js'
import { readJSON, writeJSON, syncRecords, clearRecords } from './lib/storage.js'

function PracticeRoute() {
  const { id = '' } = useParams()
  return <Practice key={id || 'first'} lessonId={id} />
}

// Old hash links (#/lesson/html-01) keep working.
function LegacyHashRedirect() {
  const { hash } = useLocation()
  const m = hash.match(/^#(\/lesson\/?[^?#]*)/)
  return m ? <Navigate to={m[1]} replace /> : null
}

const App = () => {
  // 로컬 스토리지의 토큰 존재 여부로 초기 로그인 상태 설정
  const [user, setUser] = useState(() => (getToken() ? readJSON('user', null) : null))

  const login = useCallback(({ token, user: u }) => {
    localStorage.setItem('token', token)
    writeJSON('user', u)
    setUser(u)
    syncRecords().catch(() => {})
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    clearRecords()
  }, [])

  // 앱 시작 시 토큰이 아직 유효한지 확인하고, 서버 기록으로 로컬 캐시를 갱신
  useEffect(() => {
    if (!getToken()) return
    api
      .get('/users/me')
      .then(({ data }) => {
        const u = { id: data.id, email: data.email, nickname: data.nickname }
        writeJSON('user', u)
        setUser(u)
        return syncRecords()
      })
      .catch((err) => {
        if (err?.response?.status === 401 || err?.response?.status === 403) logout()
      })
  }, [logout])

  return (
    <>
      <LegacyHashRedirect />
      <Routes>
        <Route element={<Layout user={user} login={login} logout={logout} />}>
          <Route path="/" element={<Landing />} />
          <Route path="/lesson" element={<PracticeRoute />} />
          <Route path="/lesson/:id" element={<PracticeRoute />} />
          {/* 인증 관련 라우트 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/mypage" element={<RequireAuth><MyPage /></RequireAuth>} />
          {/* 커뮤니티 레슨 (핵심 데이터 CRUD) */}
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/new" element={<RequireAuth><SnippetFormPage /></RequireAuth>} />
          <Route path="/community/:id" element={<CommunityPractice />} />
          <Route path="/community/:id/edit" element={<RequireAuth><SnippetFormPage key="edit" /></RequireAuth>} />
          {/* JOIN 결과 조회 */}
          <Route path="/join" element={<JoinPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
