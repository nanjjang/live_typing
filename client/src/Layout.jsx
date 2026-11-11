import { Outlet } from 'react-router-dom'

// 각 페이지가 자체 헤더를 갖고 있으므로 Layout은 로그인 상태만 하위 페이지로 내려준다.
// 하위 페이지에서는 useOutletContext()로 { user, login, logout }을 꺼내 쓴다.
const Layout = ({ user, login, logout }) => {
  return <Outlet context={{ user, login, logout }} />
}

export default Layout
