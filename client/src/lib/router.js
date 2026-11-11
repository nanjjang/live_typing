// URL helpers shared by pages (routing itself lives in App.jsx via react-router-dom).
export const lessonHref = (id) => `/lesson/${encodeURIComponent(id)}`
