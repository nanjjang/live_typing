// Snippets the landing hero box types by itself. Rendered as html-track lessons.

// Fixed context (not typed): a Korean-capable system font stack.
const scaffold = {
  css:
    "html,body{margin:0}" +
    "body{font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif;color:#1d1d1f;-webkit-font-smoothing:antialiased}",
}

export default [
  {
    id: 'hero-headline',
    track: 'html',
    title: '헤드라인',
    typo: 52,
    scaffold,
    code: `<style>
  .hero { padding: 40px 32px; }
  h1 {
    font-size: 52px;
    letter-spacing: -2px;
    margin: 0;
  }
  p { color: #6e6e73; font-size: 19px; }
  a { color: #0071e3; text-decoration: none; }
</style>
<div class="hero">
  <h1>안녕하세요.</h1>
  <p>치는 대로 그려집니다.</p>
  <a href="#">더 알아보기</a>
</div>`,
  },
  {
    id: 'hero-button',
    track: 'html',
    title: '버튼',
    typo: 90,
    scaffold,
    code: `<style>
  body {
    display: grid; place-items: center;
    height: 100vh;
  }
  button {
    height: 44px; padding: 0 24px;
    font-size: 17px; color: #fff;
    border: 0; border-radius: 980px;
    background: #000;
    transition: background .2s;
  }
  button:hover { background: #0071e3; }
</style>
<button>시작하기</button>`,
  },
  {
    id: 'hero-card',
    track: 'html',
    title: '카드',
    typo: 120,
    scaffold,
    code: `<style>
  body { padding: 28px; background: #f5f5f7; }
  .card {
    max-width: 280px; padding: 24px;
    background: #fff; border-radius: 18px;
  }
  .tag { font: 12px monospace; color: #86868b; }
  h2 { margin: 8px 0 16px; font-size: 24px; }
  .bar { height: 6px; background: #e8e8ed; }
  .fill { width: 64%; height: 6px; background: #0071e3; }
</style>
<div class="card">
  <div class="tag">css · 12줄</div>
  <h2>오늘의 연습</h2>
  <div class="bar"><div class="fill"></div></div>
</div>`,
  },
]
