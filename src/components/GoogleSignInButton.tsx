import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import api from '../lib/api'
import { trackEvent } from '../lib/analytics'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import type { AuthPayload } from '../types'

interface GoogleSignInButtonProps {
  onAuthenticated: (payload: AuthPayload) => void
  onError: (message: string) => void
}

export default function GoogleSignInButton({ onAuthenticated, onError }: GoogleSignInButtonProps) {
  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      onError('Google credential tidak diterima.')
      return
    }
    trackEvent('google_button_click')
    try {
      const apiResponse = await api.post('/auth/google', { idToken: response.credential })
      const payload = apiResponse.data.data as AuthPayload
      onAuthenticated(payload)
    } catch (requestError: unknown) {
      onError(toIndonesianErrorMessage(requestError, 'Gagal masuk dengan Google.'))
    }
  }

  const handleError = () => {
    onError('Login Google dibatalkan atau gagal.')
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        text="continue_with"
        shape="pill"
        size="large"
        theme="outline"
      />
    </div>
  )
}
