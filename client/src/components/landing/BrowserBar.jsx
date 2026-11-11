/** Tiny neutral browser bar for the hero preview (no traffic-light colors here). */
export default function BrowserBar({ url = 'preview.html' }) {
  return (
    <div className="browser-bar" aria-hidden="true">
      <span className="bb-dots">
        <i />
        <i />
        <i />
      </span>
      <span className="bb-url">{url}</span>
      <span className="bb-dots bb-dots--ghost" />
    </div>
  )
}
