import { useEffect, useRef, useState } from 'react'
import { buildDoc, buildReactHost, nextBuildId } from '../lib/buildPreview.js'

/*
 * Sandboxed live render of `code` for `lesson`.
 * Reports status through onStatus({ kind, message }):
 *   empty · ok · partial · error · loading · libfail
 */

function useLatest(value) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  return ref
}

function DocFrame({ lesson, code, delay, onStatus, title }) {
  const a = useRef(null)
  const b = useRef(null)
  const [front, setFront] = useState(0)
  const [docs, setDocs] = useState(['', ''])
  const frontRef = useRef(0)
  const pending = useRef(null)
  const status = useLatest(onStatus)

  useEffect(() => {
    const t = setTimeout(() => {
      const id = nextBuildId()
      const built = buildDoc(lesson, code, id)
      const buf = 1 - frontRef.current
      pending.current = { buf, id, failed: false, msg: '', partial: built.partial, empty: built.empty }
      setDocs((d) => {
        const next = d.slice()
        next[buf] = built.html
        return next
      })
    }, delay)
    return () => clearTimeout(t)
  }, [lesson, code, delay])

  useEffect(() => {
    const fr = [a, b]
    const commit = () => {
      const p = pending.current
      if (!p) return
      pending.current = null
      if (p.failed) {
        status.current?.({ kind: 'error', message: p.msg })
        return
      }
      frontRef.current = p.buf
      setFront(p.buf)
      status.current?.({ kind: p.empty ? 'empty' : p.partial ? 'partial' : 'ok', message: '' })
    }
    const onMsg = (e) => {
      const d = e.data
      if (!d || typeof d.__lt !== 'number') return
      const p = pending.current
      if (p && d.__lt === p.id && e.source === fr[p.buf].current?.contentWindow) {
        if (d.type === 'error') {
          p.failed = true
          p.msg = d.message
        } else if (d.type === 'done') commit()
        return
      }
      if (d.type === 'error' && e.source === fr[frontRef.current].current?.contentWindow) {
        status.current?.({ kind: 'error', message: d.message })
      }
    }
    window.addEventListener('message', onMsg)
    const onLoad = (e) => {
      const p = pending.current
      if (!p || e.currentTarget !== fr[p.buf].current) return
      const id = p.id
      setTimeout(() => {
        if (pending.current && pending.current.id === id) commit()
      }, 60)
    }
    const els = fr.map((r) => r.current)
    els.forEach((el) => el && el.addEventListener('load', onLoad))
    return () => {
      window.removeEventListener('message', onMsg)
      els.forEach((el) => el && el.removeEventListener('load', onLoad))
    }
  }, [status])

  return (
    <div className="frame-stack">
      {[0, 1].map((i) => (
        <iframe
          key={i}
          ref={i === 0 ? a : b}
          title={title}
          sandbox="allow-scripts"
          srcDoc={docs[i]}
          className={i === front ? 'frame is-front' : 'frame is-back'}
          tabIndex={i === front ? 0 : -1}
          aria-hidden={i === front ? undefined : true}
        />
      ))}
    </div>
  )
}

function ReactFrame({ lesson, code, delay, onStatus, title }) {
  const ref = useRef(null)
  const [host] = useState(() => {
    const id = nextBuildId()
    return { id, html: buildReactHost(lesson, id) }
  })
  const ready = useRef(false)
  const latest = useRef(code)
  const seq = useRef(0)
  const status = useLatest(onStatus)

  useEffect(() => {
    status.current?.({ kind: 'loading', message: '' })
    const send = () => {
      const w = ref.current?.contentWindow
      if (!ready.current || !w) return
      seq.current += 1
      w.postMessage({ __ltRun: latest.current, id: seq.current }, '*')
    }
    const onMsg = (e) => {
      const d = e.data
      if (!d || d.__lt !== host.id || e.source !== ref.current?.contentWindow) return
      if (d.type === 'ready') {
        ready.current = true
        send()
      } else if (d.type === 'libfail') {
        status.current?.({ kind: 'libfail', message: '' })
      } else if (d.id == null) {
        if (d.type === 'error') status.current?.({ kind: 'error', message: d.message })
      } else if (d.id === seq.current) {
        status.current?.({ kind: d.type, message: d.message })
      }
    }
    window.addEventListener('message', onMsg)
    ref.current.__ltSend = send
    return () => window.removeEventListener('message', onMsg)
  }, [host, status])

  useEffect(() => {
    const t = setTimeout(() => {
      latest.current = code
      ref.current?.__ltSend?.()
    }, delay)
    return () => clearTimeout(t)
  }, [code, delay])

  return (
    <div className="frame-stack">
      <iframe ref={ref} title={title} sandbox="allow-scripts" srcDoc={host.html} className="frame is-front" />
    </div>
  )
}

export default function PreviewFrame({ lesson, code, delay, onStatus, title = '미리보기' }) {
  const isReact = lesson.track === 'react'
  const Impl = isReact ? ReactFrame : DocFrame
  return (
    <Impl
      key={lesson.id}
      lesson={lesson}
      code={code}
      delay={delay ?? (isReact ? 140 : 80)}
      onStatus={onStatus}
      title={title}
    />
  )
}
