import { useEffect, useRef, useState } from 'react'

/** Adds .is-in once the element scrolls into view (single reveal, never scroll-linked). */
export default function Reveal({ as: Tag = 'section', className = '', children, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag ref={ref} className={`reveal${shown ? ' is-in' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
