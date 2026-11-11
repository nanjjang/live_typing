import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import styled from 'styled-components'
import PageShell from '../components/PageShell.jsx'
import SnippetCard from '../components/community/SnippetCard.jsx'
import { CardGrid, Notice } from '../components/ui.js'
import { TRACK_OPTIONS } from '../lib/community.js'
import { useSnippets } from '../lib/useSnippets.js'

// 커뮤니티 레슨 전체 목록 (모든 회원이 올린 레슨, 로그인 없이도 볼 수 있음)
export default function CommunityPage() {
  const { user } = useOutletContext()
  const [track, setTrack] = useState('')
  const { list, loading, error, remove } = useSnippets(track ? { track } : null)

  return (
    <PageShell
      eyebrow="community"
      title="커뮤니티 레슨"
      sub="회원들이 직접 올린 연습 코드입니다. 카드를 누르면 바로 따라 칠 수 있어요."
      actions={
        <Link className="btn" to={user ? '/community/new' : '/login'} state={user ? undefined : { from: '/community/new' }}>
          + 레슨 올리기
        </Link>
      }
    >
      <Filters role="group" aria-label="언어 필터">
        {[{ id: '', label: '전체' }, ...TRACK_OPTIONS].map((t) => (
          <button key={t.id} type="button" className="chip" aria-pressed={track === t.id} onClick={() => setTrack(t.id)}>
            {t.label}
          </button>
        ))}
        {!loading && !error && <span className="count">{list.length}개</span>}
      </Filters>

      {loading ? (
        <Notice>불러오는 중…</Notice>
      ) : error ? (
        <Notice role="alert">{error}</Notice>
      ) : list.length === 0 ? (
        <Notice>아직 올라온 레슨이 없습니다. 첫 레슨을 올려 보세요.</Notice>
      ) : (
        <CardGrid>
          {list.map((s) => (
            <SnippetCard key={s.id} snippet={s} isMine={user?.id === s.user_id} onDelete={remove} />
          ))}
        </CardGrid>
      )}
    </PageShell>
  )
}

const Filters = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-bottom: var(--sp-5);

  .count {
    margin-left: auto;
    font-family: var(--f-mono);
    font-size: var(--fs-micro);
    color: var(--text-3);
  }
`
