import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import WmiRevealCarousel from './WmiRevealCarousel'
import { HOOK_QUESTION } from '@/data/wmiMarketing'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** The grid the question is about: an rows x cols grid of unit squares. */
function GridFigure({ rows, cols, reduce }: { rows: number; cols: number; reduce: boolean }) {
  const u = 40
  const w = cols * u
  const h = rows * u
  const cells: Array<[number, number]> = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([c, r])
  return (
    <svg
      viewBox={`-3 -3 ${w + 6} ${h + 6}`}
      width={w}
      height={h}
      className="drop-shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
      aria-hidden="true"
    >
      {cells.map(([c, r], i) => (
        <motion.rect
          key={i}
          x={c * u}
          y={r * u}
          width={u}
          height={u}
          rx={5}
          fill="rgba(255,255,255,0.14)"
          stroke="#ffffff"
          strokeWidth={3}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 0.06 * i, duration: 0.3, ease: EASE }}
        />
      ))}
    </svg>
  )
}

/**
 * The /wmi hero: an interactive "are you smarter than a 2nd grader?" challenge.
 * A real WMI count-the-squares question (3x3 grid). Parents answer 9; the answer
 * is 14. Answering reveals the carousel, whose demo animates this exact concept.
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

        <div className="relative mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-yellow px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#5a4a00]">
            <i className="fa-solid fa-bolt" aria-hidden="true" />
            {HOOK_QUESTION.eyebrow}
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-5xl">{HOOK_QUESTION.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-white/90 sm:text-base">{HOOK_QUESTION.prompt}</p>

          <div className="mt-6 flex justify-center">
            <div className="rounded-[1.5rem] bg-white/10 p-4 ring-1 ring-white/20">
              <GridFigure rows={HOOK_QUESTION.grid.rows} cols={HOOK_QUESTION.grid.cols} reduce={!!reduce} />
            </div>
          </div>

          <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
            {HOOK_QUESTION.options.map((opt, i) => {
              const isAnswer = opt === HOOK_QUESTION.answer
              const isPicked = opt === picked
              const state = !answered ? 'idle' : isAnswer ? 'right' : isPicked ? 'wrong' : 'dim'
              return (
                <motion.button
                  key={opt}
                  type="button"
                  disabled={answered}
                  onClick={() => setPicked(opt)}
                  aria-label={`Jawaban ${opt}`}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{
                    opacity: state === 'dim' ? 0.5 : 1,
                    y: 0,
                    x: state === 'wrong' && !reduce ? [0, -7, 7, -4, 4, 0] : 0,
                    scale: state === 'right' && !reduce ? [1, 1.12, 1] : 1,
                  }}
                  transition={{ delay: reduce ? 0 : 0.06 * i, duration: 0.3, ease: EASE }}
                  whileHover={answered || reduce ? undefined : { y: -4, scale: 1.04 }}
                  whileTap={answered ? undefined : { scale: 0.96 }}
                  className={
                    'inline-flex items-center justify-center gap-1.5 rounded-[1.25rem] border-[3px] bg-white py-4 font-display text-2xl font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-qupu-brand-yellow focus-visible:ring-offset-2 ' +
                    (state === 'idle'
                      ? 'border-white/60 text-qupu-brand-blue '
                      : state === 'right'
                        ? 'border-green-500 text-green-600 '
                        : state === 'wrong'
                          ? 'border-red-400 text-red-500 '
                          : 'border-qupu-peach text-qupu-brand-blue/55 ')
                  }
                >
                  {opt}
                  {state === 'right' && <i className="fa-solid fa-circle-check text-base text-green-500" aria-hidden="true" />}
                  {state === 'wrong' && <i className="fa-solid fa-circle-xmark text-base text-red-400" aria-hidden="true" />}
                </motion.button>
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
                  {correct ? 'Hebat, jawabanmu benar!' : 'Banyak yang terjebak di sini. Jawabannya 14.'}
                </p>
                <p className="mx-auto mt-1 max-w-sm font-display text-sm font-extrabold text-qupu-brand-yellow">
                  {HOOK_QUESTION.reveal}
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm font-semibold text-white/85">
                  Bukan cuma 9 kotak kecil. Lihat caranya di bawah, persis seperti yang anak pelajari.
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
