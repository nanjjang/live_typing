import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useOutletContext } from 'react-router-dom'
import Wordmark from './Wordmark.jsx'

// 랜딩을 제외한 일반 화면(커뮤니티, 마이페이지, JOIN)에서 쓰는 상단 메뉴
const MENU = [
  { to: '/lesson', label: '연습' },
  { to: '/community', label: '커뮤니티 레슨' },
  { to: '/join', label: '작성자 현황' },
]

// 좁은 화면에서는 메뉴 링크를 헤더 아래 한 줄로 보여 준다
export function MobileMenu() {
  return (
    <nav className="nav-mobile" aria-label="주요 (모바일)">
      {MENU.map((m) => (
        <NavLink key={m.to} to={m.to} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
          {m.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function UserActions() {
  const { user, logout } = useOutletContext()
  const navigate = useNavigate()
  if (!user) {
    return (
      <>
        <Link className="btn-secondary btn--sm" to="/login">
          로그인
        </Link>
        <Link className="btn btn--sm" to="/signup">
          회원가입
        </Link>
      </>
    )
  }
  return (
    <>
      <Link className="btn-secondary btn--sm" to="/mypage" title="마이페이지">
        <span className="nav-me">{user.nickname}</span>
        <span className="nav-me-sub">마이페이지</span>
      </Link>
      <button
        type="button"
        className="btn-secondary btn--sm"
        onClick={() => {
          logout()
          navigate('/')
        }}
      >
        로그아웃
      </button>
    </>
  )
}

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="nav-in">
        <Wordmark />
        <nav className="nav-links" aria-label="주요">
          {MENU.map((m) => (
            <NavLink key={m.to} to={m.to} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
              {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <UserActions />
        </div>
      </div>
      <MobileMenu />
    </header>
  )
}
