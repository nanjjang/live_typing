import { useEffect, useState } from 'react'
import { useReducedMotion } from '../lib/hooks.js'

/** Counts from 0 to `value` over `ms` with the house ease-out. */
export default function CountUp({ value, ms = 600, format = (v) => Math.round(v), delay = 0 }) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (reduced) return
    let raf = 0
    let start = 0
    const tick = (t) => {
      if (!start) start = t
      const p = Math.min(1, Math.max(0, (t - start - delay) / ms))
      const eased = 1 - Math.pow(1 - p, 3)
      setShown(value * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, ms, delay, reduced])
  return <>{format(reduced ? value : shown)}</>
}
