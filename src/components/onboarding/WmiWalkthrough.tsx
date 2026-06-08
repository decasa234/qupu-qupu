// src/components/onboarding/WmiWalkthrough.tsx
//
// Onboarding Chapter 1: an interactive walkthrough of ONE real WMI problem,
// rendered with the actual WMI components (WmiQuestionView + WmiFeedbackPanel),
// so the demo IS the real experience. Coach-marks guide the kid to try the two
// signature features before answering:
//   1. the language toggle (EN <-> ID),
//   2. the glossary-term tap (the underlined word -> definition popup).
// Answer choices stay locked until both are tried; then a pick shows the real
// "Hebat!/Belum tepat" feedback. No login needed: the glossary loads from the
// public endpoint and the problem is curated locally.
import { useEffect, useState } from 'react'
import { useWmiStore } from '../../store/wmiStore'
import { trackEvent } from '../../lib/analytics'
import { DEMO_WMI_PROBLEM } from '../../lib/demoWmiProblem'
import WmiQuestionView from '../wmi/WmiQuestionView'
import WmiFeedbackPanel from '../wmi/WmiFeedbackPanel'

interface WmiWalkthroughProps {
  onComplete: () => void
}

export default function WmiWalkthrough({ onComplete }: WmiWalkthroughProps) {
  const loadGlossary = useWmiStore((state) => state.loadGlossary)
  const [langDone, setLangDone] = useState(false)
  const [glossaryDone, setGlossaryDone] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    void loadGlossary().catch(() => {})
    trackEvent('demo_tour_viewed', { variant: 'wmi' })
  }, [loadGlossary])

  const { question, correctAnswer } = DEMO_WMI_PROBLEM
  const answered = picked !== null
  const isCorrect = picked === correctAnswer
  const tasksReady = langDone && glossaryDone
  // Choices are locked until both features are tried, and again after answering
  // (so the feedback state stays frozen). The language toggle + glossary taps are
  // never gated by `disabled`, so the kid can always use them.
  const choicesDisabled = !tasksReady || answered

  function handlePick(label: string) {
    if (choicesDisabled) return
    setPicked(label)
    trackEvent('demo_question_answered', {
      correct: label === correctAnswer,
      variant: 'wmi',
    })
  }

  let coach: { icon: string; text: string }
  if (!langDone) {
    coach = {
      icon: 'fa-globe',
      text: 'Tap tombol bola dunia di kanan atas untuk ganti bahasa (Inggris ↔ Indonesia).',
    }
  } else if (!glossaryDone) {
    coach = {
      icon: 'fa-book-open',
      text: 'Tap kata bergaris bawah (mis. "keliling") untuk lihat artinya.',
    }
  } else if (!answered) {
    coach = { icon: 'fa-hand-pointer', text: 'Sekarang pilih jawaban yang benar!' }
  } else if (isCorrect) {
    coach = {
      icon: 'fa-circle-check',
      text: 'Jawaban benar → "Hebat!". Tiap jawaban benar menambah XP & badge.',
    }
  } else {
    coach = {
      icon: 'fa-lightbulb',
      text: 'Kalau salah, QUPU tunjukkan jawaban benar + petunjuk. Tidak apa-apa, terus coba!',
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <span className="inline-block rounded-full bg-qupu-brand-blue px-4 py-1 font-display text-xs font-black uppercase tracking-[0.18em] text-white">
          Latihan WMI
        </span>
        <h1 className="mt-2 font-display text-xl font-black text-qupu-ink">Coba satu soal WMI</h1>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border-2 border-qupu-peach bg-qupu-shell px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-qupu-brand-orange text-white">
          <i className={`fa-solid ${coach.icon}`} aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-qupu-ink">{coach.text}</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <ChecklistItem done={langDone} label="Bahasa" />
        <ChecklistItem done={glossaryDone} label="Arti kata" />
        <ChecklistItem done={answered} label="Jawab" />
      </div>

      <WmiQuestionView
        question={question}
        label="Soal contoh"
        selectedChoice={picked}
        highlight={
          answered
            ? { correct: correctAnswer, wrongPicked: isCorrect ? null : picked }
            : undefined
        }
        disabled={choicesDisabled}
        onPickChoice={handlePick}
        onSubmitFillIn={() => {}}
        onLookupTerm={() => setGlossaryDone(true)}
        onRevealTranslation={() => setLangDone(true)}
      />

      {answered ? (
        <WmiFeedbackPanel
          isCorrect={isCorrect}
          correctAnswer={correctAnswer}
          hintEn={null}
          hintId={isCorrect ? null : question.hint_id}
          onNext={onComplete}
        />
      ) : (
        <p className="text-center text-xs font-semibold text-qupu-muted">
          {tasksReady
            ? 'Pilih salah satu jawaban di atas.'
            : 'Selesaikan langkah bahasa & arti kata dulu untuk membuka jawaban.'}
        </p>
      )}
    </div>
  )
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        done ? 'bg-green-100 text-green-700' : 'bg-qupu-shell text-qupu-muted'
      }`}
    >
      <i
        className={`fa-solid ${done ? 'fa-circle-check' : 'fa-circle'} text-[0.7rem]`}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
