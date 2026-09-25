import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global API URL adapter for production deployment (e.g. Vercel frontend -> Render backend)
const apiBase = import.meta.env.VITE_API_URL;
if (apiBase) {
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === 'string' && input.startsWith('/api')) {
      const cleanBase = apiBase.replace(/\/+$/, '');
      return originalFetch(`${cleanBase}${input}`, init);
    }
    return originalFetch(input, init);
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
