import { useState } from 'react'
import type { WmiQuestion, WmiSubmittedAttempt } from '../../types/wmi'
import WmiQuestionView from './WmiQuestionView'

export default function WmiExamReviewItem({
  question,
  attempt,
}: {
  question: WmiQuestion
  attempt: WmiSubmittedAttempt | undefined
}) {
  const [open, setOpen] = useState(false)
  const icon = attempt ? (attempt.is_correct ? 'fa-check' : 'fa-xmark') : 'fa-minus'
  const tone = attempt
    ? attempt.is_correct
      ? 'bg-[#58A700] text-white'
      : 'bg-rose-400 text-white'
    : 'bg-qupu-cream text-qupu-muted'

  return (
    <div className="rounded-[1.5rem] bg-white p-3 shadow-[0_4px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${tone}`}>
            <i className={`fa-solid ${icon} text-sm`} aria-hidden="true" />
          </span>
          <strong className="font-display font-black text-qupu-brand-blue">Soal {question.number}</strong>
        </span>
        <span className="truncate text-xs font-semibold text-qupu-muted">
          {attempt ? `Jawabanmu: ${attempt.selected_answer}` : 'Tidak dijawab'}
        </span>
      </button>
      {open && (
        <div className="mt-3">
          <WmiQuestionView
            question={question}
            selectedChoice={attempt?.selected_answer ?? null}
            fillValue={attempt?.selected_answer ?? ''}
            highlight={{
              correct: attempt?.is_correct ? attempt.selected_answer : null,
              wrongPicked: attempt && !attempt.is_correct ? attempt.selected_answer : null,
            }}
            onPickChoice={() => {}}
            onSubmitFillIn={() => {}}
            disabled
            onLookupTerm={() => {}}
            onRevealTranslation={() => {}}
            revealed
          />
          {!attempt?.is_correct && (question.hint_id ?? question.hint_en) && (
            <p className="mt-2 rounded-[1.25rem] bg-qupu-cream/60 p-3 text-sm font-semibold text-qupu-muted">
              <i className="fa-solid fa-lightbulb me-2 text-qupu-brand-orange" aria-hidden="true" />
              {question.hint_id ?? question.hint_en}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
