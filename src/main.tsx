import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './index.css'
import './styles/print.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

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
