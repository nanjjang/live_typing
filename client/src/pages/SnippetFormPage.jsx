import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import PageShell from '../components/PageShell.jsx'
import { FormGrid as Grid, Notice, Panel } from '../components/ui.js'
import { ErrorText } from '../components/authStyles.js'
import api, { errorMessage } from '../lib/api.js'
import { communityHref, TRACK_OPTIONS } from '../lib/community.js'

const EMPTY = { title: '', track: 'html', summary: '', code: '', base_html: '' }

const PLACEHOLDER = {
  html: '<div class="card">\n  <h1>Hello</h1>\n  <p>Type me.</p>\n</div>',
  css: '.card {\n  padding: 24px;\n  border-radius: 12px;\n  background: #0071e3;\n  color: white;\n}',
  js: "const btn = document.querySelector('button');\nbtn.addEventListener('click', () => {\n  btn.textContent = 'Clicked!';\n});",
}
const BASE_PLACEHOLDER = {
  css: '<div class="card">스타일을 입힐 HTML</div>',
  js: '<button>Click me</button>',
}

// 커뮤니티 레슨 등록(/community/new) + 수정(/community/:id/edit)
export default function SnippetFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [blocked, setBlocked] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // 수정 모드: 기존 내용을 불러오고, 본인 글이 아니면 막는다
  useEffect(() => {
    if (!isEdit) return
    api
      .get(`/snippets/${id}`)
      .then(({ data }) => {
        if (data.user_id !== user.id) {
          setBlocked('본인이 작성한 레슨만 수정할 수 있습니다.')
          return
        }
        setForm({
          title: data.title,
          track: data.track,
          summary: data.summary || '',
          code: data.code,
          base_html: data.base_html || '',
        })
      })
      .catch((err) => setBlocked(errorMessage(err, '레슨을 불러오지 못했습니다.')))
      .finally(() => setLoading(false))
  }, [id, isEdit, user.id])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  // textarea에서 Tab 키로 공백 2칸 넣기
  const onCodeKey = (key) => (e) => {
    if (e.key !== 'Tab' || e.shiftKey) return
    e.preventDefault()
    const el = e.currentTarget
    const { selectionStart: a, selectionEnd: b, value } = el
    const next = value.slice(0, a) + '  ' + value.slice(b)
    setForm((f) => ({ ...f, [key]: next }))
    requestAnimationFrame(() => el.setSelectionRange(a + 2, a + 2))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/snippets/${id}`, form)
        navigate(communityHref(id))
      } else {
        const { data } = await api.post('/snippets', form)
        navigate(communityHref(data.id))
      }
    } catch (err) {
      setError(errorMessage(err, '저장하지 못했습니다.'))
      setSaving(false)
    }
  }

  const title = isEdit ? '레슨 수정' : '레슨 올리기'

  if (loading || blocked) {
    return (
      <PageShell title={title} width="760px">
        <Notice role={blocked ? 'alert' : undefined}>{blocked || '불러오는 중…'}</Notice>
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow={isEdit ? `community / ${id} / edit` : 'community / new'}
      title={title}
      sub="다른 회원이 따라 칠 코드를 올려 주세요. 코드는 영문·숫자·기호만 쓸 수 있고, 탭은 공백 2칸으로 바뀝니다."
      width="760px"
    >
      <Panel as="form" onSubmit={handleSubmit}>
        <Grid>
          <label>
            <span>제목</span>
            <input required maxLength={100} value={form.title} onChange={set('title')} placeholder="예: 둥근 버튼 만들기" />
          </label>

          <fieldset>
            <legend>언어</legend>
            <div className="seg">
              {TRACK_OPTIONS.map((t) => (
                <label key={t.id} className={form.track === t.id ? 'on' : undefined}>
                  <input type="radio" name="track" value={t.id} checked={form.track === t.id} onChange={set('track')} />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            <span>한 줄 설명 (선택)</span>
            <input maxLength={200} value={form.summary} onChange={set('summary')} placeholder="무엇을 만드는 코드인가요?" />
          </label>

          <label>
            <span>따라 칠 코드</span>
            <textarea
              className="code"
              required
              rows={12}
              spellCheck={false}
              value={form.code}
              onChange={set('code')}
              onKeyDown={onCodeKey('code')}
              placeholder={PLACEHOLDER[form.track]}
            />
          </label>

          {form.track !== 'html' && (
            <label>
              <span>미리보기용 HTML (선택 · 따라 치지 않음)</span>
              <textarea
                className="code"
                rows={5}
                spellCheck={false}
                value={form.base_html}
                onChange={set('base_html')}
                onKeyDown={onCodeKey('base_html')}
                placeholder={BASE_PLACEHOLDER[form.track]}
              />
              <small>
                {form.track === 'css' ? 'CSS가 적용될 HTML입니다.' : '스크립트가 다룰 HTML입니다.'} 미리보기 화면에만 쓰입니다.
              </small>
            </label>
          )}

          {error && <ErrorText role="alert">{error}</ErrorText>}

          <div className="row">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
              취소
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? '저장 중…' : isEdit ? '수정 완료' : '등록하기'}
            </button>
          </div>
        </Grid>
      </Panel>
    </PageShell>
  )
}
