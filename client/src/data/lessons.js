// Lesson content for livetype.
// code: typed by the user (ASCII, 2-space indent, LF, <= 72 cols).
// scaffold: fixed context for the preview, never typed.

export const tracks = [
  {
    id: 'html',
    label: 'HTML',
    blurb: '태그 몇 줄로 화면의 뼈대를 세웁니다. 치는 순서대로 문서가 생겨납니다.',
  },
  {
    id: 'css',
    label: 'CSS',
    blurb: '같은 마크업, 다른 화면. 속성 하나마다 레이아웃이 바뀌는 걸 지켜보세요.',
  },
  {
    id: 'js',
    label: 'JavaScript',
    blurb: '버튼이 눌리고 시계가 갑니다. 문장이 완성되는 순간 코드가 실행됩니다.',
  },
  {
    id: 'react',
    label: 'React',
    blurb: '컴포넌트와 상태로 작은 앱을 만듭니다. JSX가 닫히면 바로 렌더링됩니다.',
  },
];

const PAPER = `
  html, body { margin: 0; }
  body {
    min-height: 100vh;
    background: #f4f1ea;
    color: #1b1b1b;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  * { box-sizing: border-box; }
`;

const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

const REACT_ROOT = '<div id="root"></div>';

const lessons = [
  /* ------------------------------------------------------------ HTML */
  {
    id: 'html-01',
    track: 'html',
    title: '명함 한 장',
    summary: '제목과 문단 태그만으로 단정한 명함 카드를 만듭니다.',
    level: 1,
    code: `<div class="card">
  <p class="role">Frontend Developer</p>
  <h1>Kim Junseo</h1>
  <p class="bio">I build small, careful interfaces for the web.</p>
  <hr>
  <p class="contact">hello@junseo.dev</p>
  <p class="contact">Seoul, Korea</p>
</div>`,
    scaffold: {
      css: `${PAPER}
  body { display: grid; place-items: center; padding: 24px; }
  .card {
    width: 300px; padding: 32px 28px;
    background: #fffdf8; border: 1px solid #1b1b1b;
    box-shadow: 8px 8px 0 #1b1b1b;
    font-family: Georgia, 'Times New Roman', serif;
  }
  .role {
    margin: 0 0 10px; font: 600 11px/1 ${MONO};
    letter-spacing: .16em; text-transform: uppercase; color: #ff5a1f;
  }
  h1 { margin: 0 0 12px; font-size: 34px; font-weight: 400; line-height: 1.05; }
  .bio { margin: 0; font-size: 15px; line-height: 1.5; color: #4a463f; }
  hr { margin: 24px 0 16px; border: 0; border-top: 1px solid #d9d2c3; }
  .contact { margin: 4px 0; font: 13px/1.4 ${MONO}; color: #6b655a; }
`,
    },
  },
  {
    id: 'html-02',
    track: 'html',
    title: '레시피 카드',
    summary: '순서 없는 목록과 순서 있는 목록으로 레시피 한 장을 완성합니다.',
    level: 1,
    code: `<article class="recipe">
  <p class="meta">10 min / 1 serving</p>
  <h1>Morning Toast</h1>
  <h2>Ingredients</h2>
  <ul>
    <li>Sourdough, 2 slices</li>
    <li>Butter, 1 tbsp</li>
    <li>Honey, a little</li>
    <li>Sea salt, a pinch</li>
  </ul>
  <h2>Steps</h2>
  <ol>
    <li>Toast the bread until golden.</li>
    <li>Spread the butter while it is warm.</li>
    <li>Finish with honey and salt.</li>
  </ol>
</article>`,
    scaffold: {
      css: `${PAPER}
  body { padding: 40px 24px; }
  .recipe {
    max-width: 380px; margin: 0 auto; padding: 32px;
    background: #fffdf8; border-top: 6px solid #1b1b1b;
  }
  .meta { margin: 0; font: 12px/1 ${MONO}; color: #8a8172; }
  h1 {
    margin: 10px 0 24px; font-family: Georgia, serif;
    font-size: 40px; font-weight: 400; letter-spacing: -.01em;
  }
  h2 {
    margin: 24px 0 8px; font-size: 11px; letter-spacing: .18em;
    text-transform: uppercase; color: #ff5a1f;
  }
  ul, ol { margin: 0; padding-left: 20px; line-height: 1.8; font-size: 15px; }
  ul li::marker { color: #b0a794; }
  ol li::marker { font-family: ${MONO}; color: #8a8172; }
`,
    },
  },
  {
    id: 'html-03',
    track: 'html',
    title: '한 편의 글',
    summary: 'header, nav, main, footer로 읽기 좋은 블로그 글 한 편을 짭니다.',
    level: 2,
    code: `<header>
  <strong>Field Notes</strong>
  <nav>
    <a href="#">Essays</a>
    <a href="#">Archive</a>
    <a href="#">About</a>
  </nav>
</header>
<main>
  <p class="kicker">Issue 12</p>
  <h1>Slow software is a design choice</h1>
  <p>Every loading spinner is a small apology. Most of them could
  be avoided by sending less and doing less.</p>
  <blockquote>Speed is a feature you can feel.</blockquote>
  <p>Start with plain HTML. It loads before you finish blinking,
  and it still works when everything else breaks.</p>
</main>
<footer>Written in plain HTML.</footer>`,
    scaffold: {
      css: `${PAPER}
  body { background: #fffdf8; }
  header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 28px; border-bottom: 1px solid #1b1b1b;
  }
  header strong { font-family: Georgia, serif; font-size: 18px; }
  nav { display: flex; gap: 18px; }
  nav a { color: #1b1b1b; text-decoration: none; font-size: 13px; }
  nav a:hover { color: #ff5a1f; }
  main { max-width: 520px; margin: 0 auto; padding: 40px 28px; }
  .kicker {
    font: 12px/1 ${MONO}; color: #ff5a1f;
    letter-spacing: .1em; text-transform: uppercase;
  }
  h1 {
    margin: 12px 0 24px; font-family: Georgia, serif; font-weight: 400;
    font-size: 38px; line-height: 1.1; letter-spacing: -.01em;
  }
  main p { font-size: 16px; line-height: 1.7; color: #3a3631; }
  blockquote {
    margin: 28px 0; padding-left: 20px; border-left: 3px solid #ff5a1f;
    font-family: Georgia, serif; font-style: italic; font-size: 22px;
  }
  footer {
    padding: 20px 28px; border-top: 1px solid #e4ddcf;
    font: 12px/1 ${MONO}; color: #8a8172;
  }
`,
    },
  },
  {
    id: 'html-04',
    track: 'html',
    title: '주간 시간표',
    summary: 'table, thead, tbody로 한 주의 시간표를 표로 정리합니다.',
    level: 2,
    code: `<table>
  <caption>Weekly Schedule</caption>
  <thead>
    <tr>
      <th></th>
      <th>Mon</th>
      <th>Tue</th>
      <th>Wed</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>09:00</th>
      <td>Math</td>
      <td>English</td>
      <td class="free">Free</td>
    </tr>
    <tr>
      <th>11:00</th>
      <td>Physics</td>
      <td class="hot">Coding</td>
      <td>History</td>
    </tr>
    <tr>
      <th>14:00</th>
      <td class="hot">Coding</td>
      <td>Art</td>
      <td>Music</td>
    </tr>
  </tbody>
</table>`,
    scaffold: {
      css: `${PAPER}
  body { display: grid; place-items: center; padding: 24px; }
  table {
    border-collapse: collapse; background: #fffdf8;
    border: 1px solid #1b1b1b; min-width: 340px;
  }
  caption {
    caption-side: top; text-align: left; padding-bottom: 12px;
    font-family: Georgia, serif; font-size: 26px;
  }
  th, td { padding: 12px 16px; border: 1px solid #e4ddcf; text-align: left; }
  thead th {
    background: #1b1b1b; color: #f4f1ea; border-color: #1b1b1b;
    font-size: 11px; letter-spacing: .14em; text-transform: uppercase;
  }
  tbody th { font: 12px/1 ${MONO}; color: #8a8172; font-weight: 400; }
  td { font-size: 14px; }
  .hot { background: #ff5a1f; color: #fffdf8; font-weight: 600; }
  .free { color: #b0a794; font-style: italic; }
`,
    },
  },
  {
    id: 'html-05',
    track: 'html',
    title: '베타 신청 폼',
    summary: 'label, input, button으로 군더더기 없는 신청 폼을 만듭니다.',
    level: 3,
    code: `<form class="signup" onsubmit="return false">
  <p class="tag">Private beta</p>
  <h1>Join the waitlist</h1>
  <p class="lead">One email when it is ready. Nothing else.</p>
  <label>
    Name
    <input type="text" placeholder="Your name">
  </label>
  <label>
    Email
    <input type="email" placeholder="you@example.com">
  </label>
  <label class="check">
    <input type="checkbox" checked>
    Send me release notes
  </label>
  <button type="submit">Request access</button>
</form>`,
    scaffold: {
      css: `${PAPER}
  body { display: grid; place-items: center; padding: 24px; }
  .signup {
    width: 340px; padding: 32px; background: #fffdf8;
    border: 1px solid #1b1b1b; display: grid; gap: 14px;
  }
  .tag {
    margin: 0; font: 11px/1 ${MONO}; color: #ff5a1f;
    letter-spacing: .14em; text-transform: uppercase;
  }
  h1 { margin: 0; font-family: Georgia, serif; font-weight: 400; font-size: 30px; }
  .lead { margin: 0 0 6px; font-size: 14px; color: #6b655a; }
  label { display: grid; gap: 6px; font-size: 12px; font-weight: 600; }
  input[type=text], input[type=email] {
    font: inherit; font-size: 15px; font-weight: 400;
    padding: 10px 12px; border: 1px solid #cfc7b6; background: #fff;
    outline: none;
  }
  input:focus { border-color: #1b1b1b; box-shadow: 3px 3px 0 #1b1b1b; }
  .check {
    display: flex; align-items: center; gap: 8px;
    font-weight: 400; color: #4a463f;
  }
  .check input { accent-color: #ff5a1f; width: 16px; height: 16px; }
  button {
    margin-top: 6px; padding: 12px; border: 0; cursor: pointer;
    background: #1b1b1b; color: #fffdf8; font: inherit; font-weight: 600;
  }
  button:hover { background: #ff5a1f; }
`,
    },
  },

  /* ------------------------------------------------------------- CSS */
  {
    id: 'css-01',
    track: 'css',
    title: '타이포 포스터',
    summary: '맨 텍스트를 여백과 글자 크기만으로 페스티벌 포스터로 바꿉니다.',
    level: 1,
    code: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #e9e4d8;
  font-family: Georgia, serif;
}
.poster {
  width: 300px;
  padding: 32px;
  background: #1b1b1b;
  color: #e9e4d8;
}
.top {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
h1 {
  margin: 48px 0;
  font-size: 68px;
  font-weight: 400;
  line-height: 0.9;
}
.date {
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid #e9e4d8;
  color: #ff5a1f;
}`,
    scaffold: {
      html: `<main class="poster">
  <p class="top">Seoul Type Festival</p>
  <h1>Form<br>Follows<br>Text</h1>
  <p class="date">11.21 - 11.23 / Euljiro</p>
</main>`,
    },
  },
  {
    id: 'css-02',
    track: 'css',
    title: '버튼 세 종류',
    summary: '기본, 고스트, 위험 버튼을 만들고 hover 움직임까지 다듬습니다.',
    level: 1,
    code: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #fafaf7;
  font-family: system-ui, sans-serif;
}
.row {
  display: flex;
  gap: 12px;
}
.btn {
  padding: 12px 20px;
  border: 1px solid #111;
  border-radius: 6px;
  background: #111;
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 0 #111;
}
.ghost {
  background: transparent;
  color: #111;
}
.danger {
  border-color: #c2410c;
  background: #c2410c;
}`,
    scaffold: {
      html: `<div class="row">
  <button class="btn">Save changes</button>
  <button class="btn ghost">Cancel</button>
  <button class="btn danger">Delete</button>
</div>`,
    },
  },
  {
    id: 'css-03',
    track: 'css',
    title: '플레이리스트',
    summary: 'flex 하나로 번호, 제목, 재생 시간이 줄 맞춰 정렬된 목록을 만듭니다.',
    level: 2,
    code: `body {
  margin: 0;
  padding: 40px 20px;
  background: #f2efe9;
  font-family: system-ui, sans-serif;
}
.list {
  max-width: 360px;
  margin: 0 auto;
  padding: 0;
  list-style: none;
  background: #fff;
  border: 1px solid #ddd6c8;
}
li {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid #eee8dc;
}
li div {
  display: flex;
  flex-direction: column;
  flex: 1;
}
small {
  color: #8a8172;
}
.no, time {
  font-family: ui-monospace, monospace;
  font-size: 13px;
  color: #b0a794;
}
li:hover {
  background: #faf7f1;
}`,
    scaffold: {
      html: `<ul class="list">
  <li><span class="no">01</span><div><b>Blue in Green</b><small>Miles Davis</small></div><time>5:37</time></li>
  <li><span class="no">02</span><div><b>Naima</b><small>John Coltrane</small></div><time>4:21</time></li>
  <li><span class="no">03</span><div><b>Peace Piece</b><small>Bill Evans</small></div><time>6:42</time></li>
  <li><span class="no">04</span><div><b>Lonely Woman</b><small>Ornette Coleman</small></div><time>4:59</time></li>
</ul>`,
    },
  },
  {
    id: 'css-04',
    track: 'css',
    title: '그리드 벤토',
    summary: 'grid와 span으로 크기가 다른 타일을 한 판에 짜 맞춥니다.',
    level: 2,
    code: `body {
  margin: 0;
  padding: 24px;
  background: #141414;
  font-family: system-ui, sans-serif;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 90px;
  gap: 8px;
}
.grid div {
  display: flex;
  align-items: flex-end;
  padding: 12px;
  background: #242424;
  color: #e9e4d8;
  font-weight: 600;
}
.grid .a {
  grid-column: span 2;
  grid-row: span 2;
  background: #ff5a1f;
  color: #141414;
  font-size: 44px;
}
.grid .d {
  grid-column: span 2;
  background: #e9e4d8;
  color: #141414;
}
.grid .f {
  grid-column: span 3;
}`,
    scaffold: {
      html: `<section class="grid">
  <div class="a">Grid</div>
  <div class="b">01</div>
  <div class="c">Rows</div>
  <div class="d">Columns</div>
  <div class="e">Gap</div>
  <div class="f">Span</div>
</section>`,
    },
  },
  {
    id: 'css-05',
    track: 'css',
    title: '로딩 애니메이션',
    summary: '@keyframes와 지연 시간으로 통통 튀는 로딩 점 세 개를 만듭니다.',
    level: 3,
    code: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-content: center;
  justify-items: center;
  background: #f4f1ea;
  font-family: system-ui, sans-serif;
}
.dots {
  display: flex;
  gap: 10px;
}
.dots span {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #1b1b1b;
  animation: bounce 0.9s ease-in-out infinite;
}
.dots span:nth-child(2) {
  animation-delay: 0.15s;
}
.dots span:nth-child(3) {
  animation-delay: 0.3s;
  background: #ff5a1f;
}
@keyframes bounce {
  50% {
    transform: translateY(-18px);
  }
}
p {
  margin-top: 28px;
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #8a8172;
}`,
    scaffold: {
      html: `<div class="dots"><span></span><span></span><span></span></div>
<p>Loading</p>`,
    },
  },

  /* -------------------------------------------------------------- JS */
  {
    id: 'js-01',
    track: 'js',
    title: '카운터',
    summary: '버튼 클릭 이벤트로 숫자를 올리고 내리는 카운터를 만듭니다.',
    level: 1,
    code: `const value = document.querySelector('#value');
const plus = document.querySelector('#plus');
const minus = document.querySelector('#minus');
let count = 0;

function render() {
  value.textContent = count;
  value.style.color = count < 0 ? '#c2410c' : '#1b1b1b';
}

plus.addEventListener('click', () => {
  count += 1;
  render();
});

minus.addEventListener('click', () => {
  count -= 1;
  render();
});`,
    scaffold: {
      html: `<main>
  <p class="label">Count</p>
  <output id="value">0</output>
  <div class="row">
    <button id="minus" aria-label="minus">-</button>
    <button id="plus" aria-label="plus">+</button>
  </div>
</main>`,
      css: `${PAPER}
  body { display: grid; place-items: center; }
  main { text-align: center; }
  .label {
    margin: 0; font: 11px/1 ${MONO}; color: #8a8172;
    letter-spacing: .2em; text-transform: uppercase;
  }
  output {
    display: block; margin: 8px 0 24px;
    font: 400 120px/1 Georgia, serif; font-variant-numeric: tabular-nums;
    transition: color .2s;
  }
  .row { display: flex; gap: 10px; justify-content: center; }
  button {
    width: 56px; height: 56px; border: 1px solid #1b1b1b; background: #fffdf8;
    font: 400 24px/1 ${MONO}; cursor: pointer; color: #1b1b1b;
  }
  button:hover { background: #1b1b1b; color: #fffdf8; }
  #plus { background: #ff5a1f; border-color: #ff5a1f; color: #fffdf8; }
  #plus:hover { background: #1b1b1b; border-color: #1b1b1b; }
`,
    },
  },
  {
    id: 'js-02',
    track: 'js',
    title: '디지털 시계',
    summary: 'Date와 setInterval로 1초마다 갱신되는 시계를 띄웁니다.',
    level: 1,
    code: `const timeEl = document.querySelector('#time');
const dateEl = document.querySelector('#date');

function pad(n) {
  return String(n).padStart(2, '0');
}

function tick() {
  const now = new Date();
  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  timeEl.textContent = h + ':' + m + ':' + s;
  dateEl.textContent = now.toDateString();
}

tick();
setInterval(tick, 1000);`,
    scaffold: {
      html: `<main>
  <p id="date">--- --- -- ----</p>
  <h1 id="time">--:--:--</h1>
  <p class="zone">Local time</p>
</main>`,
      css: `${PAPER}
  body { display: grid; place-items: center; background: #141414; color: #e9e4d8; }
  main { text-align: center; }
  #date {
    margin: 0; font: 12px/1 ${MONO}; color: #ff5a1f;
    letter-spacing: .2em; text-transform: uppercase;
  }
  h1 {
    margin: 16px 0; font: 300 84px/1 ${MONO};
    font-variant-numeric: tabular-nums; letter-spacing: -.02em;
  }
  .zone { margin: 0; font-size: 12px; color: #6b655a; }
`,
    },
  },
  {
    id: 'js-03',
    track: 'js',
    title: '팔레트 생성기',
    summary: 'HSL 값을 계산해 버튼을 누를 때마다 새로운 다섯 가지 색을 뽑습니다.',
    level: 2,
    code: `const box = document.querySelector('#swatches');
const button = document.querySelector('#shuffle');

function randomHue() {
  return Math.floor(Math.random() * 360);
}

function makePalette() {
  box.innerHTML = '';
  const base = randomHue();
  for (let i = 0; i < 5; i++) {
    const hue = (base + i * 24) % 360;
    const light = 28 + i * 13;
    const color = 'hsl(' + hue + ', 42%, ' + light + '%)';
    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.style.background = color;
    swatch.style.color = light > 55 ? '#1b1b1b' : '#f4f1ea';
    swatch.textContent = color;
    box.appendChild(swatch);
  }
}

button.addEventListener('click', makePalette);
makePalette();`,
    scaffold: {
      html: `<main>
  <div id="swatches"></div>
  <button id="shuffle">Shuffle</button>
</main>`,
      css: `${PAPER}
  body { display: grid; place-items: center; padding: 24px; }
  main { width: 100%; max-width: 440px; }
  #swatches {
    display: flex; height: 240px; border: 1px solid #1b1b1b;
    background: #fffdf8;
  }
  .swatch {
    flex: 1; display: flex; align-items: flex-end; padding: 10px 8px;
    font: 10px/1.3 ${MONO}; writing-mode: vertical-rl; transform: rotate(180deg);
    justify-content: flex-end;
  }
  button {
    margin-top: 14px; width: 100%; padding: 12px; cursor: pointer;
    border: 1px solid #1b1b1b; background: #1b1b1b; color: #fffdf8;
    font: 600 14px/1 system-ui, sans-serif;
  }
  button:hover { background: #ff5a1f; border-color: #ff5a1f; }
`,
    },
  },
  {
    id: 'js-04',
    track: 'js',
    title: '할 일 목록',
    summary: '배열 상태와 렌더 함수로 추가하고 지울 수 있는 할 일 목록을 만듭니다.',
    level: 2,
    code: `const form = document.querySelector('#form');
const input = document.querySelector('#input');
const list = document.querySelector('#list');
const left = document.querySelector('#left');
const todos = ['Water the plants', 'Read 20 pages'];

function render() {
  list.innerHTML = '';
  todos.forEach((text, index) => {
    const item = document.createElement('li');
    item.textContent = text;
    item.addEventListener('click', () => {
      todos.splice(index, 1);
      render();
    });
    list.appendChild(item);
  });
  left.textContent = todos.length + ' left';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push(text);
  input.value = '';
  render();
});

render();`,
    scaffold: {
      html: `<main>
  <h1>Today</h1>
  <form id="form" onsubmit="return false">
    <input id="input" placeholder="Add a task" autocomplete="off">
    <button>Add</button>
  </form>
  <ul id="list"></ul>
  <p id="left"></p>
</main>`,
      css: `${PAPER}
  body { padding: 40px 20px; }
  main { max-width: 360px; margin: 0 auto; }
  h1 { margin: 0 0 16px; font: 400 40px/1 Georgia, serif; }
  form { display: flex; border: 1px solid #1b1b1b; background: #fffdf8; }
  input {
    flex: 1; min-width: 0; padding: 12px 14px; border: 0; outline: none;
    background: transparent; font: inherit; font-size: 15px;
  }
  form button {
    padding: 0 18px; border: 0; cursor: pointer;
    background: #1b1b1b; color: #fffdf8; font: inherit; font-weight: 600;
  }
  form button:hover { background: #ff5a1f; }
  ul { list-style: none; margin: 16px 0 0; padding: 0; }
  li {
    padding: 12px 2px; border-bottom: 1px solid #ddd6c8; cursor: pointer;
    display: flex; justify-content: space-between; font-size: 15px;
  }
  li::after { content: 'done'; font: 11px/1.6 ${MONO}; color: #b0a794; }
  li:hover { color: #ff5a1f; }
  li:hover::after { color: #ff5a1f; }
  #left { font: 12px/1 ${MONO}; color: #8a8172; }
`,
    },
  },
  {
    id: 'js-05',
    track: 'js',
    title: '스톱워치',
    summary: '시작, 정지, 초기화가 되는 1/100초 단위 스톱워치를 만듭니다.',
    level: 3,
    code: `const display = document.querySelector('#display');
const toggle = document.querySelector('#toggle');
const reset = document.querySelector('#reset');
let elapsed = 0;
let startedAt = 0;
let timer = null;

function format(ms) {
  const total = Math.floor(ms / 10);
  const cs = String(total % 100).padStart(2, '0');
  const s = String(Math.floor(total / 100) % 60).padStart(2, '0');
  const m = String(Math.floor(total / 6000)).padStart(2, '0');
  return m + ':' + s + '.' + cs;
}

function update() {
  display.textContent = format(elapsed + Date.now() - startedAt);
}
toggle.addEventListener('click', () => {
  if (timer) {
    clearInterval(timer);
    elapsed += Date.now() - startedAt;
    timer = null;
    toggle.textContent = 'Start';
  } else {
    startedAt = Date.now();
    timer = setInterval(update, 30);
    toggle.textContent = 'Stop';
  }
  toggle.classList.toggle('running', timer !== null);
});

reset.addEventListener('click', () => {
  clearInterval(timer);
  timer = null;
  elapsed = 0;
  display.textContent = format(0);
  toggle.textContent = 'Start';
  toggle.classList.remove('running');
});`,
    scaffold: {
      html: `<main>
  <p class="label">Stopwatch</p>
  <h1 id="display">00:00.00</h1>
  <div class="row">
    <button id="toggle">Start</button>
    <button id="reset">Reset</button>
  </div>
</main>`,
      css: `${PAPER}
  body { display: grid; place-items: center; }
  main { text-align: center; }
  .label {
    margin: 0; font: 11px/1 ${MONO}; color: #8a8172;
    letter-spacing: .2em; text-transform: uppercase;
  }
  h1 {
    margin: 14px 0 28px; font: 300 76px/1 ${MONO};
    font-variant-numeric: tabular-nums; letter-spacing: -.03em;
  }
  .row { display: flex; gap: 10px; justify-content: center; }
  button {
    width: 120px; padding: 12px 0; cursor: pointer;
    border: 1px solid #1b1b1b; background: #fffdf8; color: #1b1b1b;
    font: 600 14px/1 system-ui, sans-serif;
  }
  #toggle { background: #1b1b1b; color: #fffdf8; }
  #toggle.running { background: #ff5a1f; border-color: #ff5a1f; }
  #reset:hover { background: #ebe5d8; }
`,
    },
  },

  /* ----------------------------------------------------------- REACT */
  {
    id: 'react-01',
    track: 'react',
    title: '프로필 컴포넌트',
    summary: 'props와 children을 넘겨 재사용 가능한 프로필 카드를 조립합니다.',
    level: 1,
    code: `function Tag({ children }) {
  return <span className="tag">{children}</span>;
}

function Profile({ name, role }) {
  return (
    <div className="card">
      <div className="avatar">{name[0]}</div>
      <h1>{name}</h1>
      <p>{role}</p>
      <div className="tags">
        <Tag>React</Tag>
        <Tag>CSS</Tag>
        <Tag>Typing</Tag>
      </div>
    </div>
  );
}

function App() {
  return <Profile name="Junseo" role="Frontend learner" />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
    scaffold: {
      html: REACT_ROOT,
      css: `${PAPER}
  #root { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
  .card {
    width: 280px; padding: 28px; text-align: center;
    background: #fffdf8; border: 1px solid #1b1b1b;
  }
  .avatar {
    width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 50%;
    display: grid; place-items: center; background: #ff5a1f; color: #fffdf8;
    font: 400 34px/1 Georgia, serif;
  }
  h1 { margin: 0; font: 400 28px/1.1 Georgia, serif; }
  p { margin: 6px 0 20px; font-size: 14px; color: #6b655a; }
  .tags { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
  .tag {
    padding: 5px 10px; border: 1px solid #cfc7b6;
    font: 11px/1 ${MONO}; color: #4a463f;
  }
`,
    },
  },
  {
    id: 'react-02',
    track: 'react',
    title: '스텝 카운터',
    summary: 'useState 두 개로 증가 폭을 고를 수 있는 카운터를 만듭니다.',
    level: 1,
    code: `const { useState } = React;

function App() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  return (
    <div className="counter">
      <p className="label">Counter</p>
      <h1>{count}</h1>
      <div className="row">
        <button onClick={() => setCount(count - step)}>-{step}</button>
        <button onClick={() => setCount(count + step)}>+{step}</button>
      </div>
      <div className="steps">
        {[1, 5, 10].map((n) => (
          <button
            key={n}
            className={n === step ? 'active' : ''}
            onClick={() => setStep(n)}
          >
            step {n}
          </button>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
    scaffold: {
      html: REACT_ROOT,
      css: `${PAPER}
  #root { min-height: 100vh; display: grid; place-items: center; }
  .counter { text-align: center; }
  .label {
    margin: 0; font: 11px/1 ${MONO}; color: #8a8172;
    letter-spacing: .2em; text-transform: uppercase;
  }
  h1 {
    margin: 8px 0 24px; font: 400 112px/1 Georgia, serif;
    font-variant-numeric: tabular-nums;
  }
  button { cursor: pointer; font-family: ${MONO}; }
  .row { display: flex; gap: 10px; justify-content: center; }
  .row button {
    width: 76px; height: 52px; border: 1px solid #1b1b1b;
    background: #fffdf8; color: #1b1b1b; font-size: 16px;
  }
  .row button:last-child { background: #1b1b1b; color: #fffdf8; }
  .row button:hover { background: #ff5a1f; border-color: #ff5a1f; color: #fffdf8; }
  .steps { display: flex; gap: 4px; justify-content: center; margin-top: 16px; }
  .steps button {
    padding: 6px 10px; border: 0; background: transparent;
    font-size: 12px; color: #8a8172; border-bottom: 2px solid transparent;
  }
  .steps button.active { color: #1b1b1b; border-bottom-color: #ff5a1f; }
`,
    },
  },
  {
    id: 'react-03',
    track: 'react',
    title: '다크 모드 스위치',
    summary: '불리언 상태 하나로 토글 스위치와 화면 테마를 함께 바꿉니다.',
    level: 2,
    code: `const { useState } = React;

function Switch({ on, onToggle }) {
  return (
    <button
      className={on ? 'switch on' : 'switch'}
      onClick={onToggle}
      aria-pressed={on}
    >
      <span className="knob" />
    </button>
  );
}

function App() {
  const [dark, setDark] = useState(false);

  return (
    <main className={dark ? 'page dark' : 'page'}>
      <div className="panel">
        <div>
          <h1>Dark mode</h1>
          <p>{dark ? 'Easy on the eyes.' : 'Bright and clear.'}</p>
        </div>
        <Switch on={dark} onToggle={() => setDark(!dark)} />
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
    scaffold: {
      html: REACT_ROOT,
      css: `${PAPER}
  .page {
    min-height: 100vh; display: grid; place-items: center; padding: 24px;
    background: #f4f1ea; color: #1b1b1b; transition: background .35s, color .35s;
  }
  .page.dark { background: #141414; color: #e9e4d8; }
  .panel {
    width: 320px; display: flex; align-items: center; justify-content: space-between;
    gap: 16px; padding: 22px 24px; border: 1px solid currentColor;
  }
  h1 { margin: 0; font: 400 24px/1.1 Georgia, serif; }
  p { margin: 6px 0 0; font-size: 13px; opacity: .65; }
  .switch {
    position: relative; flex: none; width: 56px; height: 30px; padding: 0;
    border: 1px solid currentColor; border-radius: 30px; cursor: pointer;
    background: transparent; color: inherit; transition: background .25s;
  }
  .switch.on { background: #ff5a1f; border-color: #ff5a1f; }
  .knob {
    position: absolute; top: 3px; left: 3px; width: 22px; height: 22px;
    border-radius: 50%; background: currentColor;
    transition: transform .25s cubic-bezier(.3,.7,.2,1);
  }
  .switch.on .knob { transform: translateX(26px); background: #141414; }
`,
    },
  },
  {
    id: 'react-04',
    track: 'react',
    title: '리액트 할 일 목록',
    summary: '배열 상태를 불변으로 갱신하며 추가와 완료 체크가 되는 목록을 만듭니다.',
    level: 3,
    code: `const { useState } = React;

function App() {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState([
    { id: 1, title: 'Practice typing', done: true },
    { id: 2, title: 'Build a todo app', done: false },
  ]);
  const left = todos.filter((t) => !t.done).length;

  function add(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setTodos([...todos, { id: Date.now(), title: text, done: false }]);
    setText('');
  }
  function toggle(id) {
    setTodos(todos.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    ));
  }

  return (
    <div className="todo">
      <h1>Todo <small>{left} left</small></h1>
      <form onSubmit={add}>
        <input value={text} onChange={(e) => setText(e.target.value)} />
        <button>Add</button>
      </form>
      <ul>
        {todos.map((t) => (
          <li key={t.id} className={t.done ? 'done' : ''}
            onClick={() => toggle(t.id)}>{t.title}</li>
        ))}
      </ul>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
    scaffold: {
      html: REACT_ROOT,
      css: `${PAPER}
  #root { padding: 40px 20px; }
  .todo { max-width: 360px; margin: 0 auto; }
  h1 {
    margin: 0 0 16px; font: 400 40px/1 Georgia, serif;
    display: flex; align-items: baseline; justify-content: space-between;
  }
  h1 small { font: 12px/1 ${MONO}; color: #8a8172; }
  form { display: flex; border: 1px solid #1b1b1b; background: #fffdf8; }
  input {
    flex: 1; min-width: 0; padding: 12px 14px; border: 0; outline: none;
    background: transparent; font: inherit; font-size: 15px;
  }
  form button {
    padding: 0 18px; border: 0; cursor: pointer;
    background: #1b1b1b; color: #fffdf8; font: inherit; font-weight: 600;
  }
  form button:hover { background: #ff5a1f; }
  ul { list-style: none; margin: 16px 0 0; padding: 0; }
  li {
    position: relative; padding: 12px 2px 12px 30px; cursor: pointer;
    border-bottom: 1px solid #ddd6c8; font-size: 15px; transition: color .2s;
  }
  li::before {
    content: ''; position: absolute; left: 2px; top: 50%;
    width: 14px; height: 14px; margin-top: -8px; border: 1px solid #1b1b1b;
  }
  li.done { color: #b0a794; text-decoration: line-through; }
  li.done::before { background: #ff5a1f; border-color: #ff5a1f; }
`,
    },
  },
  {
    id: 'react-05',
    track: 'react',
    title: '집중 타이머',
    summary: 'useEffect로 인터벌을 걸고 정리하는 포모도로 타이머를 완성합니다.',
    level: 3,
    code: `const { useState, useEffect } = React;

function App() {
  const [total, setTotal] = useState(25 * 60);
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);
  function pick(min) {
    setTotal(min * 60);
    setLeft(min * 60);
    setRunning(false);
  }
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const pct = (left / total) * 100 + '%';

  return (
    <div className="timer">
      <div className="bar" style={{ width: pct }} />
      <h1>{mm}:{ss}</h1>
      <button className="main" onClick={() => setRunning(!running)}>
        {running ? 'Pause' : 'Start'}
      </button>
      <div className="presets">
        {[5, 15, 25].map((m) => (
          <button key={m} onClick={() => pick(m)}>{m} min</button>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
    scaffold: {
      html: REACT_ROOT,
      css: `${PAPER}
  #root { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
  .timer { width: 300px; text-align: center; }
  .timer { box-shadow: inset 0 4px 0 #ddd6c8; }
  .bar { height: 4px; background: #ff5a1f; transition: width .4s linear; }
  h1 {
    margin: 28px 0; font: 300 88px/1 ${MONO};
    font-variant-numeric: tabular-nums; letter-spacing: -.04em;
  }
  button { cursor: pointer; font: 600 14px/1 system-ui, sans-serif; }
  .main {
    width: 100%; padding: 14px; border: 1px solid #1b1b1b;
    background: #1b1b1b; color: #fffdf8;
  }
  .main:hover { background: #ff5a1f; border-color: #ff5a1f; }
  .presets { display: flex; gap: 6px; margin-top: 8px; }
  .presets button {
    flex: 1; padding: 10px 0; border: 1px solid #cfc7b6;
    background: transparent; color: #4a463f; font: 12px/1 ${MONO};
  }
  .presets button:hover { border-color: #1b1b1b; color: #1b1b1b; }
`,
    },
  },
];

export default lessons;
