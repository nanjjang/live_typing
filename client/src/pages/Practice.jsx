import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Editor from '../components/Editor.jsx'
import Viewport from '../components/Viewport.jsx'
import Hud from '../components/practice/Hud.jsx'
import LessonPopover from '../components/practice/LessonPopover.jsx'
import PreviewPane from '../components/practice/PreviewPane.jsx'
import Results from '../components/practice/Results.jsx'
import StatusLine from '../components/practice/StatusLine.jsx'
import { allLessons, findLesson, nextLesson } from '../data/index.js'
import { useMediaQuery, useNoKeyboard, useReducedMotion, useTicker } from '../lib/hooks.js'
import { lessonHref } from '../lib/router.js'
import {
  accuracy,
  averageWpm,
  caretLineCol,
  elapsedMs,
  liveWpm,
  progress,
  remaining,
  topMisses,
  typedText,
} from '../lib/stats.js'
import { readJSON, saveRun, writeJSON } from '../lib/storage.js'
import { useAutoTyper } from '../lib/useAutoTyper.js'
import { useTypingEngine } from '../lib/useTypingEngine.js'

// Storage keys kept from earlier versions so existing preferences survive.
const PREFS = 'livetype.prefs'
const SPLIT = 'livetype.split'
const DEFAULT_TITLE = 'livetype — 치는 대로 그려지는 코딩 타자 연습'
const TAG = { html: 'HTML', css: 'CSS', js: 'JS', react: 'React' }
const DEMO_OPTS = { autoIndent: true, maxErrors: 1 }

function fileTabs(lesson) {
  const sc = lesson.scaffold || {}
  const fixed = (name) => ({ name, state: 'done' })
  switch (lesson.track) {
    case 'css':
      return [fixed('index.html'), { name: 'style.css', state: 'active' }]
    case 'js':
      return [fixed('index.html'), ...(sc.css ? [fixed('style.css')] : []), { name: 'script.js', state: 'active' }]
    case 'react':
      return [fixed('index.html'), ...(sc.css ? [fixed('style.css')] : []), { name: 'App.jsx', state: 'active' }]
    default:
      return [{ name: 'index.html', state: 'active' }, ...(sc.css ? [fixed('style.css')] : [])]
  }
}

function Wordmark() {
  return (
    <Link className="pt-wordmark" to="/" aria-label="livetype 처음으로">
      <i aria-hidden="true" />
      livetype
    </Link>
  )
}

/** Auto-playing demo for touch-only devices. */
function TouchDemo({ lesson }) {
  const reduced = useReducedMotion()
  const engine = useTypingEngine(lesson.code, DEMO_OPTS)
  useAutoTyper({ engine, code: lesson.code, active: !reduced, typo: lesson.typo ?? 40 })
  const { fill } = engine
  useEffect(() => {
    if (reduced) fill()
  }, [reduced, fill])
  const code = useMemo(() => typedText(engine.state), [engine.state])
  return (
    <div className="touch-demo">
      <Editor state={engine.state} track={lesson.track} size="sm" className="touch-editor" />
      <div className="touch-preview">
        <Viewport lesson={lesson} code={code} delay={40} />
      </div>
    </div>
  )
}

// lesson prop: 커뮤니티 레슨처럼 서버에서 받아온 레슨을 바로 넘길 때 사용
export default function Practice({ lessonId, lesson: given }) {
  const lesson = given || findLesson(lessonId) || allLessons[0]
  const next = given ? null : nextLesson(lesson.id)
  const navigate = useNavigate()
  const noKeyboard = useNoKeyboard()
  const reduced = useReducedMotion()
  const stacked = useMediaQuery('(max-width: 899px)')

  const [prefs, setPrefs] = useState(() => ({ autoIndent: true, loose: false, ...readJSON(PREFS, {}) }))
  const engineOpts = useMemo(
    () => ({ autoIndent: prefs.autoIndent, maxErrors: prefs.loose ? Infinity : 1 }),
    [prefs.autoIndent, prefs.loose],
  )
  const engine = useTypingEngine(lesson.code, engineOpts)
  const s = engine.state
  const now = useTicker(s.status === 'running', 250)

  const [tocOpen, setTocOpen] = useState(false)
  const [overlay, setOverlay] = useState(false)
  const [viewport, setViewport] = useState('fit')
  const [split, setSplit] = useState(() => {
    const v = Number(readJSON(SPLIT, 0.55))
    return v >= 0.32 && v <= 0.68 ? v : 0.55
  })
  const [result, setResult] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const inputRef = useRef(null)
  const wsRef = useRef(null)

  const focusInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  const { reset, pause, resume, input, backspace } = engine

  const restart = useCallback(() => {
    reset()
    setResult(null)
    setShowResults(false)
    setTocOpen(false)
    requestAnimationFrame(focusInput)
  }, [reset, focusInput])

  const openToc = useCallback(() => {
    pause()
    setTocOpen(true)
  }, [pause])

  const closeToc = useCallback(() => {
    setTocOpen(false)
    requestAnimationFrame(focusInput)
  }, [focusInput])

  const goNext = useCallback(() => {
    if (next) navigate(lessonHref(next.id))
    else if (given) navigate('/community') // 커뮤니티 레슨은 커뮤니티 목록으로
    else {
      setShowResults(false)
      setTocOpen(true)
    }
  }, [next, given, navigate])

  const resultsToc = useCallback(() => {
    setShowResults(false)
    setTocOpen(true)
  }, [])

  // Focus the editor on arrival.
  useEffect(() => {
    if (!noKeyboard) focusInput()
  }, [focusInput, noKeyboard])

  // Pause when the window loses focus.
  useEffect(() => {
    const on = () => pause()
    window.addEventListener('blur', on)
    return () => window.removeEventListener('blur', on)
  }, [pause])

  // Tab title carries progress.
  const pct = Math.floor(progress(s) * 100)
  useEffect(() => {
    document.title = `${lesson.title} ${pct}% — livetype`
  }, [lesson.title, pct])
  useEffect(() => () => void (document.title = DEFAULT_TITLE), [])

  // Completion: save the run once, then raise the results sheet.
  useEffect(() => {
    if (s.status !== 'done') return
    const ms = elapsedMs(s, s.finishedAt)
    const run = { wpm: averageWpm(s, s.finishedAt), acc: accuracy(s), ms, at: Date.now() }
    const { prevBest, isBest } = saveRun(lesson.id, run)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- runs once when the lesson finishes
    setResult({ ...run, wrong: s.wrongKeys, misses: topMisses(s), prevBest, isBest })
    const t = setTimeout(() => setShowResults(true), reduced ? 0 : 450)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.status])

  // Page-level keys: shortcuts, and typing while focus is elsewhere.
  useEffect(() => {
    if (noKeyboard) return
    const on = (e) => {
      if (tocOpen || showResults) return
      if (e.altKey && e.code === 'KeyR') {
        e.preventDefault()
        restart()
        return
      }
      if (e.altKey && e.code === 'KeyO') {
        e.preventDefault()
        setOverlay((o) => !o)
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        openToc()
        return
      }
      const ta = inputRef.current
      if (!ta || document.activeElement === ta || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return
      const tag = document.activeElement?.tagName
      const activating = (e.key === 'Enter' || e.key === ' ') && (tag === 'BUTTON' || tag === 'A')
      if (activating || tag === 'INPUT') return
      if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace') {
        e.preventDefault()
        focusInput()
        if (s.status === 'paused') resume()
        else if (e.key === 'Enter') input('\n')
        else if (e.key === 'Backspace') backspace()
        else input(e.key)
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [noKeyboard, tocOpen, showResults, restart, openToc, focusInput, resume, input, backspace, s.status])

  const inputProps = {
    ...engine.handlers,
    onKeyDown: (e) => {
      if (e.key === 'Escape' || e.altKey) return
      if (s.status === 'paused' && !e.nativeEvent.isComposing) {
        e.preventDefault()
        resume()
        return
      }
      engine.handlers.onKeyDown(e)
    },
  }

  const togglePref = (k) =>
    setPrefs((p) => {
      const n = { ...p, [k]: !p[k] }
      writeJSON(PREFS, n)
      return n
    })

  // Gutter drag.
  const onGutterDown = (e) => {
    if (stacked) return
    const ws = wsRef.current
    if (!ws) return
    e.preventDefault()
    const rect = ws.getBoundingClientRect()
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    let last = split
    const move = (ev) => {
      last = Math.min(0.68, Math.max(0.32, (ev.clientX - rect.left) / rect.width))
      setSplit(last)
    }
    const up = () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      writeJSON(SPLIT, last)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
  }
  const onGutterKey = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const v = Math.min(0.68, Math.max(0.32, split + (e.key === 'ArrowLeft' ? -0.02 : 0.02)))
    setSplit(v)
    writeJSON(SPLIT, v)
  }

  const code = useMemo(() => typedText(s), [s])
  const wpm = s.status === 'done' ? averageWpm(s, s.finishedAt) : liveWpm(s, now)
  const acc = accuracy(s)
  const ms = elapsedMs(s, now)
  const prog = progress(s)
  const { line, col } = caretLineCol(s)

  const switcher = (
    <button
      type="button"
      className="switcher"
      onClick={() => (tocOpen ? closeToc() : openToc())}
      aria-haspopup="dialog"
      aria-expanded={tocOpen}
    >
      <span className="ptag">{TAG[lesson.track] || lesson.track}</span>
      <span className="switcher-title">{lesson.title}</span>
      <span className="switcher-chev" aria-hidden="true">
        ⌄
      </span>
    </button>
  )

  if (noKeyboard) {
    return (
      <div className="practice practice--touch">
        <header className="pt-bar">
          <div className="pt-left">
            <Wordmark />
            <span className="pt-slash" aria-hidden="true">
              /
            </span>
            {switcher}
            {tocOpen && <LessonPopover currentId={lesson.id} onClose={closeToc} />}
          </div>
        </header>
        <main className="touch-body">
          <div className="touch-card" role="status">
            <h1>이 연습은 키보드가 필요합니다</h1>
            <p>컴퓨터에서 열어 주세요. 아래는 이 레슨이 자동으로 쳐지는 모습입니다.</p>
          </div>
          <TouchDemo lesson={lesson} />
          <Link className="plink" to="/">
            처음으로 ›
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="practice" style={{ '--split': `${(split * 100).toFixed(2)}%` }}>
      <header className="pt-bar">
        <div className="pt-left">
          <Wordmark />
          <span className="pt-slash" aria-hidden="true">
            /
          </span>
          {switcher}
          {tocOpen && <LessonPopover currentId={lesson.id} onClose={closeToc} />}
        </div>
        <Hud wpm={wpm} acc={acc} prog={prog} ms={ms} className="pt-stats" />
        <div className="pt-right">
          {s.ime && (
            <span className="ime-pill" role="status">
              <i aria-hidden="true" />
              <span className="ime-long">한글 입력 중 · 한/영 키를 눌러 주세요</span>
              <span className="ime-short">한글 입력 중</span>
            </span>
          )}
          <button type="button" className="pbtn pbtn--sm" onClick={restart}>
            다시 <kbd>Alt R</kbd>
          </button>
          <button type="button" className="pbtn pbtn--sm" onClick={openToc}>
            레슨 <kbd>Esc</kbd>
          </button>
        </div>
        <div className="pt-progress" aria-hidden="true">
          <div className="pt-progress-fill" style={{ width: `${prog * 100}%` }} />
        </div>
      </header>

      <main className="workspace" ref={wsRef}>
        <Editor
          state={s}
          track={lesson.track}
          tabs={fileTabs(lesson)}
          tabsRight={
            <span className="ed-prefs">
              <button type="button" aria-pressed={prefs.autoIndent} onClick={() => togglePref('autoIndent')}>
                자동 들여쓰기
              </button>
              <button type="button" aria-pressed={prefs.loose} onClick={() => togglePref('loose')}>
                틀려도 계속
              </button>
            </span>
          }
          showLead={!prefs.autoIndent}
          dim={s.status === 'paused'}
          inputRef={inputRef}
          inputProps={inputProps}
          inputLabel={`${lesson.title} — 코드를 따라 입력`}
          onPointerDown={(e) => {
            if (e.target.closest('button')) return
            e.preventDefault()
            focusInput()
          }}
          className="editor-window"
        >
          {s.status === 'idle' && !tocOpen && (
            <span className="editor-pill" role="status">
              아무 키나 눌러 시작 <small>시간은 첫 글자부터</small>
            </span>
          )}
          {s.status === 'paused' && !tocOpen && (
            <span className="editor-pill" role="status">
              일시정지 · 아무 키나 눌러 계속
            </span>
          )}
        </Editor>

        <div
          className="gutter"
          role="separator"
          aria-orientation="vertical"
          aria-label="에디터와 미리보기 너비 조절"
          aria-valuemin={32}
          aria-valuemax={68}
          aria-valuenow={Math.round(split * 100)}
          tabIndex={stacked ? -1 : 0}
          onPointerDown={onGutterDown}
          onKeyDown={onGutterKey}
        />

        <PreviewPane
          lesson={lesson}
          code={code}
          done={s.status === 'done'}
          overlay={overlay}
          onToggleOverlay={() => setOverlay((o) => !o)}
          viewport={viewport}
          onViewport={setViewport}
        />
      </main>

      <StatusLine line={line + 1} col={col + 1} wrong={s.wrongKeys} left={remaining(s)} />

      {showResults && result && (
        <Results
          lesson={lesson}
          result={result}
          hasNext={!!next}
          onNext={goNext}
          onRestart={restart}
          onToc={resultsToc}
        />
      )}
    </div>
  )
}
