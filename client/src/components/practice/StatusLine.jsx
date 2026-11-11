/** 28px status bar under the workspace. `status` and `folio` are accepted for compatibility. */
export default function StatusLine({ line, col, wrong, left }) {
  return (
    <footer className="statusbar">
      <span className="statusbar-left">
        줄 {line}, 칸 {col} · 오타 {wrong} · 남은 글자 {left}
      </span>
      <span className="statusbar-right">Enter 줄바꿈 · Backspace 지우기 · Esc 레슨</span>
    </footer>
  )
}
