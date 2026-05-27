// src/components/ReferralShareCard.tsx
//
// Plan 5c — share moment inside the post-quiz reward summary.
//
// Shown only on high-value moments (level-up, first-quiz). Fetches the
// parent's lifetime referral code lazily and renders a WhatsApp button
// with a prefilled message. Falls back to a generic "copy link" if WA
// share fails (e.g., desktop).

import { useEffect, useState } from 'react'
import api from '../lib/api'

interface Props {
  childName: string
  headline: string  // e.g., "${child} naik level!" — used in the WA message
}

interface ReferralCodeResponse {
  code: string
  shareUrl: string
}

function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

export default function ReferralShareCard({ childName, headline }: Props) {
  const [share, setShare] = useState<ReferralCodeResponse | null>(null)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const response = await api.post('/me/referrals/generate')
        if (cancelled) return
        const data = response.data?.data as ReferralCodeResponse | undefined
        if (data?.code && data.shareUrl) setShare(data)
        else setError(true)
      } catch (loadError) {
        if (cancelled) return
        console.error('Failed to load referral code:', loadError)
        setError(true)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (error || !share) return null

  const message =
    `${headline}\n\n` +
    `Saya pakai QUPU buat ${childName} — channel YouTube edukatif yang ada lencana + skor untuk anak. ` +
    `Coba juga (gratis): ${share.shareUrl}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(share.shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (copyError) {
      console.error('Clipboard copy failed:', copyError)
    }
  }

  return (
    <section className="mt-4 rounded-[1.5rem] border-[3px] border-emerald-300/70 bg-emerald-50 px-5 py-4">
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xl text-white shadow-soft"
          aria-hidden="true"
        >
          <i className="fa-solid fa-bullhorn" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
            Bagikan momen ini
          </div>
          <div className="mt-0.5 font-display text-sm font-extrabold text-qupu-brand-blue sm:text-base">
            Beri tahu Bunda lain di grup WA
          </div>
          <p className="mt-1 text-xs font-medium leading-relaxed text-qupu-muted">
            Pesan sudah disiapkan. Tinggal tap dan kirim ke grup atau teman.
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={buildWhatsAppUrl(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2 font-display text-sm font-extrabold text-white shadow-soft transition-transform duration-150 hover:-translate-y-0.5"
        >
          <i className="fa-brands fa-whatsapp text-base" aria-hidden="true" />
          Kirim ke WhatsApp
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-emerald-300 bg-white px-4 py-1.5 font-display text-sm font-extrabold text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          <i className="fa-solid fa-copy text-xs" aria-hidden="true" />
          {copied ? 'Tersalin!' : 'Salin link'}
        </button>
      </div>
    </section>
  )
}
