import { useState } from 'react'
import type { WmiConceptReward } from '../../types/wmi'

interface Props {
  isCorrect: boolean
  correctAnswer: string
  hintSteps: string[]
  lang: 'en' | 'id'
  reward?: WmiConceptReward | null
  onNext: () => void
}

export default function WmiConceptFeedbackPanel({
  isCorrect,
  correctAnswer,
  hintSteps,
  lang,
  reward,
  onNext,
}: Props) {
  return isCorrect ? (
    <CorrectPanel correctAnswer={correctAnswer} lang={lang} reward={reward} onNext={onNext} />
  ) : (
    <WrongPanel correctAnswer={correctAnswer} hintSteps={hintSteps} lang={lang} onNext={onNext} />
  )
}

// Reward chips shown after a correct answer — mirrors the post-quiz summary's
// XP / coin / level-up vocabulary in a compact inline row.
function RewardChips({ reward, lang }: { reward?: WmiConceptReward | null; lang: 'en' | 'id' }) {
  if (!reward || (reward.xpEarned <= 0 && reward.coinsEarned <= 0 && !reward.levelUp)) return null
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {reward.xpEarned > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-qupu-brand-blue px-3 py-1.5 font-display text-sm font-extrabold text-white">
          <i className="fa-solid fa-bolt text-qupu-brand-yellow" aria-hidden="true" />
          +{reward.xpEarned} XP
        </span>
      )}
      {reward.coinsEarned > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 font-display text-sm font-extrabold text-white">
          <i className="fa-solid fa-coins" aria-hidden="true" />
          +{reward.coinsEarned}
        </span>
      )}
      {reward.tierUp && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#58A700] px-3 py-1.5 font-display text-sm font-extrabold text-white">
          <i className="fa-solid fa-arrow-up" aria-hidden="true" />
          {lang === 'id' ? 'Naik tingkat!' : 'Tier up!'}
        </span>
      )}
      {reward.levelUp && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-qupu-brand-yellow px-3 py-1.5 font-display text-sm font-extrabold text-qupu-brand-blue">
          <i className="fa-solid fa-star" aria-hidden="true" />
          {lang === 'id' ? 'Naik ke' : 'Level'} {reward.levelUp.currentLevel}!
        </span>
      )}
    </div>
  )
}

function CorrectPanel({
  correctAnswer,
  lang,
  reward,
  onNext,
}: {
  correctAnswer: string
  lang: 'en' | 'id'
  reward?: WmiConceptReward | null
  onNext: () => void
}) {
  const id = lang === 'id'
  return (
    <div className="animate-reward-pop mt-5 rounded-[1.5rem] border-2 border-emerald-200 bg-emerald-50 p-4 shadow-[0_4px_0_0_#bbf7d0]">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white" aria-hidden="true">
          <i className="fa-solid fa-check text-sm" />
        </span>
        <strong className="font-display text-lg font-extrabold text-emerald-700">
          {id ? 'Hebat!' : 'Great job!'}
        </strong>
      </div>
      <p className="mt-1 text-sm font-semibold text-gray-600">
        {id ? `Jawaban kamu benar — ${correctAnswer}.` : `Your answer is correct — ${correctAnswer}.`}
      </p>
      <RewardChips reward={reward} lang={lang} />
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
    <div className="mt-5 rounded-[1.5rem] border-2 border-rose-200 bg-rose-50/70 p-4 shadow-[0_4px_0_0_#fecdd3]">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white" aria-hidden="true">
          <i className="fa-solid fa-xmark text-sm" />
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
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-qupu-sky text-qupu-brand-blue"
              aria-hidden="true"
            >
              <i className="fa-solid fa-lightbulb" />
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
            <i className="fa-solid fa-lightbulb" aria-hidden="true" />
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
            <i className="fa-solid fa-check" aria-hidden="true" />
            {id ? 'Jawaban benar' : 'Correct answer'}: {correctAnswer}
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
      {lang === 'id' ? 'Soal berikutnya' : 'Next question'}
      <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
    </button>
  )
}
