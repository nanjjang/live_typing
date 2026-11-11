import { useEffect, useRef } from 'react'
import { fmtAcc, fmtTime, glyphOf } from '../../lib/stats.js'
import CountUp from '../CountUp.jsx'
import Viewport from '../Viewport.jsx'

const TRACK = { html: 'HTML', css: 'CSS', js: 'JavaScript', react: 'React' }

export default function Results({ lesson, result, hasNext, onNext, onRestart, onToc }) {
  const primary = useRef(null)

  useEffect(() => {
    primary.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const on = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return
      const tag = e.target?.tagName
      if (e.key === 'Escape') {
        e.preventDefault()
        onToc()
      } else if (e.code === 'KeyR') {
        e.preventDefault()
        onRestart()
      } else if (e.key === 'Enter' && tag !== 'BUTTON' && tag !== 'A') {
        e.preventDefault()
        onNext()
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [onNext, onRestart, onToc])

  const { wpm, acc, ms, wrong, misses, prevBest, isBest } = result

  return (
    <div className="results-layer">
      <div className="results-backdrop" aria-hidden="true" />
      <section className="results" role="dialog" aria-modal="true" aria-labelledby="results-title">
        <p className="results-eyebrow" id="results-title">
          <span className="results-check" aria-hidden="true">
            ✓
          </span>
          완료 · {TRACK[lesson.track] || lesson.track} · {lesson.title}
        </p>
        <div className="results-body">
          <div className="results-main">
            <p className="results-wpm">
              <span className="results-wpm-num">
                <CountUp value={wpm} />
              </span>
              <span className="results-wpm-unit">WPM</span>
              {isBest && <span className="best-pill">최고 기록</span>}
            </p>
            <dl className="results-stats">
              <div>
                <dt>정확도</dt>
                <dd>
                  <CountUp value={acc} format={(v) => `${fmtAcc(v)}%`} />
                </dd>
              </div>
              <div>
                <dt>오타</dt>
                <dd>
                  <CountUp value={wrong} />
                </dd>
              </div>
              <div>
                <dt>시간</dt>
                <dd>{fmtTime(ms)}</dd>
              </div>
            </dl>
            <h3 className="results-sub">자주 틀린 글자</h3>
            {misses.length ? (
              <ul className="misses">
                {misses.map(([ch, n]) => (
                  <li key={ch}>
                    <span className="keycap">{glyphOf(ch)}</span>
                    <span className="miss-n">×{n}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="results-none">틀린 글자가 없습니다.</p>
            )}
          </div>
          <div className="results-side">
            <div className="results-thumb">
              <Viewport lesson={lesson} code={lesson.code} vw={720} delay={0} />
            </div>
            <p className="results-best">
              {prevBest ? `지난 최고 ${Math.round(prevBest.wpm)} → 오늘 ${Math.round(wpm)}` : '첫 기록입니다'}
            </p>
          </div>
        </div>
        <div className="results-actions">
          <button ref={primary} type="button" className="pbtn pbtn--primary" onClick={onNext}>
            {hasNext ? '다음 레슨 →' : '레슨 목록 →'}
          </button>
          <button type="button" className="pbtn" onClick={onRestart}>
            다시 하기 <kbd>R</kbd>
          </button>
          <button type="button" className="plink" onClick={onToc}>
            레슨 목록 ›
          </button>
        </div>
      </section>
    </div>
  )
}
