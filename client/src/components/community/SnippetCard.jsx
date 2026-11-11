import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { communityHref, formatDate, lineCount, TRACK_LABEL } from '../../lib/community.js'

// 커뮤니티 레슨 카드. isMine이면 수정/삭제 버튼을 보여 준다.
export default function SnippetCard({ snippet: s, isMine, onDelete }) {
  const preview = s.code.split('\n').slice(0, 5).join('\n')
  return (
    <Card>
      <Link className="body" to={communityHref(s.id)} aria-label={`${s.title} 연습하기`}>
        <div className="meta">
          <span className="tag">{TRACK_LABEL[s.track] || s.track}</span>
          <span>{lineCount(s.code)}줄</span>
        </div>
        <h3>{s.title}</h3>
        {s.summary && <p className="summary">{s.summary}</p>}
        <pre aria-hidden="true">{preview}</pre>
      </Link>
      <footer>
        <span className="by">
          {s.author}
          {isMine && <em>내 레슨</em>}
          <span className="dot">·</span>
          {formatDate(s.created_at)}
        </span>
        {isMine && (
          <span className="own">
            <Link to={`${communityHref(s.id)}/edit`}>수정</Link>
            <button type="button" onClick={() => onDelete?.(s)}>
              삭제
            </button>
          </span>
        )}
      </footer>
    </Card>
  )
}

const Card = styled.li`
  list-style: none;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line-2);
  border-radius: var(--radius-l);
  background: var(--bg);
  overflow: hidden;
  transition: border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease);

  &:hover {
    border-color: var(--line);
    box-shadow: var(--shadow-box);
  }

  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: var(--sp-5) var(--sp-5) var(--sp-4);
    color: inherit;
    text-decoration: none;
  }
  .meta {
    display: flex;
    gap: var(--sp-3);
    align-items: center;
    font-family: var(--f-mono);
    font-size: var(--fs-micro);
    color: var(--text-3);
  }
  .tag {
    padding: 2px 8px;
    border-radius: var(--pill);
    background: var(--bg-2);
    color: var(--text-2);
  }
  h3 {
    margin: var(--sp-3) 0 0;
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.3;
  }
  .body:hover h3 {
    color: var(--accent);
  }
  .summary {
    margin: var(--sp-1) 0 0;
    font-size: var(--fs-small);
    color: var(--text-2);
  }
  pre {
    margin: var(--sp-4) 0 0;
    padding: var(--sp-3) var(--sp-4);
    border-radius: var(--radius-s);
    background: var(--ed-bg);
    color: var(--ed-dim);
    font-family: var(--f-mono);
    font-size: 12px;
    line-height: 1.6;
    overflow: hidden;
    white-space: pre;
    mask-image: linear-gradient(#000 60%, transparent);
  }
  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-3);
    padding: var(--sp-3) var(--sp-5);
    border-top: 1px solid var(--line-2);
    font-size: 13px;
    color: var(--text-2);
  }
  .by em {
    margin-left: 6px;
    font-style: normal;
    font-size: 11px;
    font-weight: 600;
    color: var(--accent);
  }
  .dot {
    margin: 0 6px;
    color: var(--text-3);
  }
  .own {
    display: flex;
    gap: var(--sp-3);
  }
  .own a,
  .own button {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: var(--text-2);
    text-decoration: none;
    cursor: pointer;
  }
  .own a:hover {
    color: var(--accent);
  }
  .own button:hover {
    color: var(--err);
  }
`
