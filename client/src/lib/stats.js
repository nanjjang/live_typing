// Pure helpers over typing-engine state.

export function elapsedMs(s, now) {
  if (s.startedAt === null) return 0
  const end = s.finishedAt ?? s.pausedAt ?? now
  return Math.max(0, end - s.startedAt - s.pausedTotal)
}

export function typedCorrect(s) {
  let n = 0
  for (const e of s.entries) if (e.ok && !e.auto) n++
  return n
}

/** Session average: (correct chars / 5) / minutes. */
export function averageWpm(s, now) {
  const ms = elapsedMs(s, now)
  if (ms < 1000) return 0
  return typedCorrect(s) / 5 / (ms / 60000)
}

/** Rolling 5-second window, used while typing. */
export function liveWpm(s, now, windowMs = 5000) {
  if (s.status === 'done') return averageWpm(s, now)
  if (s.status !== 'running') return averageWpm(s, now)
  const span = Math.min(windowMs, elapsedMs(s, now))
  if (span < 1500) return 0
  const from = now - span
  let n = 0
  for (let i = s.hits.length - 1; i >= 0 && s.hits[i] >= from; i--) n++
  return n / 5 / (span / 60000)
}

export function accuracy(s) {
  if (!s.keystrokes) return 100
  return (s.correctKeys / s.keystrokes) * 100
}

export function progress(s) {
  if (!s.target.length) return 0
  let ok = 0
  for (const e of s.entries) if (e.ok) ok++
  return ok / s.target.length
}

export function remaining(s) {
  return Math.max(0, s.target.length - s.entries.length)
}

export function caretLineCol(s) {
  const t = s.target
  const i = s.entries.length
  const lineStart = t.lastIndexOf('\n', i - 1) + 1
  let line = 0
  for (let k = 0; k < lineStart; k++) if (t[k] === '\n') line++
  return { line, col: i - lineStart }
}

export function topMisses(s, n = 5) {
  return Object.entries(s.miss)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
}

export function fmtTime(ms) {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const sec = total % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function fmtAcc(a) {
  return a >= 99.95 ? '100' : a.toFixed(1)
}

export function glyphOf(ch) {
  if (ch === ' ') return '·'
  if (ch === '\n') return '¬'
  return ch
}

/** Text sent to the preview: strict mode stops at the pending error. */
export function typedText(s) {
  let out = ''
  for (const e of s.entries) {
    if (!e.ok && s.opts.maxErrors === 1) break
    out += e.ch
  }
  return out
}
