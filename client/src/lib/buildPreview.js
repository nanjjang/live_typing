// Turns "what has been typed so far" into something an iframe can render.
//
// html  : typed text is <body>; scaffold.css injected.
// css   : scaffold.html is <body>; typed text (cut to last complete ; or }) in <style>.
// js    : scaffold html + css; typed text cut to the last top-level statement
//         boundary that parses, run inside try/catch.
// react : a persistent host page loads React 18 UMD + Babel standalone once;
//         code is posted in and rendered with a last-good-render guard.

export const REACT_LIBS = [
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone@7.26.4/babel.min.js',
]

const BASE_CSS =
  'html{-webkit-text-size-adjust:100%}' +
  'body{margin:16px;font:16px/1.55 system-ui,-apple-system,"Segoe UI","Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:#151412}' +
  'img,svg{max-width:100%}'

let buildSeq = 0
export function nextBuildId() {
  buildSeq += 1
  return buildSeq
}

/* Top-level statement boundaries (index just after ; } or newline at depth 0),
   skipping strings and comments. Self-contained: it is also stringified into
   the React host page. */
export function scanBoundaries(src) {
  var out = []
  var depth = 0
  var i = 0
  var n = src.length
  while (i < n) {
    var c = src[i]
    var d = src[i + 1]
    if (c === '/' && d === '/') {
      var j = src.indexOf('\n', i)
      if (j < 0) return out
      i = j
      continue
    }
    if (c === '/' && d === '*') {
      var j2 = src.indexOf('*/', i + 2)
      if (j2 < 0) return out
      i = j2 + 2
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      var k = i + 1
      while (k < n) {
        var e = src[k]
        if (e === '\\') {
          k += 2
          continue
        }
        if (e === c) break
        if (e === '\n' && c !== '`') break
        k++
      }
      if (k >= n) return out
      i = k + 1
      continue
    }
    if (c === '{' || c === '(' || c === '[') depth++
    else if (c === '}' || c === ')' || c === ']') {
      depth = depth > 0 ? depth - 1 : 0
      if (depth === 0 && c === '}') out.push(i + 1)
    } else if (depth === 0 && (c === ';' || c === '\n')) out.push(i + 1)
    i++
  }
  return out
}

function parses(code) {
  try {
    new Function(code)
    return true
  } catch {
    return false
  }
}

/** Longest prefix of `src` that is a complete, parseable script. */
export function cutJs(src) {
  if (!src.trim()) return { code: '', partial: false }
  if (/[;}\n]\s*$/.test(src) && parses(src)) return { code: src, partial: false }
  const b = scanBoundaries(src)
  let tries = 0
  for (let k = b.length - 1; k >= 0 && tries < 80; k--) {
    if (k < b.length - 1 && b[k] === b[k + 1]) continue
    const cut = src.slice(0, b[k])
    if (!cut.trim()) break
    tries++
    if (parses(cut)) return { code: cut, partial: src.slice(b[k]).includes('\n') }
  }
  return { code: '', partial: src.includes('\n') }
}

/** Drop the trailing partial declaration; close open blocks. */
export function cutCss(src) {
  let s = src
  const open = s.lastIndexOf('/*')
  if (open >= 0 && s.indexOf('*/', open) < 0) s = s.slice(0, open)
  const cut = Math.max(s.lastIndexOf(';'), s.lastIndexOf('}'))
  s = cut >= 0 ? s.slice(0, cut + 1) : ''
  let depth = 0
  for (const c of s) {
    if (c === '{') depth++
    else if (c === '}') depth = Math.max(0, depth - 1)
  }
  return s + '}'.repeat(depth)
}

/**
 * Typed HTML may stop inside <style>, <script> or a comment. Close them so
 * the partial content applies (CSS cut to its last complete declaration)
 * and nothing after it is swallowed.
 */
export function closeOpenRaw(html) {
  const lower = html.toLowerCase()
  const lastComment = lower.lastIndexOf('<!--')
  if (lastComment >= 0 && lower.indexOf('-->', lastComment) < 0) return closeOpenRaw(html.slice(0, lastComment))
  for (const tag of ['style', 'script']) {
    const open = lower.lastIndexOf(`<${tag}`)
    if (open < 0 || lower.indexOf(`</${tag}`, open) >= 0) continue
    const gt = html.indexOf('>', open)
    if (gt < 0) return html.slice(0, open)
    const inner = html.slice(gt + 1)
    if (tag === 'style') return html.slice(0, gt + 1) + cutCss(inner) + '</style>'
    const { code } = cutJs(inner)
    return html.slice(0, gt + 1) + code + '</' + 'script>'
  }
  // A tag still being typed (`<div cla`) would swallow the markup appended after it.
  return html.replace(/<\/?[A-Za-z][^<>]*$/, '')
}

function bridge(id) {
  return (
    '<script>(function(){var B=' +
    id +
    ';function post(t,m,r){try{parent.postMessage({__lt:B,type:t,message:m==null?"":String(m),id:r},"*")}catch(e){}}' +
    'window.__ltPost=post;' +
    'window.addEventListener("error",function(e){post("error",e.message)});' +
    'window.addEventListener("unhandledrejection",function(e){post("error",e.reason&&e.reason.message)});' +
    'document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a[href]");' +
    'if(a&&(a.getAttribute("href")||"").charAt(0)!=="#")e.preventDefault()},true);' +
    'document.addEventListener("submit",function(e){e.preventDefault()},true);' +
    '})();</' +
    'script>'
  )
}

const esc = (s) => String(s).replace(/<\/(script)/gi, '<\\/$1')

function doc(id, head, body) {
  return (
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    bridge(id) +
    '<style>' +
    BASE_CSS +
    '</style>' +
    head +
    '</head><body>' +
    body +
    '<script>window.__ltPost("done")</' +
    'script></body></html>'
  )
}

/**
 * Build a srcdoc for html / css / js lessons.
 * Returns { html, empty, partial }.
 */
export function buildDoc(lesson, typed, id) {
  const sc = lesson.scaffold || {}
  const scCss = sc.css ? `<style>${sc.css}</style>` : ''
  const scHtml = sc.html || ''
  switch (lesson.track) {
    case 'css': {
      const css = cutCss(typed)
      return { html: doc(id, scCss + `<style>${css}</style>`, scHtml), empty: !typed.trim(), partial: false }
    }
    case 'js': {
      const { code, partial } = cutJs(typed)
      const script = code
        ? `<script>try{\n${esc(code)}\n}catch(__e){window.__ltPost("error",__e&&__e.message)}</` + 'script>'
        : ''
      return { html: doc(id, scCss, scHtml + script), empty: !typed.trim(), partial }
    }
    default:
      return { html: doc(id, scCss, closeOpenRaw(typed)), empty: !typed.trim(), partial: false }
  }
}

function hostRunner() {
  return `(function(){
var post=window.__ltPost;
if(!window.React||!window.ReactDOM||!window.Babel){post("libfail","");return;}
var scan=${scanBoundaries.toString()};
var orig=ReactDOM.createRoot;var live=[];var pending=null;var failed=false;
class Guard extends React.Component{constructor(p){super(p);this.state={e:false}}
static getDerivedStateFromError(){return {e:true}}
componentDidCatch(err){failed=err||true}
render(){return this.state.e?null:this.props.children}}
ReactDOM.createRoot=function(el,o){var r=orig.call(ReactDOM,el,o);var rr=r.render.bind(r);
r.render=function(node){ReactDOM.flushSync(function(){rr(React.createElement(Guard,null,node))})};
(pending||live).push(r);return r};
function compile(s){return Babel.transform(s,{presets:["react"],sourceType:"script"}).code}
function pick(src){
try{return {code:compile(src),partial:false}}catch(e){}
var b=scan(src),t=0;
for(var k=b.length-1;k>=0&&t<14;k--){if(k<b.length-1&&b[k]===b[k+1])continue;var cut=src.slice(0,b[k]);if(!cut.trim())break;t++;
try{return {code:compile(cut),partial:src.slice(b[k]).indexOf("\\n")>=0}}catch(e){}}
return null}
function unmount(r){try{r.unmount()}catch(e){}}
function clearAll(){live.forEach(unmount);live=[];var el=document.getElementById("root");if(el)el.innerHTML="";}
function run(src,id){
var p=pick(src);if(!p){post("partial","",id);return;}
var cur=document.getElementById("root");var next=cur.cloneNode(false);var disp=next.style.display;
next.style.display="none";cur.removeAttribute("id");cur.parentNode.insertBefore(next,cur);
pending=[];failed=false;var err=null;
try{var A=(new Function("React","ReactDOM",p.code+"\\n;return typeof App==='function'?App:null;"))(React,ReactDOM);
if(!pending.length&&A){ReactDOM.createRoot(next).render(React.createElement(A))}}catch(e){err=e}
var roots=pending;pending=null;
if(err||failed||!roots.length){roots.forEach(unmount);next.remove();cur.id="root";
post(err||failed?(p.partial?"partial":"error"):"partial",err&&err.message,id);return;}
live.forEach(unmount);cur.remove();next.style.display=disp;live=roots;
post(p.partial?"partial":"ok","",id)}
window.addEventListener("message",function(e){var d=e.data;if(!d||typeof d.__ltRun!=="string")return;
if(!d.__ltRun.trim()){clearAll();post("empty","",d.id);return;}run(d.__ltRun,d.id)});
post("ready","");
})();`
}

/** Persistent host page for react lessons. */
export function buildReactHost(lesson, id) {
  const sc = lesson.scaffold || {}
  let body = sc.html || ''
  if (!/id\s*=\s*["']root["']/.test(body)) body += '<div id="root"></div>'
  const libs = REACT_LIBS.map(
    (src) => `<script src="${src}" onerror="window.__ltPost('libfail','')"></` + 'script>',
  ).join('')
  return (
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    bridge(id) +
    '<style>' +
    BASE_CSS +
    '</style>' +
    (sc.css ? `<style>${sc.css}</style>` : '') +
    '</head><body>' +
    body +
    libs +
    '<script>' +
    hostRunner() +
    '</' +
    'script></body></html>'
  )
}
