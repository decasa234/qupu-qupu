interface ResendError {
  statusCode?: number
  message?: string
  name?: string
}

const ENDPOINT = 'https://api.resend.com/emails'

export async function sendOtpEmail(to: string, name: string, otp: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  if (!apiKey || !from) {
    throw new Error('RESEND_API_KEY or RESEND_FROM is not configured')
  }

  const safeName = (name || '').trim() || 'Orang tua QUPU'

  const text = [
    `Hai ${safeName},`,
    '',
    `Kode verifikasi QUPU kamu: ${otp}`,
    '',
    'Berlaku 10 menit. Jangan kasih kode ini ke siapa pun — staf QUPU',
    'tidak akan pernah minta kode ini.',
    '',
    'Kalau bukan kamu yang daftar, abaikan email ini.',
  ].join('\n')

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <p>Hai ${escapeHtml(safeName)},</p>
      <p>Kode verifikasi QUPU kamu:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#1d4ed8">${otp}</p>
      <p>Berlaku 10 menit. Jangan kasih kode ini ke siapa pun &mdash; staf QUPU tidak akan pernah minta kode ini.</p>
      <p style="color:#6b7280;font-size:13px">Kalau bukan kamu yang daftar, abaikan email ini.</p>
    </div>
  `

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Kode verifikasi QUPU',
      text,
      html,
    }),
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
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
