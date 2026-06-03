import { useEffect, useState } from 'react'
import { getCookieConsent, setCookieConsent } from '@/lib/cookieConsent'

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(getCookieConsent() === 'undecided')
  }, [])

  const chooseConsent = (consent: 'accepted' | 'declined') => {
    setCookieConsent(consent)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[6px_8px_0_0_#FFD3B1] sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="text-sm font-semibold leading-relaxed text-qupu-muted sm:text-base">
          Kami memakai cache penting supaya QUPU lebih cepat. Untuk cookie analitik dan preferensi tambahan, boleh kami aktifkan?
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:shrink-0">
          <button
            type="button"
            onClick={() => chooseConsent('accepted')}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
          >
            Boleh
          </button>
          <button
            type="button"
            onClick={() => chooseConsent('declined')}
            className="font-semibold text-qupu-muted transition-colors hover:text-qupu-brand-orange"
          >
            Jangan dulu
          </button>
        </div>
      </div>
    </div>
  )
}
