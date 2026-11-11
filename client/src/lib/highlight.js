// Minimal syntax classing. Returns one class per character:
// '' plain · 'k' keyword / at-rule · 't' tag or selector · 'f' function,
// attribute or property name · 's' string · 'c' comment.
// The editor only colors characters that were already typed.

const JS_KW = new Set(
  ('const let var function return if else for while do switch case break continue new class ' +
    'extends import export default from of in typeof instanceof try catch finally throw async ' +
    'await true false null undefined this').split(' '),
)

function fill(out, from, to, cls) {
  for (let i = from; i < to && i < out.length; i++) out[i] = cls
}

function scanString(src, i) {
  const q = src[i]
  let j = i + 1
  while (j < src.length) {
    const c = src[j]
    if (c === '\\') {
      j += 2
      continue
    }
    if (c === q) return j + 1
    if (c === '\n' && q !== '`') return j
    j++
  }
  return j
}

function classifyJs(src, out, offset = 0, jsx = false) {
  let i = 0
  let prevSig = ''
  while (i < src.length) {
    const c = src[i]
    const n = src[i + 1]
    if (c === '/' && n === '/') {
      let j = src.indexOf('\n', i)
      if (j < 0) j = src.length
      fill(out, offset + i, offset + j, 'c')
      i = j
      continue
    }
    if (c === '/' && n === '*') {
      let j = src.indexOf('*/', i + 2)
      j = j < 0 ? src.length : j + 2
      fill(out, offset + i, offset + j, 'c')
      i = j
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      const j = scanString(src, i)
      fill(out, offset + i, offset + j, 's')
      i = j
      prevSig = 's'
      continue
    }
    if (jsx && c === '<' && /[A-Za-z/>]/.test(n || '') && /^$|[(=>?:&|{},\n]|return$/.test(prevSig)) {
      let j = i + 1
      if (src[j] === '/') j++
      const s = j
      while (j < src.length && /[\w.]/.test(src[j])) j++
      fill(out, offset + i, offset + j, 't')
      if (j === s) fill(out, offset + i, offset + j + 1, 't')
      prevSig = '<'
      i = j
      continue
    }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i
      while (j < src.length && /[\w$]/.test(src[j])) j++
      const word = src.slice(i, j)
      if (JS_KW.has(word)) fill(out, offset + i, offset + j, 'k')
      else {
        let m = j
        while (m < src.length && src[m] === ' ') m++
        if (src[m] === '(') fill(out, offset + i, offset + j, 'f')
      }
      prevSig = word === 'return' ? 'return' : 'w'
      i = j
      continue
    }
    if (!/\s/.test(c)) prevSig = c
    else if (c === '\n' && prevSig !== 'w') prevSig = '\n'
    i++
  }
}

function classifyCss(src, out, offset = 0) {
  let i = 0
  let depth = 0
  while (i < src.length) {
    const c = src[i]
    if (c === '/' && src[i + 1] === '*') {
      let j = src.indexOf('*/', i + 2)
      j = j < 0 ? src.length : j + 2
      fill(out, offset + i, offset + j, 'c')
      i = j
      continue
    }
    if (c === '"' || c === "'") {
      const j = scanString(src, i)
      fill(out, offset + i, offset + j, 's')
      i = j
      continue
    }
    if (c === '{') depth++
    else if (c === '}') depth = Math.max(0, depth - 1)
    else if (c === '@') {
      let j = i + 1
      while (j < src.length && /[\w-]/.test(src[j])) j++
      fill(out, offset + i, offset + j, 'k')
      i = j
      continue
    } else if (depth === 0 && !/\s/.test(c)) {
      // selector text
      out[offset + i] = 't'
    } else if (depth > 0 && /[a-zA-Z-]/.test(c)) {
      let p = i - 1
      while (p >= 0 && /\s/.test(src[p])) p--
      if (p < 0 || src[p] === '{' || src[p] === ';') {
        let j = i
        while (j < src.length && /[\w-]/.test(src[j])) j++
        let m = j
        while (m < src.length && src[m] === ' ') m++
        if (src[m] === ':') fill(out, offset + i, offset + j, 'f')
        i = j
        continue
      }
    }
    i++
  }
}

function classifyHtml(src, out) {
  let i = 0
  while (i < src.length) {
    if (src.startsWith('<!--', i)) {
      let j = src.indexOf('-->', i + 4)
      j = j < 0 ? src.length : j + 3
      fill(out, i, j, 'c')
      i = j
      continue
    }
    if (src[i] === '<' && /[A-Za-z/!]/.test(src[i + 1] || '')) {
      let j = i + 1
      if (src[j] === '/') j++
      const ns = j
      while (j < src.length && /[\w-]/.test(src[j])) j++
      const name = src.slice(ns, j).toLowerCase()
      const closing = src[i + 1] === '/'
      fill(out, i, j, 't')
      // attributes until '>'
      while (j < src.length && src[j] !== '>') {
        if (src[j] === '"' || src[j] === "'") {
          const k = scanString(src, j)
          fill(out, j, k, 's')
          j = k
        } else if (/[A-Za-z]/.test(src[j]) && /\s/.test(src[j - 1])) {
          const a = j
          while (j < src.length && /[\w:-]/.test(src[j])) j++
          fill(out, a, j, 'f')
        } else j++
      }
      if (j < src.length) out[j] = 't'
      j++
      if (!closing && (name === 'style' || name === 'script')) {
        let end = src.toLowerCase().indexOf(`</${name}`, j)
        if (end < 0) end = src.length
        const inner = src.slice(j, end)
        if (name === 'style') classifyCss(inner, out, j)
        else classifyJs(inner, out, j)
        j = end
      }
      i = j
      continue
    }
    i++
  }
}

export function classify(code, track) {
  const out = new Array(code.length).fill('')
  if (track === 'css') classifyCss(code, out)
  else if (track === 'js') classifyJs(code, out)
  else if (track === 'react') classifyJs(code, out, 0, true)
  else classifyHtml(code, out)
  return out
}
