import { memo, useLayoutEffect, useMemo, useRef } from 'react'
import { classify } from '../lib/highlight.js'
import { glyphOf } from '../lib/stats.js'

/*
 * Editor: the untyped code is a monochrome ghost; typed characters light up
 * with muted syntax colors. Purely presentational — the typing engine state
 * comes in as props.
 */

const Line = memo(function Line({ text, start, no, typed, autoN, errs, cur, last, cls, nudge, showLead, gutter }) {
  const errMap = errs
    ? new Map(errs.split('\u0001').map((p) => [Number(p.slice(0, p.indexOf(':'))), p.slice(p.indexOf(':') + 1)]))
    : null
  const lead = text.length - text.trimStart().length
  const end = last ? text.length : text.length + 1
  const cells = []
  for (let c = 0; c < end; c++) {
    const ch = c < text.length ? text[c] : '\n'
    const i = start + c
    if (c < typed) {
      const wrong = errMap ? errMap.get(c) : undefined
      if (wrong !== undefined) {
        const ws = wrong === ' ' || wrong === '\n'
        cells.push(
          <span key={`${c}-${nudge}`} className={ws ? 'cl e ws' : 'cl e'} data-i={i}>
            {glyphOf(wrong)}
            <i className="x" aria-hidden="true">
              {glyphOf(ch)}
            </i>
          </span>,
        )
      } else {
        const k = cls[c] ? ` ${cls[c]}` : ''
        cells.push(
          <span key={c} className={`cl o${k}${c < autoN ? ' a' : ''}`} data-i={i}>
            {ch === '\n' ? '' : ch}
          </span>,
        )
      }
    } else if (ch === '\n') {
      cells.push(
        <span key={c} className="cl g eol" data-i={i}>
          {'↵'}
        </span>,
      )
    } else if (ch === ' ' && showLead && c < lead) {
      cells.push(
        <span key={c} className="cl g sp" data-i={i}>
          {'·'}
        </span>,
      )
    } else {
      cells.push(
        <span key={c} className="cl g" data-i={i}>
          {ch}
        </span>,
      )
    }
  }
  return (
    <div className={cur ? 'row cur' : 'row'}>
      {gutter && (
        <span className="ln" aria-hidden="true">
          {no}
        </span>
      )}
      <span className="code">{cells}</span>
    </div>
  )
})

/**
 * Props :
 *  state        typing engine state (required)
 *  track        'html' | 'css' | 'js' | 'react' — syntax classing
 *  size         'md' (practice) | 'sm' (compact, landing hero)
 *  tabs         [{ name, state: 'active' | 'done' | 'locked' }] — 40px header, omitted when absent
 *  tabsRight    node rendered at the right of the header
 *  gutter       show line numbers (default true)
 *  showLead     show leading indentation as faint dots
 *  dim          paused look (content at 40%)
 *  inputRef / inputProps / inputLabel   hidden textarea that receives keys + IME;
 *               pass no inputProps for a read-only / auto-typed editor
 *  onPointerDown, children (overlays), className
 */
export default function Editor({
  state,
  track = 'html',
  size = 'md',
  tabs,
  tabsRight,
  gutter = true,
  showLead = false,
  dim = false,
  inputRef,
  inputProps,
  inputLabel = '코드 입력',
  onPointerDown,
  children,
  className = '',
}) {
  const target = state.target
  const entries = state.entries
  const n = entries.length

  const lines = useMemo(() => {
    const cls = classify(target, track)
    const out = []
    let start = 0
    const parts = target.split('\n')
    parts.forEach((text, k) => {
      out.push({ text, start, cls: cls.slice(start, start + text.length), last: k === parts.length - 1 })
      start += text.length + 1
    })
    return out
  }, [target, track])

  let caretLine = 0
  for (let k = 0; k < lines.length; k++) if (lines[k].start <= n) caretLine = k

  const scrollRef = useRef(null)
  const linesRef = useRef(null)
  const caretRef = useRef(null)
  const lastLine = useRef(-1)

  useLayoutEffect(() => {
    const host = linesRef.current
    const caret = caretRef.current
    if (!host || !caret) return
    let el = host.querySelector(`[data-i="${n}"]`)
    let x = 0
    let y = 0
    if (el) {
      x = el.offsetLeft
    } else {
      el = host.querySelector(`[data-i="${n - 1}"]`)
      if (el) x = el.offsetLeft + el.offsetWidth
    }
    const row = el ? el.closest('.row') : null
    if (row) y = row.offsetTop
    caret.style.transform = `translate(${x}px, ${y}px)`

    const sc = scrollRef.current
    if (!sc) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lh = row ? row.offsetHeight || 24 : 24
    const top = host.offsetTop + y
    const lineChanged = caretLine !== lastLine.current
    if (lineChanged) {
      lastLine.current = caretLine
      const want = Math.max(0, top - sc.clientHeight * 0.4)
      if (Math.abs(sc.scrollTop - want) > lh / 2) sc.scrollTo({ top: want, behavior: reduce ? 'auto' : 'smooth' })
    }
    const left = host.offsetLeft + x
    const visL = sc.scrollLeft
    const visR = visL + sc.clientWidth
    const gutterW = gutter ? host.querySelector('.ln')?.offsetWidth || 0 : 0
    if (lineChanged || left > visR - 48 || left < visL + gutterW + 16) {
      sc.scrollLeft = left > sc.clientWidth - 64 ? left - sc.clientWidth + 128 : 0
    }
  })

  const rows = lines.map((ln, k) => {
    const typed = Math.max(0, Math.min(n - ln.start, ln.text.length + 1))
    let autoN = 0
    while (autoN < typed && entries[ln.start + autoN].auto) autoN++
    let errs = ''
    for (let c = 0; c < typed; c++) {
      const e = entries[ln.start + c]
      if (!e.ok) errs += (errs ? '\u0001' : '') + c + ':' + e.ch
    }
    const cur = k === caretLine
    return (
      <Line
        key={k}
        no={k + 1}
        text={ln.text}
        start={ln.start}
        cls={ln.cls}
        last={ln.last}
        typed={typed}
        autoN={autoN}
        errs={errs}
        cur={cur}
        nudge={cur ? state.nudge : 0}
        showLead={showLead}
        gutter={gutter}
      />
    )
  })

  return (
    <div
      className={`editor editor--${size}${dim ? ' is-dim' : ''}${tabs ? ' has-tabs' : ''} ${className}`}
      onPointerDown={onPointerDown}
    >
      {tabs && (
        <div className="editor-head">
          <div className="editor-tabs">
            {tabs.map((t) => (
              <span key={t.name} className={`editor-tab is-${t.state}`}>
                {t.name}
              </span>
            ))}
          </div>
          {tabsRight && <div className="editor-head-right">{tabsRight}</div>}
        </div>
      )}
      <div className="editor-scroll" ref={scrollRef}>
        <div className={`editor-lines${gutter ? '' : ' no-gutter'}`} ref={linesRef}>
          {rows}
          <span className="caret" ref={caretRef} aria-hidden="true">
            <span key={n} className="caret-bar" />
          </span>
        </div>
      </div>
      {inputProps && (
        <textarea
          ref={inputRef}
          className="editor-input"
          aria-label={inputLabel}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          rows={1}
          {...inputProps}
        />
      )}
      {children}
    </div>
  )
}
