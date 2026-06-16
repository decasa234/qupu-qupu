import { useState } from 'react'
import { bi, Paragraphs, type Lang } from './textUtil'

interface CheckBlockData {
  id: string
  prompt_en: string
  prompt_id: string
  choices_en: string[]
  choices_id: string[]
  answer_index: number
  explain_en?: string
  explain_id?: string
}

export default function CheckBlock({
  block,
  lang,
  onAnswered,
}: {
  block: CheckBlockData
  lang: Lang
  onAnswered?: (blockId: string, correct: boolean) => void
}) {
  const [picked, setPicked] = useState<number | null>(null)
  const choices = lang === 'en' ? block.choices_en : block.choices_id
  const answered = picked !== null
  const isCorrect = picked === block.answer_index
  const explain = bi(lang, block.explain_en, block.explain_id)

  function choose(i: number) {
    if (answered) return
    setPicked(i)
    onAnswered?.(block.id, i === block.answer_index)
  }

  return (
    <section className="rounded-2xl border-2 border-qupu-brand-orange/30 bg-qupu-cream/50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-qupu-brand-orange text-[11px] text-white">
          <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-qupu-brand-orange">
          {lang === 'en' ? 'Quick check' : 'Cek dulu'}
        </span>
      </div>

      <p className="font-display text-base font-extrabold leading-snug text-qupu-brand-blue">
        {bi(lang, block.prompt_en, block.prompt_id)}
      </p>

      <div className="mt-3 grid gap-2">
        {choices.map((choice, i) => {
          const isAnswer = i === block.answer_index
          const isPicked = i === picked
          let cls = 'border-qupu-brand-blue/15 bg-white text-qupu-brand-blue hover:bg-qupu-shell'
          if (answered && isAnswer) cls = 'border-[#58A700] bg-[#EAF7DC] text-[#3B6E00]'
          else if (answered && isPicked) cls = 'border-red-400 bg-red-50 text-red-600'
          else if (answered) cls = 'border-qupu-brand-blue/10 bg-white text-qupu-muted'
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={answered}
              className={`flex items-center justify-between rounded-xl border-2 px-4 py-2.5 text-left text-sm font-bold transition-colors ${cls} ${
                answered ? 'cursor-default' : ''
              }`}
            >
              <span>{choice}</span>
              {answered && isAnswer && <i className="fa-solid fa-check text-[#58A700]" aria-hidden="true" />}
              {answered && isPicked && !isAnswer && (
                <i className="fa-solid fa-xmark text-red-500" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>

      {answered && (
        <div
          className={`mt-3 rounded-xl px-3 py-2 text-sm font-bold ${
            isCorrect ? 'bg-[#EAF7DC] text-[#3B6E00]' : 'bg-red-50 text-red-600'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <i className={`fa-solid ${isCorrect ? 'fa-circle-check' : 'fa-circle-info'}`} aria-hidden="true" />
            {isCorrect
              ? lang === 'en'
                ? 'Correct!'
                : 'Benar!'
              : lang === 'en'
                ? 'Not quite.'
                : 'Belum tepat.'}
          </div>
          {explain && (
            <div className="mt-1 space-y-1 font-semibold text-qupu-brand-blue/80">
              <Paragraphs text={explain} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
