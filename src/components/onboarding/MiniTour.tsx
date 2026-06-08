// src/components/onboarding/MiniTour.tsx
import { useEffect, useState } from 'react'
import { trackEvent } from '../../lib/analytics'

interface TourCard {
  icon: string
  title: string
  body: string
  accent: string
}

const CARDS: TourCard[] = [
  {
    icon: 'fa-solid fa-medal',
    title: 'Badge & XP',
    body: 'Setiap kuis yang diselesaikan menghasilkan badge dan XP untuk naik level.',
    accent: 'bg-qupu-brand-yellow',
  },
  {
    icon: 'fa-solid fa-calculator',
    title: 'Latihan Matematika WMI',
    body: 'Latihan soal matematika ala olimpiade WMI — drill, konsep, dan ujian.',
    accent: 'bg-qupu-brand-blue',
  },
  {
    icon: 'fa-solid fa-fire',
    title: 'Target Harian & Streak',
    body: 'Tetapkan target kuis harian dan jaga streak biar belajar jadi kebiasaan.',
    accent: 'bg-qupu-brand-orange',
  },
]

interface MiniTourProps {
  onContinue: () => void
}

export default function MiniTour({ onContinue }: MiniTourProps) {
  const [index, setIndex] = useState(0)
  const isLast = index === CARDS.length - 1
  const card = CARDS[index]

  useEffect(() => {
    trackEvent('demo_tour_viewed')
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center font-display text-2xl font-black text-qupu-ink">
        Apa saja di QUPU?
      </h1>

      <div className="rounded-[1.75rem] border-2 border-qupu-peach bg-qupu-shell p-6 text-center">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${card.accent} text-white`}
        >
          <i className={`${card.icon} text-3xl`} aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-display text-xl font-black text-qupu-ink">{card.title}</h2>
        <p className="mt-2 text-sm font-semibold text-qupu-muted">{card.body}</p>
      </div>

      <div className="flex items-center justify-center gap-2" aria-hidden="true">
        {CARDS.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === index ? 'w-6 bg-qupu-brand-orange' : 'w-2 bg-qupu-peach'
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => (isLast ? onContinue() : setIndex((i) => i + 1))}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
      >
        {isLast ? 'Lihat rencana belajar' : 'Lanjut'}
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  )
}
