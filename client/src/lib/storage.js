// localStorage wrappers. Everything degrades silently when storage is blocked.
// When logged in, finished runs are also saved to the Express server and the
// local copy is refreshed from it (localStorage acts as a cache).

import { useEffect, useState } from 'react'
import api, { getToken } from './api.js'

export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

// One-time move of keys saved under the previous app name.
;(function migrateKeys() {
  const pairs = [
    ['galley.records.v1', 'livetype.records.v1'],
    ['galley.prefs', 'livetype.prefs'],
    ['galley.split', 'livetype.split'],
  ]
  try {
    const ls = window.localStorage
    for (const [from, to] of pairs) {
      const v = ls.getItem(from)
      if (v != null && ls.getItem(to) == null) ls.setItem(to, v)
      if (v != null) ls.removeItem(from)
    }
    ls.removeItem('galley.theme')
  } catch {
    /* storage unavailable */
  }
})()

const RECORDS = 'livetype.records.v1'
const CHANGED = 'livetype:records'

export function getRecords() {
  return readJSON(RECORDS, {})
}

function setRecords(all) {
  writeJSON(RECORDS, all)
  window.dispatchEvent(new Event(CHANGED))
}

/** Records that re-render when the cache changes (e.g. after a server sync). */
export function useRecords() {
  const [records, set] = useState(getRecords)
  useEffect(() => {
    const on = () => set(getRecords())
    window.addEventListener(CHANGED, on)
    return () => window.removeEventListener(CHANGED, on)
  }, [])
  return records
}

/** Replace the local cache with the logged-in user's records from the server. */
export async function syncRecords() {
  const { data } = await api.get('/records')
  setRecords(data || {})
}

export function clearRecords() {
  setRecords({})
}

/** Save a finished run. Returns { prevBest, isBest }. */
export function saveRun(lessonId, run) {
  const all = getRecords()
  const rec = all[lessonId] || { runs: 0 }
  const prevBest = rec.best || null
  const isBest = !prevBest || run.wpm > prevBest.wpm
  all[lessonId] = {
    runs: (rec.runs || 0) + 1,
    done: true,
    best: isBest ? run : prevBest,
    last: run,
  }
  setRecords(all)
  if (getToken()) {
    api
      .post('/records', { lessonId, wpm: run.wpm, acc: run.acc, ms: run.ms })
      .catch((err) => console.error('기록 저장 실패:', err))
  }
  return { prevBest, isBest }
}
