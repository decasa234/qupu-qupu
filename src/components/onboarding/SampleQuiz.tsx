// src/components/onboarding/SampleQuiz.tsx
import { useState } from 'react'
import { trackEvent } from '../../lib/analytics'
import type { DemoQuestion } from '../../lib/demoQuestions'

interface SampleQuizProps {
  questions: DemoQuestion[]
  onComplete: (answers: boolean[]) => void
}

export default function SampleQuiz({ questions, onComplete }: SampleQuizProps) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])

  const question = questions[index]
  const isLast = index === questions.length - 1
  const answered = picked !== null
  const correct = answered && picked === question.correctIndex

  function handlePick(choiceIndex: number) {
    if (answered) return
    setPicked(choiceIndex)
    trackEvent('demo_question_answered', {
      questionIndex: index,
      correct: choiceIndex === question.correctIndex,
    })
  }

  function handleNext() {
    const nextAnswers = [...answers, correct]
    if (isLast) {
      onComplete(nextAnswers)
      return
    }
    setAnswers(nextAnswers)
    setIndex((i) => i + 1)
    setPicked(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">
        Soal {index + 1} dari {questions.length}
      </p>

      <div className="rounded-[1.75rem] bg-qupu-brand-blue px-5 py-8 text-center text-white shadow-[0_5px_0_0_#234B73]">
        <span className="font-display text-3xl font-black">{question.prompt}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice, i) => {
          const isCorrectChoice = i === question.correctIndex
          const isPicked = picked === i
          let tone =
            'border-qupu-peach bg-qupu-shell text-qupu-ink hover:border-qupu-brand-blue'
          if (answered && isCorrectChoice) {
            tone = 'border-green-500 bg-green-50 text-green-700'
          } else if (answered && isPicked && !isCorrectChoice) {
            tone = 'border-red-400 bg-red-50 text-red-600'
          }
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => handlePick(i)}
              className={`rounded-2xl border-2 px-4 py-4 font-display text-xl font-extrabold transition-colors disabled:cursor-default ${tone}`}
            >
              {choice}
            </button>
          )
        })}
      </div>

      {answered && (
        <div
          className={`rounded-[1.25rem] px-4 py-3 text-sm font-semibold ${
            correct ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {correct ? 'Tepat! ' : 'Hampir! '}
          {question.explanation}
        </div>
      )}

      <button
        type="button"
        disabled={!answered}
        onClick={handleNext}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLast ? 'Selesai' : 'Lanjut'}
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  )
}
