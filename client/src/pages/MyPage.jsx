import { useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import styled from 'styled-components'
import PageShell from '../components/PageShell.jsx'
import SnippetCard from '../components/community/SnippetCard.jsx'
import { CardGrid, FormGrid as Grid, Notice, Panel } from '../components/ui.js'
import { ErrorText } from '../components/authStyles.js'
import api, { errorMessage } from '../lib/api.js'
import { formatDate } from '../lib/community.js'
import { useSnippets } from '../lib/useSnippets.js'

// 마이페이지: 프로필 조회(Read) · 수정(Update) · 회원 탈퇴(Delete) + 내가 올린 레슨
export default function MyPage() {
  const { user, login, logout } = useOutletContext()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const mine = useSnippets({ user: user.id })

  // 수정 폼
  const [nickname, setNickname] = useState(user.nickname)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState({ ok: '', err: '' })
  const [saving, setSaving] = useState(false)

  // 탈퇴 폼
  const [leavePw, setLeavePw] = useState('')
  const [leaveErr, setLeaveErr] = useState('')

  useEffect(() => {
    api
      .get('/users/me')
      .then(({ data }) => setProfile(data))
      .catch((err) => setMsg({ ok: '', err: errorMessage(err, '회원 정보를 불러오지 못했습니다.') }))
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setMsg({ ok: '', err: '' })
    if (newPassword && newPassword !== confirm) {
      setMsg({ ok: '', err: '새 비밀번호가 서로 다릅니다.' })
      return
    }
    setSaving(true)
    try {
      const body = { nickname, ...(newPassword ? { currentPassword, newPassword } : {}) }
      const { data } = await api.put('/users/me', body)
      login(data) // 새 토큰과 닉네임으로 로그인 상태 갱신
      setProfile((p) => ({ ...p, nickname: data.user.nickname }))
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
      setMsg({ ok: data.message, err: '' })
    } catch (err) {
      setMsg({ ok: '', err: errorMessage(err, '수정하지 못했습니다.') })
    } finally {
      setSaving(false)
    }
  }

  const handleLeave = async (e) => {
    e.preventDefault()
    setLeaveErr('')
    if (!window.confirm('정말 탈퇴할까요? 올린 레슨과 연습 기록이 모두 삭제되며 되돌릴 수 없습니다.')) return
    try {
      await api.delete('/users/me', { data: { password: leavePw } })
      logout()
      window.alert('회원 탈퇴가 완료되었습니다.')
      navigate('/', { replace: true })
    } catch (err) {
      setLeaveErr(errorMessage(err, '탈퇴하지 못했습니다.'))
    }
  }

  return (
    <PageShell eyebrow="mypage" title="마이페이지" sub="내 정보를 확인하고 바꿀 수 있습니다." width="880px">
      <Panel>
        <h2>내 정보</h2>
        <Info>
          <div>
            <dt>이메일</dt>
            <dd>{profile?.email ?? user.email}</dd>
          </div>
          <div>
            <dt>닉네임</dt>
            <dd>{profile?.nickname ?? user.nickname}</dd>
          </div>
          <div>
            <dt>가입일</dt>
            <dd>{profile ? formatDate(profile.created_at) : '—'}</dd>
          </div>
          <div>
            <dt>올린 레슨</dt>
            <dd>{mine.loading ? '—' : `${mine.list.length}개`}</dd>
          </div>
        </Info>
      </Panel>

      <Panel as="form" onSubmit={handleUpdate}>
        <h2>프로필 수정</h2>
        <p className="panel-sub">비밀번호를 바꾸지 않으려면 비밀번호 칸은 비워 두세요.</p>
        <Grid>
          <label>
            <span>이메일 (변경 불가)</span>
            <input value={user.email} disabled />
          </label>
          <label>
            <span>닉네임</span>
            <input required maxLength={50} value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </label>
          <Two>
            <label>
              <span>현재 비밀번호</span>
              <input
                type="password"
                autoComplete="current-password"
                required={Boolean(newPassword)}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </label>
            <label>
              <span>새 비밀번호 (6자 이상)</span>
              <input
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>
            <label>
              <span>새 비밀번호 확인</span>
              <input
                type="password"
                autoComplete="new-password"
                required={Boolean(newPassword)}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
          </Two>
          {msg.err && <ErrorText role="alert">{msg.err}</ErrorText>}
          {msg.ok && <OkText role="status">{msg.ok}</OkText>}
          <div className="row">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? '저장 중…' : '수정 저장'}
            </button>
          </div>
        </Grid>
      </Panel>

      <Panel>
        <MineHead>
          <h2>내가 올린 레슨</h2>
          <Link className="btn-secondary btn--sm" to="/community/new">
            + 레슨 올리기
          </Link>
        </MineHead>
        {mine.loading ? (
          <Notice>불러오는 중…</Notice>
        ) : mine.list.length === 0 ? (
          <Notice>아직 올린 레슨이 없습니다.</Notice>
        ) : (
          <CardGrid>
            {mine.list.map((s) => (
              <SnippetCard key={s.id} snippet={s} isMine onDelete={mine.remove} />
            ))}
          </CardGrid>
        )}
      </Panel>

      <Panel as="form" onSubmit={handleLeave} className="danger">
        <h2>회원 탈퇴</h2>
        <p className="panel-sub">탈퇴하면 계정과 함께 올린 레슨, 연습 기록이 모두 삭제됩니다.</p>
        <Grid>
          <label>
            <span>비밀번호 확인</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={leavePw}
              onChange={(e) => setLeavePw(e.target.value)}
            />
          </label>
          {leaveErr && <ErrorText role="alert">{leaveErr}</ErrorText>}
          <div className="row">
            <DangerButton type="submit" className="btn">
              회원 탈퇴
            </DangerButton>
          </div>
        </Grid>
      </Panel>
    </PageShell>
  )
}

const Info = styled.dl`
  margin: var(--sp-4) 0 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--sp-4);

  dt {
    font-family: var(--f-mono);
    font-size: var(--fs-micro);
    color: var(--text-3);
  }
  dd {
    margin: var(--sp-1) 0 0;
    font-weight: 600;
    overflow-wrap: anywhere;
  }
`

const Two = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--sp-4);
`

const MineHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-5);
  h2 {
    margin: 0;
  }
`

const OkText = styled.p`
  margin: 0;
  color: var(--ok);
  font-size: var(--fs-small);
`

const DangerButton = styled.button`
  &.btn {
    background: var(--err);
  }
  &.btn:hover {
    background: #c20000;
  }
`
