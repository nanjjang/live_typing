import { Link } from 'react-router-dom'

export default function Wordmark({ size, href = '/', label = 'livetype 처음으로' }) {
  return (
    <Link className="wordmark" to={href} style={size ? { fontSize: size } : undefined} aria-label={label}>
      <span className="wordmark-caret" aria-hidden="true" />
      livetype
    </Link>
  )
}
