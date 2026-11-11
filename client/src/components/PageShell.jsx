import { useEffect } from 'react'
import styled from 'styled-components'
import SiteHeader from './SiteHeader.jsx'

// 일반 화면 공용 틀: 상단 메뉴 + 제목 + 본문
export default function PageShell({ title, eyebrow, sub, actions, children, width }) {
  useEffect(() => {
    document.title = `${title} — livetype`
  }, [title])
  return (
    <Wrap>
      <SiteHeader />
      <Main style={width ? { maxWidth: width } : undefined}>
        <Head>
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {sub && <p className="sub">{sub}</p>}
          </div>
          {actions && <div className="actions">{actions}</div>}
        </Head>
        {children}
      </Main>
    </Wrap>
  )
}

const Wrap = styled.div`
  min-height: 100vh;
  background: var(--bg);
`

const Main = styled.main`
  max-width: var(--content);
  margin: 0 auto;
  padding: var(--sp-8) var(--pad-x) var(--sp-9);

  @media (max-width: 480px) {
    padding-top: var(--sp-6);
  }
`

const Head = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--sp-5);
  flex-wrap: wrap;
  margin-bottom: var(--sp-7);

  .eyebrow {
    margin: 0 0 var(--sp-2);
    font-family: var(--f-mono);
    font-size: var(--fs-micro);
    letter-spacing: 0.04em;
    color: var(--text-3);
  }
  h1 {
    margin: 0;
    font-size: var(--fs-h2);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }
  .sub {
    margin: var(--sp-3) 0 0;
    color: var(--text-2);
    max-width: 36em;
  }
  .actions {
    display: flex;
    gap: var(--sp-2);
  }
`
