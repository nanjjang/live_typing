import styled from 'styled-components'

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  margin-top: var(--sp-6);

  .btn {
    width: 100%;
    margin-top: var(--sp-2);
  }
`

export const ErrorText = styled.p`
  color: var(--err);
  font-size: var(--fs-small);
  margin: 0;
`
