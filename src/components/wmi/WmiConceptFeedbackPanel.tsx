import { useState } from 'react'

interface Props {
  isCorrect: boolean
  correctAnswer: string
  hintSteps: string[]
  lang: 'en' | 'id'
  onNext: () => void
}

export default function WmiConceptFeedbackPanel({
  isCorrect,
  correctAnswer,
  hintSteps,
  lang,
  onNext,
}: Props) {
  return isCorrect ? (
    <CorrectPanel correctAnswer={correctAnswer} lang={lang} onNext={onNext} />
  ) : (
    <WrongPanel correctAnswer={correctAnswer} hintSteps={hintSteps} lang={lang} onNext={onNext} />
  )
}

function CorrectPanel({
  correctAnswer,
  lang,
  onNext,
}: {
  correctAnswer: string
  lang: 'en' | 'id'
  onNext: () => void
}) {
  const id = lang === 'id'
  return (
    <div className="mt-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          ✓
        </span>
        <strong className="font-display text-lg font-extrabold text-emerald-700">
          {id ? 'Hebat!' : 'Great job!'}
        </strong>
      </div>
      <p className="mt-1 text-sm font-semibold text-gray-600">
        {id ? `Jawaban kamu benar — ${correctAnswer}.` : `Your answer is correct — ${correctAnswer}.`}
      </p>
      <NextButton lang={lang} onNext={onNext} />
    </div>
  )
}

function WrongPanel({
  correctAnswer,
  hintSteps,
  lang,
  onNext,
}: {
  correctAnswer: string
  hintSteps: string[]
  lang: 'en' | 'id'
  onNext: () => void
}) {
  const id = lang === 'id'
  const [revealed, setRevealed] = useState(0)
  const total = Math.max(hintSteps.length, 1)
  const done = revealed >= total

  return (
    <div className="mt-5 rounded-2xl border-2 border-rose-200 bg-rose-50/70 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          ×
        </span>
        <strong className="font-display text-lg font-extrabold text-rose-600">
          {id ? 'Belum tepat' : 'Not quite'}
        </strong>
      </div>
      <p className="mt-1 text-sm font-semibold text-gray-600">
        {id ? 'Tidak apa-apa! Ayo pecahkan langkah demi langkah.' : "That's okay! Let's break it down step by step."}
      </p>

      <div className="mt-3 flex flex-col gap-2.5">
        {hintSteps.slice(0, revealed).map((hint, index) => (
          <div key={`${hint}-${index}`} className="animate-rise flex items-end gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-qupu-sky text-lg" aria-hidden="true">
              🦉
            </span>
            <span className="relative rounded-2xl rounded-bl-sm bg-white px-3.5 py-2 text-sm font-semibold leading-snug text-gray-800 shadow-sm">
              {hint}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!done && (
          <button
            type="button"
            onClick={() => setRevealed((value) => value + 1)}
            className="inline-flex items-center gap-2 rounded-full border-2 border-qupu-brand-orange bg-white px-4 py-2 font-display text-sm font-extrabold text-qupu-brand-orange transition-transform hover:-translate-y-0.5"
          >
            <span aria-hidden="true">💡</span>
            {revealed === 0
              ? id ? 'Tampilkan petunjuk' : 'Show a hint'
              : id ? 'Petunjuk berikutnya' : 'Next hint'}
            <span className="rounded-full bg-qupu-brand-orange/15 px-1.5 text-xs">
              {revealed}/{total}
            </span>
          </button>
        )}
        {done && (
          <span className="animate-rise inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 font-display text-sm font-extrabold text-emerald-700">
            ✓ {id ? 'Jawaban benar' : 'Correct answer'}: {correctAnswer}
          </span>
        )}
      </div>

      <NextButton lang={lang} onNext={onNext} />
    </div>
  )
}

function NextButton({ lang, onNext }: { lang: 'en' | 'id'; onNext: () => void }) {
  return (
    <button
      type="button"
      onClick={onNext}
      className="mt-4 inline-flex items-center gap-2 rounded-full bg-qupu-brand-blue px-5 py-2.5 font-display text-sm font-extrabold text-white shadow-subscribe transition-transform hover:-translate-y-0.5"
    >
      {lang === 'id' ? 'Soal berikutnya' : 'Next question'} →
    </button>
  )
}
