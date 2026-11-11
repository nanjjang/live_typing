import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import HeroWorkspace from '../components/landing/HeroWorkspace.jsx'
import LivePreview from '../components/landing/LivePreview.jsx'
import ProductStage from '../components/landing/ProductStage.jsx'
import { useInView } from '../components/landing/useInView.js'
import Reveal from '../components/Reveal.jsx'
import Wordmark from '../components/Wordmark.jsx'
import SnippetCard from '../components/community/SnippetCard.jsx'
import { CardGrid } from '../components/ui.js'
import { MobileMenu, UserActions } from '../components/SiteHeader.jsx'
import heroSnippets from '../data/heroSnippets.js'
import { allLessons, chapters, findLesson } from '../data/index.js'
import { lessonHref } from '../lib/router.js'
import { useRecords } from '../lib/storage.js'
import { useSnippets } from '../lib/useSnippets.js'

const TITLE = 'livetype — 치는 대로 그려지는 코딩 타자 연습'
const FULL = Object.fromEntries(chapters.map((c) => [c.id, c.full]))

// Hero suggestion chips: one real lesson per track.
const CHIP_IDS = ['html-01', 'css-02', 'js-01', 'react-03']
// The product stage plays a longer CSS lesson.
const STAGE_ID = 'css-04'

function scrollToId(id) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

const jump = (id) => (e) => {
  e.preventDefault()
  scrollToId(id)
}

function Nav({ startHref }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="nav-in">
        <Wordmark />
        <nav className="nav-links" aria-label="주요">
          <Link to={startHref}>연습</Link>
          <a href="#lessons" onClick={jump('lessons')}>
            레슨
          </a>
          <Link to="/community">커뮤니티 레슨</Link>
          <Link to="/join">작성자 현황</Link>
        </nav>
        <div className="nav-actions">
          <UserActions />
        </div>
      </div>
      <MobileMenu />
    </header>
  )
}

// 메인 화면: 모든 회원이 올린 커뮤니티 레슨 (최신 6개)
const COMMUNITY_PREVIEW = 6

function Community() {
  const { user } = useOutletContext()
  const { list, loading, error, remove } = useSnippets()
  const shown = list.slice(0, COMMUNITY_PREVIEW)
  return (
    <section className="sec community" id="community" aria-labelledby="community-title">
      <div className="sec-in">
        <div className="lessons-head">
          <div>
            <h2 className="t-h2" id="community-title">
              커뮤니티 레슨
            </h2>
            <p className="t-lead">회원들이 직접 올린 코드를 따라 쳐 보세요.</p>
          </div>
          <div className="community-actions">
            <Link className="btn-secondary" to="/community">
              전체 보기{!loading && !error ? ` ${list.length}` : ''}
            </Link>
            <Link className="btn" to={user ? '/community/new' : '/login'} state={user ? undefined : { from: '/community/new' }}>
              + 레슨 올리기
            </Link>
          </div>
        </div>
        {loading ? (
          <p className="community-empty">불러오는 중…</p>
        ) : error ? (
          <p className="community-empty">{error}</p>
        ) : shown.length === 0 ? (
          <p className="community-empty">아직 올라온 레슨이 없습니다. 첫 레슨을 올려 보세요.</p>
        ) : (
          <CardGrid>
            {shown.map((s) => (
              <SnippetCard key={s.id} snippet={s} isMine={user?.id === s.user_id} onDelete={remove} />
            ))}
          </CardGrid>
        )}
      </div>
    </section>
  )
}

function Ticker() {
  const row = (copy) =>
    allLessons.map((l) => (
      <li key={`${copy}-${l.id}`}>
        <Link className="tk-item" to={lessonHref(l.id)} tabIndex={copy ? -1 : undefined}>
          {l.title}
        </Link>
      </li>
    ))
  return (
    <section className="ticker" aria-label="레슨 미리보기">
      <div className="tk-track">
        <ul className="tk-row">{row(0)}</ul>
        <ul className="tk-row" aria-hidden="true">
          {row(1)}
        </ul>
      </div>
    </section>
  )
}

function LessonThumb({ lesson }) {
  const ref = useRef(null)
  const seen = useInView(ref, { rootMargin: '200px', once: true })
  return (
    <span className="thumb" ref={ref} aria-hidden="true" inert>
      {seen && <LivePreview lesson={lesson} code={lesson.code} vw={640} delay={0} title={`${lesson.title} 완성 화면`} />}
    </span>
  )
}

function LessonRow({ lesson, rec }) {
  const best = rec?.best ? Math.round(rec.best.wpm) : null
  return (
    <li>
      <Link className="lesson-row" to={lessonHref(lesson.id)}>
        <LessonThumb lesson={lesson} />
        <span className="lr-body">
          <span className="lr-title">{lesson.title}</span>
          {lesson.summary && <span className="lr-summary">{lesson.summary}</span>}
          <span className="lr-meta">
            <span className="lr-cat">{FULL[lesson.track]}</span>
            <span>{lesson.lines}줄</span>
            <span>레벨 {lesson.level}</span>
            {best !== null && <span className="lr-best">최고 {best} WPM</span>}
          </span>
        </span>
      </Link>
    </li>
  )
}

const FILTERS = [{ id: 'all', label: '전체' }, ...chapters.map((c) => ({ id: c.id, label: c.full }))]

// Lessons shown before "더 보기" (3 rows on the two-column grid).
const PREVIEW_COUNT = 6

function Lessons({ records }) {
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(false)
  const list = filter === 'all' ? allLessons : allLessons.filter((l) => l.track === filter)
  const hidden = Math.max(0, list.length - PREVIEW_COUNT)
  const shown = expanded || !hidden ? list : list.slice(0, PREVIEW_COUNT)

  const pickFilter = (id) => {
    setFilter(id)
    setExpanded(false)
  }

  const collapse = () => {
    setExpanded(false)
    scrollToId('lessons')
  }
  return (
    <Reveal className="sec lessons" id="lessons" aria-labelledby="lessons-title">
      <div className="sec-in">
        <div className="lessons-head">
          <div>
            <h2 className="t-h2" id="lessons-title">
              레슨
            </h2>
            <p className="t-lead">짧게 시작해서, 조금씩 길게.</p>
          </div>
          <div className="chip-row lessons-filter" role="group" aria-label="트랙 필터">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className="chip"
                aria-pressed={filter === f.id}
                onClick={() => pickFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <ul className="lesson-grid" id="lesson-grid">
          {shown.map((l) => (
            <LessonRow key={l.id} lesson={l} rec={records[l.id]} />
          ))}
        </ul>
        {hidden > 0 && (
          <div className="lessons-more">
            <button
              type="button"
              className="btn-secondary"
              aria-expanded={expanded}
              aria-controls="lesson-grid"
              onClick={expanded ? collapse : () => setExpanded(true)}
            >
              {expanded ? '접기' : `레슨 ${hidden}개 더 보기`}
              <span className={`lessons-more-chev${expanded ? ' is-up' : ''}`} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </Reveal>
  )
}

export default function Landing() {
  const records = useRecords()
  const navigate = useNavigate()
  const first = allLessons[0]
  const startHref = first ? lessonHref(first.id) : '/'
  const chips = useMemo(() => CHIP_IDS.map(findLesson).filter(Boolean), [])
  const stageLesson = findLesson(STAGE_ID) || allLessons.find((l) => l.track === 'css') || first

  useEffect(() => {
    document.title = TITLE
    const on = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return
      const t = e.target
      const interactive = t && t.closest && t.closest('a, button, input, textarea, select, [contenteditable]')
      if (interactive) return
      if (e.key === 'Enter' && first) {
        e.preventDefault()
        navigate(lessonHref(first.id))
      } else if (e.key === 'Escape') {
        e.preventDefault()
        scrollToId('lessons')
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [first, navigate])

  return (
    <div className="landing">
      <Nav startHref={startHref} />

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="sec-in hero-in">
            <h1 className="t-display hero-title" id="hero-title">
              <span className="hero-line">치는 대로,</span>
              <span className="hero-line">그려집니다.</span>
            </h1>
            <p className="t-lead hero-lead">코드를 한 글자씩 따라 치면, 친 만큼 오른쪽에 실제 화면이 만들어집니다.</p>
            <div className="hero-stage">
              <HeroWorkspace snippets={heroSnippets} startHref={startHref} />
            </div>
            <div className="chip-row hero-chips">
              {chips.map((l) => (
                <Link key={l.id} className="chip" to={lessonHref(l.id)}>
                  {FULL[l.track]} {l.title}
                </Link>
              ))}
              <a className="chip" href="#lessons" onClick={jump('lessons')}>
                전체 레슨
              </a>
            </div>
          </div>
        </section>

        <Ticker />

        <section className="stage" id="how" aria-labelledby="how-title">
          <div className="sec-in">
            <Reveal as="header" className="stage-head">
              <p className="stage-eyebrow">작동 방식</p>
              <h2 className="t-h2 stage-title" id="how-title">
                왼쪽에서 치고, 오른쪽에서 봅니다.
              </h2>
              <p className="t-lead stage-lead">에디터와 미리보기가 한 화면에. 한 글자를 칠 때마다 결과가 바로 바뀝니다.</p>
            </Reveal>
            <Reveal as="div" className="stage-shot-reveal">
              {stageLesson && <ProductStage lesson={stageLesson} />}
            </Reveal>
            <Reveal as="ul" className="stage-points">
              <li>
                <h3>틀리면 바로 보입니다</h3>
                <p>틀린 글자는 빨갛게, 원래 칠 글자는 바로 아래에.</p>
              </li>
              <li>
                <h3>들여쓰기는 알아서</h3>
                <p>줄을 바꾸면 들여쓰기가 자동으로 채워집니다.</p>
              </li>
              <li>
                <h3>속도와 정확도</h3>
                <p>WPM, 정확도, 시간이 쉬지 않고 기록됩니다.</p>
              </li>
            </Reveal>
          </div>
        </section>

        <Lessons records={records} />

        <Community />

        <Reveal className="closing" aria-labelledby="closing-title">
          <div className="closing-tile">
            <h2 className="t-h2" id="closing-title">
              첫 줄부터 시작해 보세요.
            </h2>
            <p className="t-lead">1분이면 첫 화면이 만들어집니다.</p>
            <div className="closing-actions">
              <Link className="btn btn--lg" to={startHref}>
                바로 시작 →
              </Link>
              <a className="link" href="#lessons" onClick={jump('lessons')}>
                레슨 둘러보기
              </a>
            </div>
          </div>
        </Reveal>
      </main>

      <footer className="footer">
        <div className="footer-in">
          <div className="footer-top">
            <div className="footer-brand">
              <Wordmark />
              <p>치는 대로 그려지는 코딩 타자 연습.</p>
            </div>
            <nav className="footer-cols" aria-label="바닥글">
              <div>
                <h3>트랙</h3>
                <ul>
                  {chapters.map((c) => {
                    const l = allLessons.find((x) => x.track === c.id)
                    return l ? (
                      <li key={c.id}>
                        <Link to={lessonHref(l.id)}>{c.full}</Link>
                      </li>
                    ) : null
                  })}
                </ul>
              </div>
              <div>
                <h3>둘러보기</h3>
                <ul>
                  <li>
                    <a href="#lessons" onClick={jump('lessons')}>
                      레슨 목록
                    </a>
                  </li>
                  <li>
                    <a href="#how" onClick={jump('how')}>
                      작동 방식
                    </a>
                  </li>
                  <li>
                    <a href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                      맨 위로
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3>단축키</h3>
                <ul className="footer-keys">
                  <li>
                    <kbd>Enter</kbd>
                    <span>연습 시작</span>
                  </li>
                  <li>
                    <kbd>Esc</kbd>
                    <span>레슨 목록</span>
                  </li>
                  <li>
                    <span className="footer-combo">
                      <kbd>Alt</kbd>
                      <kbd>R</kbd>
                    </span>
                    <span>다시 하기</span>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
          <div className="footer-bottom">
            <p>© 2026 livetype</p>
            <p>코드는 브라우저 안의 격리된 공간에서만 실행되고, 어디로도 전송되지 않습니다.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
