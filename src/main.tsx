import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import { reportClientError } from './lib/analytics'
import './index.css'
import './styles/print.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

// Global error pipe — registered ONCE at module scope. reportClientError is
// consent-gated, deduplicated, and throttled (max ~10 reports per page
// session) inside the analytics lib, so these handlers stay fire-and-forget.
window.addEventListener('error', (event) => {
  const error: unknown = event.error
  reportClientError(
    'window',
    event.message || (error instanceof Error ? error.message : 'unknown error'),
    error instanceof Error ? error.stack : undefined,
  )
})
window.addEventListener('unhandledrejection', (event) => {
  const reason: unknown = event.reason
  reportClientError(
    'window',
    reason instanceof Error ? reason.message : String(reason ?? 'unhandled rejection'),
    reason instanceof Error ? reason.stack : undefined,
  )
})

// The removed react-joyride onboarding tour persisted a stage machine here;
// a stale 'wmi'/'video' stage used to force-redirect users into the deleted
// flow. Clear it so anyone caught mid-tour just lands normally.
try {
  localStorage.removeItem('qupu-onboarding-tour')
} catch {
  /* storage unavailable — nothing persisted to clear */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
