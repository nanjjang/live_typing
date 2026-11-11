import { useEffect, useMemo, useRef, useState } from 'react'
import { allLessons, chapters } from '../../data/index.js'
import { useNavigate } from 'react-router-dom'
import { useRecords } from '../../lib/storage.js'
import { lessonHref } from '../../lib/router.js'

const TAG = { html: 'HTML', css: 'CSS', js: 'JS', react: 'React' }

/** Lesson switcher popover, anchored under the top-bar switcher button. */
export default function LessonPopover({ currentId, onClose }) {
  const [track, setTrack] = useState('all')
  const [q, setQ] = useState('')
  const [active, setActive] = useState(currentId)
  const records = useRecords()
  const navigate = useNavigate()
  const listRef = useRef(null)
  const inputRef = useRef(null)

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return allLessons.filter(
      (l) =>
        (track === 'all' || l.track === track) &&
        (!needle || l.title.toLowerCase().includes(needle) || l.track.includes(needle)),
    )
  }, [track, q])
  const activeId = visible.some((l) => l.id === active) ? active : visible[0]?.id

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    listRef.current?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' })
  }, [activeId])

  const open = (id) => {
    onClose()
    if (id !== currentId) navigate(lessonHref(id))
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onClose()
      return
    }
    if (e.nativeEvent.isComposing) return
    const i = visible.findIndex((l) => l.id === activeId)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const n = visible.length
      if (!n) return
      setActive(visible[e.key === 'ArrowDown' ? (i + 1) % n : (i - 1 + n) % n].id)
    } else if (e.key === 'Enter' && e.target.tagName === 'INPUT' && activeId) {
      e.preventDefault()
      open(activeId)
    }
  }

  const chips = [{ id: 'all', label: '전체' }, ...chapters.map((c) => ({ id: c.id, label: c.full }))]

  return (
    <div className="pop-layer" onKeyDown={onKeyDown}>
      <div className="pop-catcher" onClick={onClose} aria-hidden="true" />
      <div className="pop" role="dialog" aria-modal="true" aria-label="레슨 고르기">
        <div className="pop-top">
          <input
            ref={inputRef}
            className="pop-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="레슨 검색"
            aria-label="레슨 검색"
          />
          <div className="pop-chips" role="group" aria-label="트랙">
            {chips.map((c) => (
              <button key={c.id} type="button" className="pchip" aria-pressed={track === c.id} onClick={() => setTrack(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <ul className="pop-list" ref={listRef}>
          {visible.map((l) => {
            const rec = records[l.id]
            const cls = ['pop-row', l.id === activeId ? 'is-active' : '', l.id === currentId ? 'is-current' : '']
              .join(' ')
              .trim()
            return (
              <li key={l.id}>
                <a
                  className={cls}
                  href={lessonHref(l.id)}
                  aria-current={l.id === currentId ? 'page' : undefined}
                  onMouseEnter={() => setActive(l.id)}
                  onClick={(e) => {
                    e.preventDefault()
                    open(l.id)
                  }}
                >
                  <span className="ptag">{TAG[l.track] || l.track}</span>
                  <span className="pop-title">{l.title}</span>
                  {rec?.done && (
                    <span className="pop-done" aria-label="완료">
                      ✓
                    </span>
                  )}
                  <span className="pop-meta">
                    {l.lines}줄{rec?.best ? ` · 최고 ${Math.round(rec.best.wpm)}` : ''}
                  </span>
                </a>
              </li>
            )
          })}
          {!visible.length && <li className="pop-empty">찾는 레슨이 없습니다.</li>}
        </ul>
      </div>
    </div>
  )
}
