import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PageShell from '../components/PageShell.jsx'
import { Notice } from '../components/ui.js'
import api, { errorMessage } from '../lib/api.js'
import { toLesson } from '../lib/community.js'
import Practice from './Practice.jsx'

// 커뮤니티 레슨 하나를 불러와 기존 연습 화면으로 보여 준다
export default function CommunityPractice() {
  const { id } = useParams()
  const [state, setState] = useState({ id: null, lesson: null, error: '' })

  useEffect(() => {
    let alive = true
    api
      .get(`/snippets/${id}`)
      .then(({ data }) => alive && setState({ id, lesson: toLesson(data), error: '' }))
      .catch((err) => alive && setState({ id, lesson: null, error: errorMessage(err, '레슨을 불러오지 못했습니다.') }))
    return () => {
      alive = false
    }
  }, [id])

  if (state.id !== id || !state.lesson) {
    return (
      <PageShell title="커뮤니티 레슨" width="760px">
        <Notice role={state.error ? 'alert' : undefined}>{state.id === id && state.error ? state.error : '불러오는 중…'}</Notice>
      </PageShell>
    )
  }
  return <Practice key={state.lesson.id} lesson={state.lesson} />
}
