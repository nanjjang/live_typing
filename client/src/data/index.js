import lessons, { tracks } from './lessons.js'

// Chapter metaphor: each track is a 장 (chapter), each lesson a 편.
const CHAPTER_NAME = { html: '뼈대', css: '옷', js: '움직임', react: '부품' }
const TRACK_FULL = { html: 'HTML', css: 'CSS', js: 'JavaScript', react: 'React' }

const lineCount = (code) => String(code).replace(/\s+$/, '').split('\n').length

export const chapters = tracks
  .map((t, i) => ({
    id: t.id,
    no: i + 1,
    name: CHAPTER_NAME[t.id] || t.label,
    label: t.label,
    full: TRACK_FULL[t.id] || t.label,
    blurb: t.blurb,
    lessons: lessons
      .filter((l) => l.track === t.id)
      .map((l, k) => ({ ...l, part: k + 1, lines: lineCount(l.code) })),
  }))
  .filter((c) => c.lessons.length)
  .map((c, i) => ({ ...c, no: i + 1, lessons: c.lessons.map((l) => ({ ...l, chapterNo: i + 1 })) }))

export const allLessons = chapters.flatMap((c) => c.lessons)

export const chapterOf = (lesson) => chapters.find((c) => c.id === lesson.track)

export function findLesson(id) {
  return allLessons.find((l) => l.id === id) || null
}

export function nextLesson(id) {
  const i = allLessons.findIndex((l) => l.id === id)
  return i >= 0 && i < allLessons.length - 1 ? allLessons[i + 1] : null
}

export const totalLines = allLessons.reduce((n, l) => n + l.lines, 0)
