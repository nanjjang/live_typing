import { useEffect, useRef } from 'react'
import { normalizeCode } from './useTypingEngine.js'

const NEIGHBOR = {
  a: 's', b: 'v', c: 'x', d: 'f', e: 'r', f: 'g', g: 'h', h: 'j', i: 'o', j: 'k', k: 'l', l: 'k',
  m: 'n', n: 'm', o: 'p', p: 'o', q: 'w', r: 't', s: 'd', t: 'y', u: 'i', v: 'b', w: 'e', x: 'z',
  y: 'u', z: 'x',
}

function gaussian() {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const charDelay = () => Math.min(110, Math.max(35, 70 + gaussian() * 20))

/** Index of the first lowercase letter at or after `near`. */
function typoIndex(t, near) {
  for (let i = Math.min(near, t.length - 1); i < t.length; i++) if (NEIGHBOR[t[i]]) return i
  return -1
}

/**
 * Drives an engine like a person would: jittered speed, pauses after
 * ; } > and newlines, one scripted typo, then a line-by-line wipe.
 */
export function useAutoTyper({ engine, code, active, typo = 40, startDelay = 600, hold = 2400, onCycle }) {
  const { input, backspace, truncate, reset } = engine
  const cycle = useRef(onCycle)
  useEffect(() => {
    cycle.current = onCycle
  })

  useEffect(() => {
    if (!active) return
    let dead = false
    let timer = 0
    const sleep = (ms) =>
      new Promise((r) => {
        timer = setTimeout(r, ms)
      })
    const t = normalizeCode(code)
    const typoAt = typoIndex(t, typo)

    ;(async () => {
      reset()
      await sleep(startDelay)
      let i = 0
      let typoDone = typoAt < 0
      while (i < t.length) {
        if (dead) return
        const ch = t[i]
        if (!typoDone && i === typoAt) {
          typoDone = true
          input(NEIGHBOR[ch])
          await sleep(300)
          if (dead) return
          backspace()
          await sleep(160)
          continue
        }
        input(ch)
        i++
        if (ch === '\n') while (t[i] === ' ') i++
        let d = charDelay()
        if (ch === ';' || ch === '}' || ch === '>' || ch === '\n') d += 180 + Math.random() * 140
        await sleep(d)
      }
      if (dead) return
      await sleep(hold)
      const starts = [0]
      for (let k = 0; k < t.length; k++) if (t[k] === '\n') starts.push(k + 1)
      for (let k = starts.length - 1; k >= 0; k--) {
        if (dead) return
        truncate(starts[k])
        await sleep(40)
      }
      if (!dead) cycle.current?.()
    })()

    return () => {
      dead = true
      clearTimeout(timer)
    }
  }, [active, code, typo, startDelay, hold, input, backspace, truncate, reset])
}
