import { useCallback, useEffect, useState } from 'react'
import api, { errorMessage } from './api.js'

// 커뮤니티 레슨 목록 불러오기 + 삭제 (params 예: { track: 'css' }, { user: 3 })
export function useSnippets(params) {
  const key = JSON.stringify(params || {})
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    api
      .get('/snippets', { params: JSON.parse(key) })
      .then(({ data }) => alive && (setList(data), setError('')))
      .catch((err) => alive && setError(errorMessage(err, '레슨 목록을 불러오지 못했습니다.')))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [key])

  const remove = useCallback(async (s) => {
    if (!window.confirm(`'${s.title}' 레슨을 삭제할까요? 되돌릴 수 없습니다.`)) return
    try {
      await api.delete(`/snippets/${s.id}`)
      setList((l) => l.filter((x) => x.id !== s.id))
    } catch (err) {
      window.alert(errorMessage(err, '삭제하지 못했습니다.'))
    }
  }, [])

  return { list, loading, error, remove }
}
