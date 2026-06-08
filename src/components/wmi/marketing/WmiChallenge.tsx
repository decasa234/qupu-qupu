import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import WmiRevealCarousel from './WmiRevealCarousel'
import { HOOK_QUESTION, type NetCell } from '@/data/wmiMarketing'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** A crisp thumbnail of a 6-square cube net; cells are [col, row]. */
function NetThumb({ cells }: { cells: NetCell[] }) {
  const cols = Math.max(...cells.map((c) => c[0])) + 1
  const rows = Math.max(...cells.map((c) => c[1])) + 1
  const u = 13
  return (
    <svg
      viewBox={`-1 -1 ${cols * u + 2} ${rows * u + 2}`}
      className="mx-auto h-14 w-auto"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {cells.map(([c, r], i) => (
        <rect key={i} x={c * u} y={r * u} width={u - 2} height={u - 2} rx={2} fill="currentColor" />
      ))}
    </svg>
  )
}

/**
 * The /wmi hero: an interactive "are you smarter than a 2nd grader?" challenge
 * using a real WMI dice-net question. Answering (right or wrong) reveals the
 * carousel (feature tour, the animated explainer for this exact concept, and
 * the mastery tree).
 */
export default function WmiChallenge() {
  const [picked, setPicked] = useState<string | null>(null)
  const reduce = useReducedMotion()
  const answered = picked !== null
  const correct = picked === HOOK_QUESTION.answer

  return (
    <div>
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-qupu-brand-blue to-[#3d6ea8] px-6 py-10 text-white shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-12">
        <i className="fa-solid fa-star pointer-events-none absolute left-8 top-9 text-base text-qupu-brand-yellow/70" aria-hidden="true" />
        <i className="fa-solid fa-star pointer-events-none absolute right-10 top-12 text-xs text-qupu-brand-yellow/50" aria-hidden="true" />
        <i className="fa-solid fa-star pointer-events-none absolute bottom-10 right-1/4 text-sm text-qupu-brand-yellow/60" aria-hidden="true" />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-yellow px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#5a4a00]">
            <i className="fa-solid fa-bolt" aria-hidden="true" />
            {HOOK_QUESTION.eyebrow}
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-5xl">{HOOK_QUESTION.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-white/90 sm:text-base">{HOOK_QUESTION.prompt}</p>

          <div className="mx-auto mt-7 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {HOOK_QUESTION.options.map((o) => {
              const isAnswer = o.label === HOOK_QUESTION.answer
              const isPicked = o.label === picked
              const state = !answered ? 'idle' : isAnswer ? 'right' : isPicked ? 'wrong' : 'dim'
              return (
                <button
                  key={o.label}
                  type="button"
                  disabled={answered}
                  onClick={() => setPicked(o.label)}
                  aria-label={`Jaring ${o.label}`}
                  className={
                    'rounded-[1.25rem] border-[3px] bg-white p-3 transition ' +
                    (state === 'idle'
                      ? 'border-white/60 hover:-translate-y-1 hover:border-qupu-brand-yellow '
                      : state === 'right'
                        ? 'border-green-500 '
                        : state === 'wrong'
                          ? 'border-red-400 '
                          : 'border-qupu-peach opacity-70 ')
                  }
                >
                  <div
                    className={
                      state === 'wrong'
                        ? 'text-red-400'
                        : state === 'dim'
                          ? 'text-qupu-brand-blue/55'
                          : 'text-qupu-brand-blue'
                    }
                  >
                    <NetThumb cells={o.cells} />
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1.5 font-display text-sm font-extrabold text-qupu-brand-blue">
                    {o.label}
                    {state === 'right' && <i className="fa-solid fa-circle-check text-green-500" aria-hidden="true" />}
                    {state === 'wrong' && <i className="fa-solid fa-circle-xmark text-red-400" aria-hidden="true" />}
                  </div>
                </button>
              )
            })}
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.25 }}
                className="mt-6"
              >
                <p className="font-display text-base font-extrabold sm:text-lg">
                  {correct ? 'Hebat, jawabanmu benar!' : 'Hampir! Jawaban yang benar: A.'}
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm font-semibold text-white/85">
                  Banyak orang dewasa keliru di soal ini. Lihat caranya di bawah, persis seperti yang anak pelajari.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {!answered && (
        <p className="mt-4 text-center text-sm font-semibold text-qupu-muted">
          <i className="fa-solid fa-arrow-up mr-1.5" aria-hidden="true" />
          Pilih jawaban untuk membuka demo dan cara belajarnya
        </p>
      )}

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
            className="mt-6"
          >
            <WmiRevealCarousel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
