import axios from 'axios'

// 모든 백엔드 요청은 /api 로 보낸다 (개발: Vite 프록시, 배포: nginx 프록시가 Express로 전달)
const api = axios.create({ baseURL: '/api' })

export function getToken() {
  try {
    return localStorage.getItem('token')
  } catch {
    return null
  }
}

// 로그인 토큰이 있으면 Authorization 헤더에 자동으로 실어 보낸다
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const errorMessage = (err, fallback = '요청을 처리하지 못했습니다.') =>
  err?.response?.data?.message || fallback

export default api
