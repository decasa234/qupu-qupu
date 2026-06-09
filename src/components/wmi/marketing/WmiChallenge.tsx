import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { HOOK_QUESTION } from '@/data/wmiMarketing'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Char-by-char typewriter for the headline (instant + cursor-free when reduced). */
function Typewriter({ text, reduce }: { text: string; reduce: boolean }) {
  const [n, setN] = useState(reduce ? text.length : 0)
  useEffect(() => {
    if (reduce) {
      setN(text.length)
      return
    }
    setN(0)
    let i = 0
    const id = setInterval(() => {
      i += 1
      setN(i)
      if (i >= text.length) clearInterval(id)
    }, 55)
    return () => clearInterval(id)
  }, [text, reduce])
  const done = n >= text.length
  return (
    <span aria-label={text}>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      {!done && (
        <span
          aria-hidden="true"
          className="ml-1 inline-block w-[3px] animate-pulse rounded bg-qupu-brand-yellow align-middle"
          style={{ height: '0.9em' }}
        />
      )}
    </span>
  )
}

/** The 3x3 grid the question is about, with an eye-catching staggered entrance. */
function GridFigure({ rows, cols, reduce }: { rows: number; cols: number; reduce: boolean }) {
  const u = 46
  const w = cols * u
  const h = rows * u
  const cells: Array<[number, number]> = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([c, r])
  return (
    <div className="relative">
      {/* one-time highlight ring flash */}
      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 rounded-[1.5rem] ring-4 ring-qupu-brand-yellow"
          initial={{ opacity: 0.7, scale: 0.9 }}
          animate={{ opacity: 0, scale: 1.35 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        />
      )}
      <motion.div
        className="rounded-[1.5rem] bg-white/10 p-4 ring-1 ring-white/20"
        initial={reduce ? false : { opacity: 0, scale: 0.7, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 14, mass: 0.7 }}
      >
        <svg viewBox={`-3 -3 ${w + 6} ${h + 6}`} width={w} height={h} className="drop-shadow-[0_6px_14px_rgba(0,0,0,0.18)]" aria-hidden="true">
          {cells.map(([c, r], i) => (
            <motion.rect
              key={i}
              x={c * u}
              y={r * u}
              width={u}
              height={u}
              rx={6}
              fill="rgba(255,255,255,0.14)"
              stroke="#ffffff"
              strokeWidth={3}
              initial={reduce ? false : { opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduce ? 0 : 0.35 + 0.07 * i, duration: 0.3, ease: EASE }}
              style={{ transformOrigin: `${c * u + u / 2}px ${r * u + u / 2}px` }}
            />
          ))}
        </svg>
      </motion.div>
    </div>
  )
}

export default function WmiChallenge({ onAnswer }: { onAnswer?: (value: string) => void }) {
  const [picked, setPicked] = useState<string | null>(null)
  const reduce = useReducedMotion()
  const answered = picked !== null
  const correct = picked === HOOK_QUESTION.answer

  const pick = (value: string) => {
    if (answered) return
    setPicked(value)
    onAnswer?.(value)
  }

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-qupu-brand-blue to-[#3d6ea8] px-6 py-10 text-white shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-12">
      <i className="fa-solid fa-star pointer-events-none absolute left-8 top-9 text-base text-qupu-brand-yellow/70" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute right-10 top-12 text-xs text-qupu-brand-yellow/50" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute bottom-10 right-1/4 text-sm text-qupu-brand-yellow/60" aria-hidden="true" />

      <div className="relative mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-yellow px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#5a4a00]">
          <i className="fa-solid fa-bolt" aria-hidden="true" />
          {HOOK_QUESTION.eyebrow}
        </span>
        <h1 className="mt-4 min-h-[1.2em] font-display text-3xl font-extrabold leading-tight sm:text-5xl">
          <Typewriter text={HOOK_QUESTION.title} reduce={!!reduce} />
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-white/90 sm:text-base">{HOOK_QUESTION.prompt}</p>

        {/* options (left) + problem (right) */}
        <div className="mt-8 grid items-center gap-6 lg:grid-cols-2">
          <div className="order-2 flex flex-col gap-3 lg:order-1">
            {HOOK_QUESTION.options.map((opt, i) => {
              const isAnswer = opt === HOOK_QUESTION.answer
              const isPicked = opt === picked
              const state = !answered ? 'idle' : isAnswer ? 'right' : isPicked ? 'wrong' : 'dim'
              return (
                <motion.button
                  key={opt}
                  type="button"
                  disabled={answered}
                  onClick={() => pick(opt)}
                  aria-label={`Jawaban ${opt}`}
                  initial={reduce ? false : { opacity: 0, x: -24 }}
                  animate={{
                    opacity: state === 'dim' ? 0.5 : 1,
                    x: state === 'wrong' && !reduce ? [0, -8, 8, -5, 5, 0] : 0,
                    scale: state === 'right' && !reduce ? [1, 1.06, 1] : 1,
                  }}
                  transition={{ delay: reduce ? 0 : 0.15 + 0.08 * i, duration: 0.3, ease: EASE }}
                  whileHover={answered || reduce ? undefined : { x: 4, scale: 1.02 }}
                  whileTap={answered ? undefined : { scale: 0.97 }}
                  className={
                    'flex items-center justify-between rounded-[1.25rem] border-[3px] bg-white px-5 py-4 font-display text-2xl font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-qupu-brand-yellow focus-visible:ring-offset-2 ' +
                    (state === 'idle'
                      ? 'border-white/60 text-qupu-brand-blue '
                      : state === 'right'
                        ? 'border-green-500 text-green-600 '
                        : state === 'wrong'
                          ? 'border-red-400 text-red-500 '
                          : 'border-qupu-peach text-qupu-brand-blue/55 ')
                  }
                >
                  <span>{opt}</span>
                  {state === 'right' && <i className="fa-solid fa-circle-check text-xl text-green-500" aria-hidden="true" />}
                  {state === 'wrong' && <i className="fa-solid fa-circle-xmark text-xl text-red-400" aria-hidden="true" />}
                  {state === 'idle' && <i className="fa-solid fa-chevron-right text-base text-qupu-brand-blue/40" aria-hidden="true" />}
                </motion.button>
              )
            })}
          </div>

          <div className="order-1 flex justify-center lg:order-2">
            <GridFigure rows={HOOK_QUESTION.grid.rows} cols={HOOK_QUESTION.grid.cols} reduce={!!reduce} />
          </div>
        </div>

        <AnimatePresence>
          {answered && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
              className="mt-7"
            >
              <p className="font-display text-base font-extrabold sm:text-lg">
                {correct ? 'Hebat, jawabanmu benar!' : 'Banyak yang terjebak di sini. Jawabannya 14.'}
              </p>
              <p className="mx-auto mt-1 max-w-sm font-display text-sm font-extrabold text-qupu-brand-yellow">
                {HOOK_QUESTION.reveal}
              </p>
              <p className="mx-auto mt-1 max-w-md text-sm font-semibold text-white/85">
                Bukan cuma 9 kotak kecil. Gulir ke bawah, lihat caranya dan apa yang anak dapat di QUPU.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!answered && (
          <p className="mt-5 text-sm font-semibold text-white/70">
            <i className="fa-solid fa-hand-pointer mr-1.5" aria-hidden="true" />
            Pilih jawaban untuk membuka demo dan cara belajarnya
          </p>
        )}
      </div>
    </section>
  )
}
