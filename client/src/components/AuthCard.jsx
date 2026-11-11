import { Link } from 'react-router-dom'
import styled from 'styled-components'

// 로그인/회원가입 화면 공용 틀 (DESIGN.md 토큰 사용)
export default function AuthCard({ title, sub, children, footer }) {
  return (
    <Page>
      <Top>
        <Link className="wordmark" to="/" aria-label="livetype 처음으로">
          <span className="wordmark-caret" aria-hidden="true" />
          livetype
        </Link>
      </Top>
      <Card>
        <h1>{title}</h1>
        {sub && <p className="sub">{sub}</p>}
        {children}
        {footer && <Foot>{footer}</Foot>}
      </Card>
    </Page>
  )
}

export function Field({ label, ...props }) {
  return (
    <FieldWrap>
      <span>{label}</span>
      <input {...props} />
    </FieldWrap>
  )
}

const Page = styled.div`
  min-height: 100vh;
  background: var(--bg-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 var(--pad-x) var(--sp-8);
`

const Top = styled.header`
  width: 100%;
  max-width: var(--content);
  height: var(--nav-h);
  display: flex;
  align-items: center;
`

const Card = styled.main`
  width: 100%;
  max-width: 400px;
  margin-top: clamp(24px, 10vh, 96px);
  background: var(--bg);
  border-radius: var(--radius-l);
  box-shadow: var(--shadow-box);
  padding: var(--sp-7) var(--sp-6);

  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
  }
  .sub {
    margin: var(--sp-2) 0 0;
    color: var(--text-2);
    font-size: var(--fs-small);
  }

  @media (max-width: 480px) {
    padding: var(--sp-6) var(--sp-5);
  }
`

const FieldWrap = styled.label`
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);

  span {
    font-size: var(--fs-small);
    font-weight: 600;
    color: var(--text);
  }
  input {
    height: 44px;
    padding: 0 var(--sp-4);
    border: 1px solid var(--line);
    border-radius: var(--radius-s);
    font: inherit;
    font-size: 16px;
    color: var(--text);
    background: var(--bg);
    transition: border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease);
  }
  input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
`

const Foot = styled.p`
  margin: var(--sp-5) 0 0;
  text-align: center;
  font-size: var(--fs-small);
  color: var(--text-2);

  a {
    color: var(--accent);
    font-weight: 600;
  }
`
