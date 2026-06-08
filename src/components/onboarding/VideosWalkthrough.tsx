// src/components/onboarding/VideosWalkthrough.tsx
//
// Onboarding Chapter 2: an illustrated 3-beat walkthrough of the Watch-Videos
// reward loop (Tonton -> Isi skor -> Dapat hadiah). The video "quiz" is a
// score-entry + reward flow, so this teaches the loop with real reward visuals
// rather than an interactive quiz.
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import KonsepConfetti from '../wmi/KonsepConfetti'
import { trackEvent } from '../../lib/analytics'

interface Beat {
  icon: string
  accent: string
  title: string
  body: string
}

const BEATS: Beat[] = [
  {
    icon: 'fa-play',
    accent: 'bg-qupu-brand-orange',
    title: 'Tonton video',
    body: 'Pilih video seru per subjek — Sains, Matematika, Literasi, dan lainnya.',
  },
  {
    icon: 'fa-sliders',
    accent: 'bg-qupu-brand-blue',
    title: 'Isi skor',
    body: 'Setelah nonton, isi berapa soal yang dijawab benar. Contoh: 8 dari 10.',
  },
  {
    icon: 'fa-medal',
    accent: 'bg-qupu-brand-yellow',
    title: 'Dapat hadiah',
    body: 'Tiap video selesai mengumpulkan badge, XP, dan koin untuk anak.',
  },
]

interface VideosWalkthroughProps {
  onComplete: () => void
}

export default function VideosWalkthrough({ onComplete }: VideosWalkthroughProps) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const isLast = index === BEATS.length - 1
  const beat = BEATS[index]

  useEffect(() => {
    trackEvent('demo_tour_viewed', { variant: 'videos' })
  }, [])

  return (
    <div className="relative flex flex-col gap-6">
      {isLast && !reduceMotion && <KonsepConfetti pieces={40} />}

      <div className="relative z-10 text-center">
        <span className="inline-block rounded-full bg-qupu-brand-orange px-4 py-1 font-display text-xs font-black uppercase tracking-[0.18em] text-white">
          Tonton Video
        </span>
        <h1 className="mt-2 font-display text-xl font-black text-qupu-ink">
          Cara dapat badge dari video
        </h1>
      </div>

      <div className="relative z-10 rounded-[1.75rem] border-2 border-qupu-peach bg-qupu-shell p-6 text-center">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${beat.accent} text-white`}
        >
          <i className={`fa-solid ${beat.icon} text-3xl`} aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-display text-xl font-black text-qupu-ink">{beat.title}</h2>
        <p className="mt-2 text-sm font-semibold text-qupu-muted">{beat.body}</p>

        {isLast && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <RewardChip icon="fa-medal" text="+5 badge" tone="bg-qupu-brand-yellow text-qupu-ink" />
            <RewardChip icon="fa-bolt" text="+XP" tone="bg-qupu-brand-blue text-white" />
            <RewardChip icon="fa-coins" text="+koin" tone="bg-amber-400 text-white" />
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-center gap-2" aria-hidden="true">
        {BEATS.map((_, i) => (
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
        onClick={() => (isLast ? onComplete() : setIndex((i) => i + 1))}
        className="relative z-10 inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
      >
        {isLast ? 'Selesai' : 'Lanjut'}
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  )
}

function RewardChip({ icon, text, tone }: { icon: string; text: string; tone: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-xs font-black ${tone}`}
    >
      <i className={`fa-solid ${icon}`} aria-hidden="true" />
      {text}
    </span>
  )
}
