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
  const icon = attempt ? (attempt.is_correct ? 'OK' : 'X') : '-'
  const tone = attempt ? (attempt.is_correct ? 'text-green-600' : 'text-red-600') : 'text-gray-500'

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-3">
          <span className={`font-bold ${tone}`}>{icon}</span>
          <strong>Soal {question.number}</strong>
        </span>
        <span className="text-sm text-gray-500">
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
          {!attempt?.is_correct && question.hint_en && (
            <p className="mt-2 text-sm italic text-gray-600">{question.hint_en}</p>
          )}
        </div>
      )}
    </div>
  )
}
