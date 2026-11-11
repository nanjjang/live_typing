import { useMemo, useReducer, useRef } from 'react'

/*
 * Typing engine.
 * State is a pure reducer; every action that depends on time carries `now`.
 * entries[i] = { ch, ok, auto } is what was typed at target position i.
 */

const HANGUL = /[ㄱ-ㆎ가-힣]/

export function normalizeCode(src = '') {
  return String(src)
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, '  ')
    .replace(/[ ]+$/gm, '')
    .replace(/^\n+/, '')
    .replace(/\s+$/, '')
}

function initial(target, opts) {
  return {
    target,
    opts,
    entries: [],
    errCount: 0,
    keystrokes: 0,
    correctKeys: 0,
    wrongKeys: 0,
    miss: {},
    hits: [],
    startedAt: null,
    finishedAt: null,
    pausedAt: null,
    pausedTotal: 0,
    status: 'idle', // idle | running | paused | done
    nudge: 0,
    ime: false,
  }
}

function fillIndent(entries, target) {
  let j = entries.length
  while (j < target.length && target[j] === ' ') {
    entries.push({ ch: ' ', ok: true, auto: true })
    j++
  }
}

function finishIfDone(s, now) {
  if (s.entries.length === s.target.length && s.errCount === 0 && s.target.length > 0) {
    s.status = 'done'
    s.finishedAt = now
    s.pausedAt = null
  }
  return s
}

function resumeInto(s, now) {
  if (s.status === 'paused') {
    s.pausedTotal += now - (s.pausedAt ?? now)
    s.pausedAt = null
    s.status = 'running'
  }
}

function reducer(state, a) {
  switch (a.type) {
    case 'reset':
      return initial(a.target ?? state.target, a.opts ?? state.opts)

    case 'opts':
      return { ...state, opts: { ...state.opts, ...a.opts } }

    case 'input': {
      if (state.status === 'done') return state
      const ch = a.ch
      const i = state.entries.length
      const exp = state.target[i]
      if (HANGUL.test(ch) && !(exp && HANGUL.test(exp))) {
        return state.ime ? state : { ...state, ime: true }
      }
      if (i >= state.target.length || state.errCount >= state.opts.maxErrors) {
        return { ...state, nudge: state.nudge + 1 }
      }
      const s = { ...state, entries: state.entries.slice(), ime: false }
      if (s.startedAt === null) {
        s.startedAt = a.now
        s.status = 'running'
      }
      resumeInto(s, a.now)
      const ok = ch === exp
      s.keystrokes++
      if (ok) {
        s.correctKeys++
        s.hits = s.hits.length > 600 ? s.hits.slice(-300) : s.hits.slice()
        s.hits.push(a.now)
      } else {
        s.wrongKeys++
        s.errCount++
        s.nudge++
        s.miss = { ...s.miss, [exp]: (s.miss[exp] || 0) + 1 }
      }
      s.entries.push({ ch, ok })
      if (ok && ch === '\n' && s.opts.autoIndent && s.errCount === 0) fillIndent(s.entries, s.target)
      return finishIfDone(s, a.now)
    }

    case 'tab': {
      if (state.status === 'done' || state.errCount > 0) return state
      const t = state.target
      const i = state.entries.length
      const lineStart = t.lastIndexOf('\n', i - 1) + 1
      const typedLine = t.slice(lineStart, i)
      if (t[i] !== ' ' || /\S/.test(typedLine)) return { ...state, nudge: state.nudge + 1 }
      const s = { ...state, entries: state.entries.slice() }
      if (s.startedAt === null) {
        s.startedAt = a.now
        s.status = 'running'
      }
      resumeInto(s, a.now)
      fillIndent(s.entries, t)
      return finishIfDone(s, a.now)
    }

    case 'backspace': {
      if (state.status === 'done' || state.entries.length === 0) return state
      const entries = state.entries.slice()
      let errCount = state.errCount
      const pop = () => {
        const e = entries.pop()
        if (e && !e.ok) errCount--
        return e
      }
      const last = pop()
      if (last.auto) {
        while (entries.length && entries[entries.length - 1].auto) pop()
        if (entries.length) pop()
      }
      const s = { ...state, entries, errCount }
      resumeInto(s, a.now)
      return s
    }

    case 'truncate': {
      const entries = state.entries.slice(0, Math.max(0, a.to))
      return {
        ...state,
        entries,
        errCount: entries.filter((e) => !e.ok).length,
        status: state.status === 'done' ? 'running' : state.status,
        finishedAt: null,
      }
    }

    case 'fill': {
      const entries = Array.from(state.target, (ch) => ({ ch, ok: true }))
      return { ...state, entries, errCount: 0 }
    }

    case 'pause':
      if (state.status !== 'running') return state
      return { ...state, status: 'paused', pausedAt: a.now }

    case 'resume': {
      if (state.status !== 'paused') return state
      const s = { ...state }
      resumeInto(s, a.now)
      return s
    }

    case 'compose': {
      const exp = state.target[state.entries.length]
      const ime = !(exp && HANGUL.test(exp))
      return ime === state.ime ? state : { ...state, ime }
    }

    case 'ime':
      return state.ime === a.on ? state : { ...state, ime: a.on }

    default:
      return state
  }
}

const DEFAULT_OPTS = { autoIndent: true, maxErrors: 1 }

export function useTypingEngine(rawTarget, options) {
  const target = useMemo(() => normalizeCode(rawTarget), [rawTarget])
  const opts = useMemo(
    () => ({ ...DEFAULT_OPTS, ...options }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options?.autoIndent, options?.maxErrors],
  )
  const [state, dispatch] = useReducer(reducer, null, () => initial(target, opts))

  // Reset synchronously when the target changes (allowed render-phase update).
  if (state.target !== target) dispatch({ type: 'reset', target, opts })
  else if (state.opts.autoIndent !== opts.autoIndent || state.opts.maxErrors !== opts.maxErrors) {
    dispatch({ type: 'opts', opts })
  }

  const composing = useRef(false)

  const api = useMemo(() => {
    const now = () => Date.now()
    const input = (ch) => dispatch({ type: 'input', ch, now: now() })
    const backspace = () => dispatch({ type: 'backspace', now: now() })
    const tab = () => dispatch({ type: 'tab', now: now() })
    const flush = (ta) => {
      const v = ta.value
      if (!v) return
      ta.value = ''
      for (const ch of v) {
        if (ch === '\r') continue
        if (ch === '\t') tab()
        else input(ch)
      }
    }
    return {
      input,
      backspace,
      tab,
      reset: () => dispatch({ type: 'reset' }),
      fill: () => dispatch({ type: 'fill' }),
      truncate: (to) => dispatch({ type: 'truncate', to }),
      pause: () => dispatch({ type: 'pause', now: now() }),
      resume: () => dispatch({ type: 'resume', now: now() }),
      setIme: (on) => dispatch({ type: 'ime', on }),
      handlers: {
        onKeyDown(e) {
          if (e.nativeEvent.isComposing || e.keyCode === 229) return
          if (e.ctrlKey || e.metaKey || e.altKey) return
          switch (e.key) {
            case 'Enter':
              e.preventDefault()
              input('\n')
              break
            case 'Backspace':
              e.preventDefault()
              backspace()
              break
            case 'Tab':
              e.preventDefault()
              tab()
              break
            case 'Delete':
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
            case 'Home':
            case 'End':
              e.preventDefault()
              break
            default:
          }
        },
        onInput(e) {
          if (composing.current || e.nativeEvent.isComposing) return
          flush(e.currentTarget)
        },
        onCompositionStart() {
          composing.current = true
          dispatch({ type: 'compose' })
        },
        onCompositionEnd(e) {
          composing.current = false
          flush(e.currentTarget)
        },
        onPaste(e) {
          e.preventDefault()
        },
        onDrop(e) {
          e.preventDefault()
        },
      },
    }
  }, [])

  return { state, target, ...api }
}
