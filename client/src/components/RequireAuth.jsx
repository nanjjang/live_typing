import { Navigate, useLocation, useOutletContext } from 'react-router-dom'

// 로그인한 회원만 볼 수 있는 화면을 감싼다. 로그인 안 했으면 로그인 화면으로 보내고, 끝나면 돌아온다.
export default function RequireAuth({ children }) {
  const { user } = useOutletContext()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
