import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// If VITE_MOCK=true in .env.local, replace fetch() with fake responses
// so you can test the UI without a running backend
if (import.meta.env.VITE_MOCK === 'true') {
  import('./mockFetch.js').then(function(module) {
    module.installMockFetch();
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
