import styled from 'styled-components'

// 일반 화면 공용 스타일 컴포넌트

// 페이지 안의 흰 카드 영역
export const Panel = styled.section`
  border: 1px solid var(--line-2);
  border-radius: var(--radius-l);
  padding: var(--sp-6);
  background: var(--bg);

  & + & {
    margin-top: var(--sp-5);
  }
  h2 {
    margin: 0 0 var(--sp-2);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .panel-sub {
    margin: 0 0 var(--sp-5);
    color: var(--text-2);
    font-size: var(--fs-small);
  }

  @media (max-width: 480px) {
    padding: var(--sp-5);
  }
`

export const Notice = styled.p`
  margin: 0;
  padding: var(--sp-6) 0;
  text-align: center;
  color: var(--text-2);
  font-size: var(--fs-small);
`

export const CardGrid = styled.ul`
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--sp-4);
`

// 폼 입력칸 묶음 (레슨 등록, 마이페이지)
export const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);

  label,
  fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
    margin: 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }
  label > span,
  legend {
    padding: 0;
    font-size: var(--fs-small);
    font-weight: 600;
  }
  small {
    font-size: 12px;
    color: var(--text-3);
  }
  input:not([type='radio']),
  textarea {
    width: 100%;
    padding: 10px var(--sp-4);
    border: 1px solid var(--line);
    border-radius: var(--radius-s);
    font: inherit;
    font-size: 16px;
    color: var(--text);
    background: var(--bg);
    transition: border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease);
  }
  input:not([type='radio']) {
    height: 44px;
  }
  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  input:disabled {
    background: var(--bg-2);
    color: var(--text-2);
  }
  textarea.code {
    resize: vertical;
    font-family: var(--f-mono);
    font-size: 14px;
    line-height: 1.6;
    background: var(--ed-bg);
    color: var(--ed-text);
    border-color: var(--ed-rule);
    tab-size: 2;
  }
  textarea.code::placeholder {
    color: var(--ed-ghost);
  }
  .seg {
    display: inline-flex;
    align-self: flex-start;
    padding: 3px;
    border-radius: var(--pill);
    background: var(--bg-2);
  }
  .seg label {
    flex-direction: row;
    padding: 6px 16px;
    border-radius: var(--pill);
    font-size: var(--fs-small);
    cursor: pointer;
    color: var(--text-2);
  }
  .seg label.on {
    background: var(--bg);
    color: var(--text);
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .seg label:has(input:focus-visible) {
    outline: 2px solid var(--accent);
  }
  .seg input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  .row {
    display: flex;
    justify-content: flex-end;
    gap: var(--sp-2);
  }
`
