import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import AuthCard, { Field } from '../components/AuthCard.jsx'
import { ErrorText, Form } from '../components/authStyles.js'
import api, { errorMessage } from '../lib/api.js'

const SignupPage = () => {
  const { login } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: location.state?.email || '', nickname: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = '회원가입 — livetype'
  }, [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('비밀번호가 서로 다릅니다.')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/users/signup', {
        email: form.email,
        nickname: form.nickname,
        password: form.password,
      })
      login(data) // 가입 즉시 자동 로그인
      navigate('/', { replace: true })
    } catch (err) {
      setError(errorMessage(err, '회원가입에 실패했습니다.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="회원가입"
      sub="계정을 만들면 어느 기기에서든 기록이 이어집니다."
      footer={
        <>
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        <Field label="이메일" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
        <Field label="닉네임" autoComplete="nickname" required maxLength={50} value={form.nickname} onChange={set('nickname')} />
        <Field
          label="비밀번호 (6자 이상)"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={form.password}
          onChange={set('password')}
        />
        <Field label="비밀번호 확인" type="password" autoComplete="new-password" required value={form.confirm} onChange={set('confirm')} />
        {error && <ErrorText role="alert">{error}</ErrorText>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? '가입 중…' : '가입하기'}
        </button>
      </Form>
    </AuthCard>
  )
}

export default SignupPage
