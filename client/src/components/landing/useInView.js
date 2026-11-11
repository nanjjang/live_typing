import { useEffect, useState } from 'react'

/**
 * Tracks whether `ref` is on screen. With `once`, stays true after the first hit
 * (used for lazy iframes); otherwise follows visibility (used to pause demos).
 */
export function useInView(ref, { rootMargin = '0px', once = false } = {}) {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, once])
  return inView
}
