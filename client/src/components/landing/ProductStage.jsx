import { useEffect, useMemo, useRef } from 'react'
import { useElementSize, useReducedMotion, useTicker } from '../../lib/hooks.js'
import { accuracy, caretLineCol, elapsedMs, fmtAcc, fmtTime, liveWpm, progress, remaining, typedText } from '../../lib/stats.js'
import { useAutoTyper } from '../../lib/useAutoTyper.js'
import { useTypingEngine } from '../../lib/useTypingEngine.js'
import Editor from '../Editor.jsx'
import LivePreview from './LivePreview.jsx'
import { useInView } from './useInView.js'

const W = 1100
const H = 660
const OPTS = { autoIndent: true, maxErrors: 1 }
const FILE = { html: 'index.html', css: 'style.css', js: 'script.js', react: 'App.jsx' }
const TAG = { html: 'HTML', css: 'CSS', js: 'JS', react: 'React' }

/**
 * A live, non-interactive render of the real practice layout, scaled to fit.
 * Plays a lesson by itself and pauses while offscreen.
 */
export default function ProductStage({ lesson }) {
  const reduced = useReducedMotion()
  const wrap = useRef(null)
  const { width } = useElementSize(wrap)
  const onScreen = useInView(wrap, { rootMargin: '120px' })
  const engine = useTypingEngine(lesson.code, OPTS)
  const playing = onScreen && !reduced

  useAutoTyper({ engine, code: lesson.code, active: playing, typo: 70, startDelay: 900, hold: 4000 })

  const { fill } = engine
  useEffect(() => {
    if (reduced) fill()
  }, [reduced, fill])

  const now = useTicker(playing, 500)
  const s = engine.state
  const code = useMemo(() => typedText(s), [s])
  const scale = width ? Math.min(1, width / W) : 0
  const { line, col } = caretLineCol(s)
  const misses = Object.values(s.miss || {}).reduce((a, b) => a + b, 0)
  const pct = Math.round(progress(s) * 100)
  const wpm = Math.round(liveWpm(s, now))

  return (
    <div className="stage-shot-wrap" ref={wrap} style={{ height: scale ? H * scale : undefined }}>
      <p className="sr-only">
        실제 연습 화면 예시. 왼쪽 에디터에 코드가 입력되고 오른쪽 미리보기가 함께 바뀝니다.
      </p>
      <div
        className="stage-shot"
        aria-hidden="true"
        inert
        style={{ width: W, height: H, transform: `scale(${scale})`, visibility: scale ? undefined : 'hidden' }}
      >
        <div className="ss-top">
          <div className="ss-left">
            <span className="wordmark">
              <span className="wordmark-caret" />
              livetype
            </span>
            <span className="ss-slash">/</span>
            <span className="ss-switch">
              <span className="ss-tag">{TAG[lesson.track]}</span>
              {lesson.title}
              <span className="ss-chev">⌄</span>
            </span>
          </div>
          <div className="ss-stats">
            <span>
              <i>속도</i> <b>{wpm}</b> <i>WPM</i>
            </span>
            <span>
              <i>정확도</i> <b>{fmtAcc(accuracy(s))}%</b>
            </span>
            <span>
              <i>진행</i> <b>{pct}%</b>
            </span>
            <span>
              <i>시간</i> <b>{fmtTime(elapsedMs(s, now))}</b>
            </span>
          </div>
          <div className="ss-right">
            <span className="btn-secondary btn--sm">다시</span>
            <span className="btn-secondary btn--sm">레슨</span>
          </div>
          <span className="ss-progress">
            <span style={{ transform: `scaleX(${progress(s)})` }} />
          </span>
        </div>

        <div className="ss-work">
          <div className="ss-editor">
            <Editor
              state={s}
              track={lesson.track}
              tabs={[{ name: FILE[lesson.track] || 'index.html', state: 'active' }]}
              className="ss-editor"
            />
          </div>
          <div className="ss-preview">
            <div className="ss-bar">
              <span className="ss-lights">
                <i />
                <i />
                <i />
              </span>
              <span className="ss-url">localhost / {lesson.title}</span>
              <span className="ss-seg">
                <span className="is-on">맞춤</span>
                <span>768</span>
                <span>375</span>
              </span>
            </div>
            <div className="ss-frame">
              <LivePreview lesson={lesson} code={code} delay={60} title="연습 화면 미리보기" />
            </div>
          </div>
        </div>

        <div className="ss-status">
          <span>
            줄 {line + 1}, 칸 {col + 1} · 오타 {misses} · 남은 글자 {remaining(s)}
          </span>
          <span>Enter 줄바꿈 · Backspace 지우기 · Esc 레슨</span>
        </div>
      </div>
    </div>
  )
}
