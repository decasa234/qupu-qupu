// src/components/onboarding/WinMoment.tsx
import { useEffect } from 'react'
import { useReducedMotion } from 'framer-motion'
import KonsepConfetti from '../wmi/KonsepConfetti'
import { trackEvent } from '../../lib/analytics'

interface WinMomentProps {
  onContinue: () => void
}

export default function WinMoment({ onContinue }: WinMomentProps) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    trackEvent('demo_badge_earned')
  }, [])

  return (
    <div className="relative flex flex-col items-center gap-5 py-4 text-center">
      {!reduceMotion && <KonsepConfetti pieces={50} />}

      <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-qupu-brand-yellow shadow-[0_5px_0_0_#C99700]">
        <i className="fa-solid fa-medal text-5xl text-white" aria-hidden="true" />
      </div>

      <div className="relative z-10">
        <h1 className="font-display text-3xl font-black text-qupu-ink">
          Kamu dapat badge pertama!
        </h1>
        <p className="mt-2 text-sm font-semibold text-qupu-muted">
          +10 XP · Terus kumpulkan badge di setiap kuis.
        </p>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="relative z-10 inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
      >
        Lanjut
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  )
}
