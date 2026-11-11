import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import PageShell from '../components/PageShell.jsx'
import { Notice, Panel } from '../components/ui.js'
import api, { errorMessage } from '../lib/api.js'
import { communityHref, formatDate, TRACK_LABEL } from '../lib/community.js'

// JOIN 결과 조회 메뉴: users ⨝ snippets
export default function JoinPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/join/authors')
      .then(({ data: d }) => setData(d))
      .catch((err) => setError(errorMessage(err, 'JOIN 결과를 불러오지 못했습니다.')))
  }, [])

  return (
    <PageShell
      eyebrow="users ⨝ snippets"
      title="작성자 현황"
      sub="회원(users) 테이블과 커뮤니티 레슨(snippets) 테이블을 JOIN 해서, 누가 어떤 레슨을 올렸는지 보여 줍니다."
    >
      {error ? (
        <Notice role="alert">{error}</Notice>
      ) : !data ? (
        <Notice>불러오는 중…</Notice>
      ) : (
        <>
          <Panel>
            <h2>작성자별 레슨 수</h2>
            <p className="panel-sub">INNER JOIN 후 회원별로 GROUP BY 한 결과입니다.</p>
            <Sql>{data.summary.sql}</Sql>
            {data.summary.rows.length === 0 ? (
              <Notice>JOIN 결과가 없습니다. 레슨이 올라오면 여기에 나타납니다.</Notice>
            ) : (
              <TableWrap>
                <table>
                  <thead>
                    <tr>
                      <th>순위</th>
                      <th>닉네임</th>
                      <th className="num">전체</th>
                      <th className="num">HTML</th>
                      <th className="num">CSS</th>
                      <th className="num">JS</th>
                      <th>최근 등록</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.summary.rows.map((r, i) => (
                      <tr key={r.id}>
                        <td className="mono">{i + 1}</td>
                        <td className="strong">{r.nickname}</td>
                        <td className="num strong">{r.snippet_count}</td>
                        <td className="num">{r.html_count}</td>
                        <td className="num">{r.css_count}</td>
                        <td className="num">{r.js_count}</td>
                        <td className="mono">{formatDate(r.last_posted)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </Panel>

          <Panel>
            <h2>레슨 × 작성자 전체 목록</h2>
            <p className="panel-sub">레슨 한 줄마다 작성자 정보를 붙인 JOIN 결과입니다. ({data.detail.rows.length}행)</p>
            <Sql>{data.detail.sql}</Sql>
            {data.detail.rows.length > 0 && (
              <TableWrap>
                <table>
                  <thead>
                    <tr>
                      <th className="num">s.id</th>
                      <th>s.title</th>
                      <th>s.track</th>
                      <th>s.created_at</th>
                      <th>u.nickname</th>
                      <th>u.created_at (가입일)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.detail.rows.map((r) => (
                      <tr key={r.id}>
                        <td className="num mono">{r.id}</td>
                        <td>
                          <Link to={communityHref(r.id)}>{r.title}</Link>
                        </td>
                        <td>{TRACK_LABEL[r.track] || r.track}</td>
                        <td className="mono">{formatDate(r.created_at)}</td>
                        <td className="strong">{r.nickname}</td>
                        <td className="mono">{formatDate(r.joined_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </Panel>
        </>
      )}
    </PageShell>
  )
}

const Sql = styled.pre`
  margin: 0 0 var(--sp-5);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--radius);
  background: var(--ed-bg);
  color: var(--ed-text);
  font-family: var(--f-mono);
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
`

const TableWrap = styled.div`
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--fs-small);
    white-space: nowrap;
  }
  th {
    text-align: left;
    font-family: var(--f-mono);
    font-size: var(--fs-micro);
    font-weight: 500;
    color: var(--text-3);
    padding: 0 var(--sp-3) var(--sp-2);
    border-bottom: 1px solid var(--line);
  }
  td {
    padding: var(--sp-3);
    border-bottom: 1px solid var(--line-2);
  }
  .num {
    text-align: right;
  }
  .mono {
    font-family: var(--f-mono);
    font-size: 13px;
    color: var(--text-2);
  }
  .strong {
    font-weight: 600;
  }
  a {
    color: var(--text);
    text-decoration: none;
  }
  a:hover {
    color: var(--accent);
  }
`
