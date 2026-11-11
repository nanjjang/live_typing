import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from '../../lib/hooks.js'
import { typedText } from '../../lib/stats.js'
import { useAutoTyper } from '../../lib/useAutoTyper.js'
import { useTypingEngine } from '../../lib/useTypingEngine.js'
import Editor from '../Editor.jsx'
import BrowserBar from './BrowserBar.jsx'
import LivePreview from './LivePreview.jsx'
import { useInView } from './useInView.js'

const OPTS = { autoIndent: true, maxErrors: 1 }

/**
 * The hero box: a mini workspace that types by itself. Clicking the editor
 * takes over with the same engine; Esc or 8s away hands it back.
 */
export default function HeroWorkspace({ snippets, startHref }) {
  const reduced = useReducedMotion()
  const [idx, setIdx] = useState(0)
  const [mode, setMode] = useState('demo') // demo | takeover
  const lesson = snippets[idx % snippets.length]
  const engine = useTypingEngine(lesson.code, OPTS)
  const inputRef = useRef(null)
  const boxRef = useRef(null)
  const idle = useRef(0)
  const onScreen = useInView(boxRef)

  const still = reduced && mode === 'demo'

  useAutoTyper({
    engine,
    code: lesson.code,
    active: mode === 'demo' && !reduced && onScreen,
    typo: lesson.typo ?? 40,
    onCycle: () => setIdx((i) => (i + 1) % snippets.length),
  })

  const { fill, reset } = engine
  useEffect(() => {
    if (still) fill()
  }, [still, fill, lesson])

  useEffect(() => () => clearTimeout(idle.current), [])

  const takeOver = (e) => {
    e.preventDefault()
    clearTimeout(idle.current)
    if (mode !== 'takeover') {
      setMode('takeover')
      reset()
    }
    inputRef.current?.focus({ preventScroll: true })
  }

  const handBack = () => {
    clearTimeout(idle.current)
    setMode('demo')
    inputRef.current?.blur()
  }

  const inputProps = {
    ...engine.handlers,
    onKeyDown: (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        handBack()
        return
      }
      engine.handlers.onKeyDown(e)
    },
    onFocus: () => {
      clearTimeout(idle.current)
      if (mode !== 'takeover') {
        setMode('takeover')
        reset()
      }
    },
    onBlur: () => {
      clearTimeout(idle.current)
      idle.current = setTimeout(() => setMode('demo'), 8000)
    },
  }

  const code = useMemo(() => typedText(engine.state), [engine.state])
  const live = mode === 'takeover'

  return (
    <div className={`hero-box${live ? ' is-live' : ''}`} ref={boxRef}>
      <div className="hb-grid">
        <div className="hb-editor">
          <Editor
            state={engine.state}
            track={lesson.track}
            size="sm"
            inputRef={inputRef}
            inputProps={inputProps}
            inputLabel="에디터에 직접 입력해 보기"
            onPointerDown={takeOver}
            className="hb-editor"
          />
          <p className="hb-hint" aria-live="polite">
            {live ? (
              engine.state.ime ? (
                '한글 입력 중 · 한/영 키를 눌러 주세요'
              ) : (
                <>직접 치는 중 · Esc 돌려놓기</>
              )
            ) : (
              '눌러서 직접 쳐 보세요'
            )}
          </p>
        </div>
        <div className="hb-preview">
          <BrowserBar url="preview.html" />
          <div className="hb-frame">
            <LivePreview lesson={lesson} code={code} delay={40} title="미리보기" />
          </div>
        </div>
      </div>
      <a className="hb-send" href={startHref}>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr-only">연습 시작</span>
      </a>
    </div>
  )
}
