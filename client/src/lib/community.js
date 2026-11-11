// 커뮤니티 레슨(snippets 테이블) 관련 공용 도우미

export const TRACK_OPTIONS = [
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'js', label: 'JavaScript' },
]

export const TRACK_LABEL = Object.fromEntries(TRACK_OPTIONS.map((t) => [t.id, t.label]))

export const communityHref = (id) => `/community/${id}`

const lineCount = (code) => String(code || '').split('\n').length

// 서버에서 받은 snippet 한 줄 -> 연습 화면(Practice)이 쓰는 lesson 객체
export function toLesson(s) {
  return {
    id: `community-${s.id}`,
    track: s.track,
    title: s.title,
    summary: s.summary,
    code: s.code,
    lines: lineCount(s.code),
    scaffold: s.base_html ? { html: s.base_html } : {},
  }
}

export { lineCount }

export function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
