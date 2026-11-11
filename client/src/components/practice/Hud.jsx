import { fmtAcc, fmtTime } from '../../lib/stats.js'

/** Inline stat pairs for the top bar: label (small, gray) + value (tabular). */
export default function Hud({ wpm, acc, prog, ms, className = '' }) {
  const cells = [
    { k: 'wpm', label: '속도', value: Math.round(wpm), unit: 'WPM' },
    { k: 'acc', label: '정확도', value: `${fmtAcc(acc)}%`, warn: acc < 90 },
    { k: 'prog', label: '진행', value: `${Math.floor(prog * 100)}%` },
    { k: 'time', label: '시간', value: fmtTime(ms) },
  ]
  return (
    <dl className={`hud ${className}`}>
      {cells.map((c) => (
        <div key={c.k} className={`hud-cell hud-${c.k}${c.warn ? ' is-warn' : ''}`}>
          <dt>{c.label}</dt>
          <dd>
            {c.value}
            {c.unit && <span className="hud-unit"> {c.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}
