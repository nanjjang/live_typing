import { useState } from 'react'
import Viewport from '../Viewport.jsx'

const VIEWPORTS = [
  { id: 'fit', label: '맞춤' },
  { id: 768, label: '768' },
  { id: 375, label: '375' },
]

function statusFor(st, track, done) {
  const scripted = track === 'js' || track === 'react'
  switch (st.kind) {
    case 'loading':
      return { text: 'React 불러오는 중…', tone: '' }
    case 'libfail':
      return { text: 'React를 불러오지 못했습니다 · 인터넷 연결이 필요합니다', tone: 'err' }
    case 'partial':
      return scripted ? { text: '스크립트 작성 중…', tone: '' } : { text: '실시간', tone: 'live' }
    case 'error':
      if (done && st.message) return { text: `스크립트 오류 · ${st.message}`, tone: 'err' }
      return { text: '스크립트 작성 중…', tone: '' }
    case 'ok':
      return { text: '실시간', tone: 'live' }
    default:
      return { text: '아직 친 코드가 없습니다', tone: '' }
  }
}

/** Browser-style preview window: traffic lights, url pill, viewport control, onion-skin toggle. */
export default function PreviewPane({ lesson, code, done, overlay, onToggleOverlay, viewport, onViewport }) {
  const [st, setSt] = useState({ kind: 'empty', message: '' })
  const status = statusFor(code.trim() ? st : { kind: 'empty' }, lesson.track, done)
  return (
    <section className="preview" aria-label="미리보기">
      <header className="preview-bar">
        <span className="lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="url-pill">localhost / {lesson.title}</span>
        <div className="preview-tools">
          <span className="seg" role="group" aria-label="화면 폭">
            {VIEWPORTS.map((v) => (
              <button key={v.id} type="button" aria-pressed={viewport === v.id} onClick={() => onViewport(v.id)}>
                {v.label}
              </button>
            ))}
          </span>
          <button
            type="button"
            className="onion-toggle"
            aria-pressed={overlay}
            onClick={onToggleOverlay}
            title="Alt O"
          >
            원본 겹쳐 보기
          </button>
        </div>
      </header>
      <div className="preview-body">
        <Viewport
          lesson={lesson}
          code={code}
          vw={viewport === 'fit' ? null : viewport}
          device={viewport !== 'fit'}
          overlay={overlay}
          onStatus={setSt}
        />
        <p className={`status-pill${status.tone ? ` is-${status.tone}` : ''}`} aria-live="polite">
          <i aria-hidden="true" />
          {status.text}
        </p>
      </div>
    </section>
  )
}
