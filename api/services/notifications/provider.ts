// api/services/notifications/provider.ts
//
// Sender for the parent notification loop (Mythos P2.5): Resend email, the
// same account/envs the registration OTP uses (RESEND_API_KEY/RESEND_FROM).
// The NotificationProvider interface exists as the dispatcher's test seam.
// ponytail: single channel; add a provider + selection env when a second
// real channel (e.g. Fonnte WhatsApp) actually lands.

interface ResendError {
  statusCode?: number
  message?: string
  name?: string
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export interface NotificationProvider {
  send(to: string, subject: string, html: string): Promise<void>
}

// Resend email — same endpoint, env names, and error surface as the OTP
// sender in api/services/email.ts. Env is checked at send time (matching
// sendOtpEmail) so a misconfigured deploy fails loudly per send, and the
// dispatcher's per-parent catch turns that into a logged skip.
export function resendProvider(): NotificationProvider {
  return {
    async send(to: string, subject: string, html: string): Promise<void> {
      const apiKey = process.env.RESEND_API_KEY
      const from = process.env.RESEND_FROM
      if (!apiKey || !from) {
        throw new Error('RESEND_API_KEY or RESEND_FROM is not configured')
      }

      const response = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ from, to: [to], subject, html }),
      })

      if (!response.ok) {
        let body: ResendError = {}
        try {
          body = (await response.json()) as ResendError
        } catch {
          // ignore parse errors
        }
        throw new Error(
          `Resend send failed: ${response.status} ${body.message ?? response.statusText}`,
        )
      }
    },
  }
}

