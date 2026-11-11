# livetype — Design spec v2

> Replaces the "Galley" print direction entirely. This version is grounded in what openai.com, apple.com and github.com actually do (observed 2026‑11‑03), translated for a code‑typing tool. Everything here is binding.

## 0. What we took from each reference

| Source | Observed | How we use it |
|---|---|---|
| **OpenAI** | Pure white page, black text, one sans (17px, −0.17px tracking). Hero = one centered question + one big rounded input box with a soft shadow, a row of pill "suggestion chips" under it. Black pill CTA (radius 40px) top right, light-gray pill secondary. News grid = image left, title + small gray meta (`제품 · 2026년 10월 7일`). | Hero is a centered headline + **one big rounded "editor box"** you can type into immediately. Track chips under it (`HTML · CSS · JavaScript · React`). Black pill primary button. Lesson list styled like OpenAI's news rows with a real rendered thumbnail. |
| **Apple** | Text #1D1D1F, secondary #86868B / #6E6E73, alt surface #F5F5F7, product stage on **pure black**. Huge centered product name (SF Pro Display 600, ~56–80px, tight), one‑line subhead, two pills: filled blue #0071E3 + outline blue. Full‑bleed alternating tiles, product image does all the talking. Sticky dark/translucent global nav, 44–52px. | Full‑bleed alternating tiles (white → #F5F5F7 → black). The **product (editor + preview) is the hero image**, shown big on a black stage. Blue #0071E3 is our single accent (caret, links, progress, focus). Tight display type, short subheads. |
| **GitHub** | Mona Sans, h1 56px weight ~440. Content framed by **thin vertical hairlines** running down the page (a 1px boxed column), product shots on a **fine graph‑paper grid** (#F6F8FA with faint lines). Monospace for meta (`developers building on GitHub`). Activity ticker strip with small icons + mono meta. Green #1F883D primary, 6px radius gray secondary buttons. | Page content sits inside a 1px hairline frame column; product demos sit on a faint grid. **Mono for metadata** (line counts, WPM labels, file names). A horizontal ticker of real lessons (`html · 첫 문단 · 12줄`). Green only for the "correct/complete" state. |

The result should feel like a product page those three teams could have shipped: white, quiet, confident, one typeface, the product as the image.

## 1. Brand

- Name **livetype** — lowercase wordmark, Pretendard 700, 19px, −0.03em, `#1D1D1F`. No logo mark besides a 8×8 blue rounded square caret before the word (`▍`‑like, radius 2px, `--accent`) that blinks once on load.
- Korean descriptor: **치는 대로 그려지는 코딩 타자 연습**.

## 2. Tokens (`src/styles/tokens.css`)

Light theme only for chrome (like all three references). Editor is always dark.

```css
:root{
  --bg:#FFFFFF;          /* page */
  --bg-2:#F5F5F7;        /* apple alt tile */
  --bg-3:#EDEDF0;        /* pressed / hover on bg-2 */
  --grid:#F6F8FA;        /* github graph-paper base */
  --grid-line:rgba(31,35,40,.06);
  --line:#D2D2D7;        /* hairlines (apple separator) */
  --line-2:#E8E8ED;      /* faint hairline */
  --text:#1D1D1F;
  --text-2:#6E6E73;
  --text-3:#86868B;
  --accent:#0071E3;      /* the only accent */
  --accent-hover:#0077ED;
  --accent-soft:rgba(0,113,227,.10);
  --ok:#1F883D;          /* github green — completion only */
  --err:#E30000;
  --black:#000000;       /* product stage */

  /* editor (dark, github-dark-ish neutral, never a VS Code clone) */
  --ed-bg:#0D0D0F; --ed-bg-2:#16161A; --ed-line:#1C1C21; --ed-rule:#26262C;
  --ed-ghost:#4A4A52; --ed-text:#F2F2F4; --ed-dim:#8A8A93;
  --ed-err:#FF453A; --ed-err-bg:rgba(255,69,58,.16); --ed-caret:#2997FF;
  --ed-str:#A5D6FF; --ed-key:#FF7B72; --ed-fn:#D2A8FF; --ed-tag:#7EE787; /* muted, used on typed text only */

  --radius-s:8px; --radius:12px; --radius-l:18px; --radius-xl:28px; --pill:980px;
  --shadow-box:0 1px 2px rgba(0,0,0,.04), 0 8px 28px rgba(0,0,0,.08); /* openai input box */
  --shadow-stage:0 30px 80px rgba(0,0,0,.35);
  --ease:cubic-bezier(.25,.1,.25,1);      /* apple standard */
  --ease-out:cubic-bezier(.16,1,.3,1);
  --t-fast:150ms; --t:300ms; --t-slow:600ms;
  --nav-h:52px;
}
body{background:var(--bg);color:var(--text)}
```

Rules: shadows only on the hero editor box, the product stage, popovers and results sheet. No gradients **except** none — zero gradients anywhere. Accent blue ≤ a few elements per screen.

## 3. Typography

- Sans: **Pretendard Variable** (Korean+Latin, the closest free match to SF Pro / OpenAI Sans). `npm i pretendard` → `import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'`.
- Mono: **Geist Mono** → `npm i @fontsource-variable/geist-mono` → `import '@fontsource-variable/geist-mono'`.
- Remove every Hahmlet / IBM Plex import and package.

```css
--f-sans:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
--f-mono:"Geist Mono Variable","Geist Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
```

| token | size / lh / weight / tracking | use |
|---|---|---|
| display | clamp(44px, 7vw, 80px) / 1.05 / 700 / −0.035em | hero headline, tile headlines |
| h2 | clamp(32px, 4.5vw, 48px) / 1.1 / 700 / −0.03em | section headlines |
| h3 | 24px / 1.25 / 600 / −0.02em | sub‑sections, results |
| lead | clamp(19px, 2vw, 24px) / 1.4 / 500 / −0.015em, `--text-2` | subheads under headlines |
| body | 17px / 1.6 / 400 / −0.01em | copy |
| small | 14px / 1.5 / 400 | buttons, nav, meta |
| micro | 12px / 1.4 / 400, `--text-3` | footer, captions |
| mono-meta | 12–13px Geist Mono, `--text-3`, tracking 0 | line counts, file names, labels |
| code | 14.5px Geist Mono / 24px | editor |

Korean: `word-break:keep-all`. Numbers that change: `font-variant-numeric:tabular-nums`.

## 4. Layout system

- Content max width 1200px, side padding 24px (16px ≤ 480).
- **Hairline frame** (GitHub): on landing, a centered 1200px column has 1px `--line-2` left & right borders running the full page height; sections are separated by 1px `--line-2` horizontal rules that meet the frame. Hidden < 900px.
- Spacing: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 140. Section vertical padding 140 desktop / 88 mobile.
- Radius: buttons pill; inputs/editor box 18px (`--radius-l`); tiles 28px on alt surfaces; thumbnails 12px; kbd 6px.

### Buttons
- Primary: black `#000`, white text, pill, 14px/500, height 40 (44 for hero), padding 0 20px. Hover `#2C2C2E`, color change only (no movement). Trailing `↗` or `→` glyph optional.
- Secondary: `--bg-2` fill, `--text`, pill (OpenAI 로그인 style). Hover `--bg-3`.
- Link: `--accent`, no underline, `›` suffix (Apple "더 알아보기 ›"). Hover underline.
- Chip (OpenAI suggestions): 1px `--line` border, white, pill, 14px, height 36, padding 0 16px. Hover `--bg-2`. Active/selected: `--text` border + `--bg-2`.
- Focus: `outline:2px solid var(--accent); outline-offset:2px`.

## 5. Landing (`#/`)

### 5.0 Global nav (Apple × OpenAI)
Sticky, height 52, `rgba(255,255,255,.8)` + `backdrop-filter:saturate(180%) blur(20px)` (the only blur in the app), 1px `--line-2` bottom border appears after scroll > 8px.
Left: wordmark. Center-left links (14px, `--text`): `연습` · `레슨` · `작동 방식`. Right: secondary pill `레슨 둘러보기` + primary pill `바로 시작 →`. ≤ 720: links hidden, only primary pill.

### 5.1 Hero (OpenAI prompt layout)
Centered, padding-top 120, white.
- Mono eyebrow (12px, `--text-3`): `HTML · CSS · JavaScript · React`
- Display headline: `치는 대로,`⏎`그려집니다.`
- Lead (max 30ch, centered): `코드를 한 글자씩 따라 치면, 친 만큼 오른쪽에 실제 화면이 만들어집니다.`
- **The box** (the centerpiece): width min(960px, 100%), radius 18, white, 1px `--line-2` border + `--shadow-box`. Inside: a 2‑column live mini‑workspace — left dark editor (radius 12, inset 8px), right white preview with a tiny browser bar (three 8px `--line` dots + mono url `preview.html`). Height 380 desktop; stacks (editor 200 / preview 220) < 760. It auto‑types rotating snippets (reuse existing auto‑typer + real editor/preview components). Click/typing inside takes over (existing behavior), bottom‑right inside the box a 32px round black button with `↑`‑style arrow (OpenAI send button) labeled `연습 시작` for screen readers → goes to practice.
- Under the box: chip row (OpenAI suggestions) — `HTML 첫 문단`, `CSS 카드 만들기`, `JavaScript 카운터`, `React 토글`, `전체 레슨`. Each opens that lesson (use real lesson ids; titles from data).
- Under chips, micro text: `가입 없음 · 무료 · 기록은 이 브라우저에만 저장됩니다`.

### 5.2 Ticker (GitHub activity strip)
Full‑width band, 1px `--line-2` top/bottom, height 64, `--bg`. Infinite slow marquee (60s, pause on hover, static under reduced‑motion) of real lessons: small 20px rounded square with track initial in mono (`H`, `C`, `J`, `R`, bg `--bg-2`) + `첫 문단` (14px) + mono `html · 12줄`. Edge fade via mask‑image (this is a mask, not a color gradient — allowed).

### 5.3 Product stage — "작동 방식" (Apple black tile)
Full‑bleed `--black` section, white text, centered.
- Mono eyebrow `#how` color `#86868B`: `작동 방식`
- Headline (white): `왼쪽에서 치고, 오른쪽에서 봅니다.`
- Lead (#A1A1A6): `에디터와 미리보기가 한 화면에. 한 글자를 칠 때마다 결과가 바로 바뀝니다.`
- Below: a large static‑but‑live screenshot‑like render of the **real practice layout** (top bar + editor + preview) at ~1100px width scaled to fit, radius 18, `--shadow-stage`, 1px `#2A2A2E` border. It auto‑plays a longer CSS lesson slowly (reuse auto‑typer). Pauses when offscreen (IntersectionObserver).
- Under it, three plain text columns (no cards, no icons), white 17px title + `#A1A1A6` 15px line, separated by space only:
  - `틀리면 바로 보입니다` — `틀린 글자는 빨갛게, 원래 칠 글자는 바로 아래에.`
  - `들여쓰기는 알아서` — `줄을 바꾸면 들여쓰기가 자동으로 채워집니다.`
  - `속도와 정확도` — `WPM, 정확도, 시간이 쉬지 않고 기록됩니다.`

### 5.4 Lessons (OpenAI news grid on GitHub graph paper)
`--bg` section with id `lessons`.
- Headline `레슨` + lead `짧게 시작해서, 조금씩 길게.` left‑aligned. To the right (desktop) chip filters: `전체 · HTML · CSS · JavaScript · React`.
- Grid: 2 columns ≥ 900 (1 below), gap 24/40. Each row item = OpenAI news row: thumbnail 160×120 (radius 12, on `--grid` graph‑paper background: `background-image: linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px); background-size:16px 16px` — this is a line pattern, the only `linear-gradient` allowed) containing a **real scaled iframe render of the lesson's finished code** (lazy, only when in view, `pointer-events:none`, scale ~0.25). Right: title 19px/600 −0.02em, summary 15px `--text-2` (2‑line clamp), meta row mono 12 `--text-3`: `HTML · 12줄 · 레벨 1` and, if a record exists, `· 최고 64 WPM` in `--ok`.
- Hover: title gets `--accent`; thumbnail iframe scale 1.02 (transition 300ms). Whole row is a link.

### 5.5 Closing (Apple tile on `--bg-2`)
Rounded 28px tile inset inside the frame (margin 24), padding 96, centered: headline `첫 줄부터 시작해 보세요.`, lead `1분이면 첫 화면이 만들어집니다.` (true for level‑1 lessons ~12 lines — keep), two pills: primary `바로 시작 →`, link `레슨 둘러보기 ›`.

### 5.6 Footer (Apple)
`--bg-2`, micro 12px `--text-3`, 1px `--line` top. Left: `livetype — 코딩 타자 연습`. Right: `Enter 시작 · Esc 레슨 목록`. One more line: `코드는 격리된 iframe에서 실행되며 외부로 전송되지 않습니다.`

## 6. Practice (`#/lesson/:id`)

Full viewport app, no page scroll. Feels like a native Mac app window (Apple) with GitHub‑style top bar density.

### 6.1 Top bar (52px, white, 1px `--line-2` bottom)
- Left: wordmark (→ landing) · `/` in `--text-3` · lesson switcher button: track mono tag (`CSS` in a 20px `--bg-2` pill, mono 11) + lesson title 14/500 + `⌄`. Opens the lesson popover.
- Center: stats as quiet inline pairs — label 12px `--text-3`, value 15px/600 tabular `--text`: `속도 62 WPM` · `정확도 97.4%` · `진행 41%` · `시간 01:28`. Separated by 24px, no dividers. Accuracy < 90% → value `--err`.
- Right: IME notice (when active) as an OpenAI‑style light pill `--bg-2`: blue 6px dot + `한글 입력 중 · 한/영 키를 눌러 주세요`. Then secondary pill `다시` (`Alt R`), secondary pill `레슨` (`Esc`).
- Progress: 2px bar along the very bottom edge of the top bar, `--accent` fill on `--line-2`, 150ms linear.

### 6.2 Workspace
Body `--bg-2`, padding 12, gap 12, split 55/45 with a 12px gutter drag handle (a 4×32 rounded `--line` grip appears on hover). Both panes are rounded 18px "windows":
- **Editor window** (`--ed-bg`, 1px `#000` border): 40px header `--ed-bg` with file tab(s) mono 12 (`index.html`, active `--ed-text` with 1px `--ed-rule` box radius 8, inactive `--ed-dim`). Gutter 52px mono 12.5 `--ed-dim` right‑aligned, current line number `--ed-text`. Code 14.5/24.
  - Untyped `--ed-ghost`. Typed correct `--ed-text` with muted syntax colors (`--ed-tag`, `--ed-str`, `--ed-key`, `--ed-fn`) applied only to typed characters — the ghost stays monochrome so the typed part "lights up".
  - Wrong: glyph `--ed-err` on `--ed-err-bg`, radius 3; expected char tiny (10px `--ed-dim`) under the cell. Wrong space/newline: show `·`/`↵` in `--ed-err`.
  - Caret: 2px × 18px `--ed-caret`, radius 1, glides 80ms, blinks after 600ms idle.
  - Current line bg `--ed-line`.
  - Pre‑start overlay: centered white pill on the dark editor, 14px: `아무 키나 눌러 시작` + mono `시간은 첫 글자부터`.
  - Paused: editor content 40% opacity + pill `일시정지 · 아무 키나 눌러 계속`.
- **Preview window** (white, 1px `--line-2`, `--shadow-box`): 40px browser bar `--bg` with three 10px dots (`#FF5F57 #FEBC2E #28C840` at 100% — real macOS window controls, the one place these colors appear) left, centered url pill (`--bg-2`, radius 8, mono 12 `--text-3`: `localhost / 카드 만들기`), right segmented control `맞춤 · 768 · 375` (Apple segmented: `--bg-2` track, white selected pill with tiny shadow) and toggle `원본 겹쳐 보기`. Body: iframe fills; for 375/768 center a device frame (radius 18, 1px `--line`) on `--grid` graph paper.
  - Status caption bottom‑left inside a small floating pill (`rgba(255,255,255,.9)`, 1px `--line-2`, mono 11): `실시간` with green dot / `스크립트 작성 중…` with gray dot (last good render kept) / `아직 친 코드가 없습니다`.
- < 900px: panes stack (editor 55dvh, preview rest), stats show only 속도/정확도/시간, segmented control hidden.
- Touch‑only devices: friendly card `이 연습은 키보드가 필요합니다` + auto‑playing demo (keep existing behavior, restyle).

### 6.3 Status bar (28px, `--bg-2`, mono 11 `--text-3`)
Left: `줄 12, 칸 8 · 오타 3 · 남은 글자 412`. Right: `Enter 줄바꿈 · Backspace 지우기 · Esc 레슨`.

### 6.4 Lesson popover (replaces side panel)
Anchored under the switcher, 560px wide (full width sheet on mobile), white, radius 18, `--shadow-box`, 1px `--line-2`. Top: search input (OpenAI style, 15px, placeholder `레슨 검색`) + chips `전체 HTML CSS JavaScript React`. List rows 52px: mono track tag pill, title 15/500, mono meta right `12줄 · 최고 64` ; completed rows get a small `--ok` check `✓` (text glyph). Keyboard ↑↓ Enter Esc; current row `--bg-2`. Backdrop: transparent click‑catcher (no dim) on desktop, `rgba(0,0,0,.2)` on mobile.

### 6.5 Results sheet
Centered modal 640px, white, radius 28, padding 48, shadow `0 20px 60px rgba(0,0,0,.18)`, backdrop plain `rgba(255,255,255,.75)` (no blur).
- Mono eyebrow `완료 · CSS · 카드 만들기`; a 28px `--ok` round check before it.
- Hero number: `62` 96px/700 −0.04em + `WPM` 17px `--text-2`.
- 3 stats in a row (label micro `--text-3` over 24/600 value): `정확도 97.4%` · `오타 11` · `시간 03:12`.
- `자주 틀린 글자`: mono 16 keycaps (radius 8, `--bg-2`, 32×32) with `×4` micro.
- Right column (desktop) or below: thumbnail of finished render (radius 12, 1px `--line-2`), and `지난 최고 58 → 오늘 62` or `첫 기록입니다`. New best → a small `--accent-soft` pill `최고 기록` (no stamps).
- Actions: primary `다음 레슨 →` (Enter), secondary `다시 하기` (R), link `레슨 목록 ›` (Esc).

## 7. Motion
- Easing `--ease` / `--ease-out`. Nothing bounces.
- Landing section reveal: opacity 0→1 + translateY(24px→0), 600ms `--ease-out`, once, IntersectionObserver. Headline lines stagger 80ms.
- Hero box: on load fades/rises 800ms after headline (delay 150ms).
- Product stage: scale .96 → 1 as it enters (scroll‑linked is NOT allowed — single reveal).
- Popover: opacity + scale .98→1, 180ms. Results: opacity + translateY 16px, 400ms; number count‑up 600ms.
- Wrong key: glyph shakes 2px, 120ms.
- `prefers-reduced-motion`: no marquee, no count‑up, no reveals, no caret blink; auto‑typers show finished code.

## 8. Copy voice
Short, plain, `‑니다/‑세요`. Apple‑like brevity: headline ≤ 2 short lines, lead ≤ 1 sentence. No exclamation marks, no 여러분/최고의/혁신/차원이 다른. No invented numbers or testimonials. English only for HTML/CSS/JavaScript/React/WPM.

## 9. Do not
- No Galley/print vocabulary anywhere (원고, 교정쇄, 조판, 판, §, crop marks, dot leaders, stamps, serif display fonts). Delete those components/styles.
- No gradients (color), no glow, no blobs, no glassmorphism beyond the nav blur, no emoji, no icon library (glyphs `→ › ↗ ✓ ⌄ ↵` only; inline SVG only for the arrow in the round send button if needed).
- No feature‑card trio with icons, no hover lift, no colored section backgrounds besides white / `--bg-2` / black.
- No VS Code clone theme, no rainbow on ghost text.
- No fake stats, logos, testimonials, newsletter.
- Don't use the macOS traffic‑light colors anywhere except the preview window bar.

## 10. Revision (user feedback, 2026‑11‑03)
- **No monospace for UI metadata.** Geist Mono is only for code inside the editor, the preview URL pill and file tabs. Eyebrows, meta rows, ticker, captions, status text, kbd keycaps → Pretendard.
- **No `a · b · c` dot‑separated micro‑lines** and no tiny letter badges (`H`, `C`…). Meta rows use spacing (gap 14px) with the category in `--text` 600 (OpenAI `제품  2026년 10월 7일` pattern).
- Hero has no eyebrow and no fine‑print line under the chips.
- Ticker = lesson titles only, 26px/600, color `--line`, hover `--text`.
- Footer = white, three link columns (트랙 / 둘러보기 / 단축키) + brand column with CTA, bottom bar `© 2026 livetype` + privacy sentence.
- No hairline frame column: the vertical side lines and the frame rules are removed (user request).
