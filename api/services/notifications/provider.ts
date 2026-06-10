// api/services/notifications/provider.ts
//
// Channel abstraction for the parent notification loop (Mythos P2.5).
// Today the only real channel is Resend email (the same account/envs the
// registration OTP uses — RESEND_API_KEY / RESEND_FROM). A WhatsApp
// provider is stubbed Fonnte-shaped behind WHATSAPP_TOKEN/WHATSAPP_SENDER
// so the dispatcher never has to change when WhatsApp sending lands.
//
// Selection: NOTIFICATION_CHANNEL env ('email' | 'whatsapp'), default
// 'email' — the WhatsApp stub is NEVER active unless explicitly selected
// AND its envs are present (the factory throws otherwise).

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

// WhatsApp (Fonnte-shaped) — INTERFACE STUB. The factory validates the
// Fonnte envs up front (so selecting the channel without keys fails at
// startup of the cron run, not silently); send() is intentionally
// unimplemented until a Fonnte account exists. The future implementation
// POSTs https://api.fonnte.com/send with { target, message } and an
// Authorization: <WHATSAPP_TOKEN> header, sending plain text derived from
// the template (WhatsApp has no HTML).
export function whatsappProvider(): NotificationProvider {
  const token = process.env.WHATSAPP_TOKEN
  const sender = process.env.WHATSAPP_SENDER
  if (!token || !sender) {
    throw new Error('WHATSAPP_TOKEN or WHATSAPP_SENDER is not configured')
  }
  return {
    async send(): Promise<void> {
      throw new Error('WhatsApp provider is a stub — Fonnte sending is not implemented yet')
    },
  }
}

export function getNotificationProvider(): NotificationProvider {
  const channel = (process.env.NOTIFICATION_CHANNEL ?? 'email').trim().toLowerCase()
  if (channel === 'whatsapp') return whatsappProvider()
  return resendProvider()
}
