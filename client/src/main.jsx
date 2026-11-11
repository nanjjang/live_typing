import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import '@fontsource-variable/geist-mono'
import './index.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/editor.css'
import './styles/preview.css'
import './styles/landing.css'
import './styles/practice.css'
import App from './App.jsx'

// Chrome is light-only (DESIGN.md §2); drop any theme left over from the old design.
delete document.documentElement.dataset.theme

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
