// src/components/onboarding/PlanReveal.tsx
import { useEffect } from 'react'
import { trackEvent } from '../../lib/analytics'
import type { SubjectOption } from '../../types'

interface PlanRevealProps {
  childName: string
  gradeName: string
  subjects: SubjectOption[]
  quizCount: number
  onSignup: () => void
  onSkip: () => void
}

export default function PlanReveal({
  childName,
  gradeName,
  subjects,
  quizCount,
  onSignup,
  onSkip,
}: PlanRevealProps) {
  useEffect(() => {
    trackEvent('demo_plan_viewed')
  }, [])

  const heading = childName
    ? `Rencana belajar ${childName}`
    : 'Rencana belajar siap!'

  return (
    <div className="flex flex-col gap-6 text-center">
      <div>
        <span className="inline-block rounded-full bg-qupu-brand-yellow px-4 py-1 font-display text-xs font-black uppercase tracking-[0.18em] text-qupu-ink">
          {gradeName}
        </span>
        <h1 className="mt-3 font-display text-2xl font-black text-qupu-ink">{heading}</h1>
        <p className="mt-1 text-sm font-semibold text-qupu-muted">
          {quizCount > 0
            ? `${quizCount}+ kuis siap dimainkan, plus latihan matematika WMI.`
            : 'Kuis seru dan latihan matematika WMI menanti.'}
        </p>
      </div>

      {subjects.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {subjects.slice(0, 6).map((subject) => (
            <span
              key={subject.id}
              className="rounded-full px-4 py-2 font-display text-sm font-extrabold text-white"
              style={{ backgroundColor: subject.colorHex }}
            >
              {subject.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onSignup}
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
        >
          <i className="fa-solid fa-rocket" aria-hidden="true" />
          Buat akun & mulai
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="font-semibold text-qupu-muted hover:text-qupu-brand-orange"
        >
          Nanti saja
        </button>
      </div>
    </div>
  )
}
