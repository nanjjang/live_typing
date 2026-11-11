import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import AuthCard, { Field } from '../components/AuthCard.jsx'
import { ErrorText, Form } from '../components/authStyles.js'
import api, { errorMessage } from '../lib/api.js'

const LoginPage = () => {
  const { login } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = '로그인 — livetype'
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/users/login', { email, password })
      login(data)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      // 회원이 아니면(404) 회원가입 화면으로 안내
      if (err?.response?.status === 404) {
        navigate('/signup', { state: { email } })
        return
      }
      setError(errorMessage(err, '로그인에 실패했습니다.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="로그인"
      sub="로그인하면 연습 기록이 서버에 저장됩니다."
      footer={
        <>
          아직 계정이 없나요? <Link to="/signup">회원가입</Link>
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        <Field label="이메일" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <ErrorText role="alert">{error}</ErrorText>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? '로그인 중…' : '로그인'}
        </button>
      </Form>
    </AuthCard>
  )
}

export default LoginPage
