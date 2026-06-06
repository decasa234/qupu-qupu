import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { LogicFrame, Pill } from './LogicVisuals'
import { useLogicBeat } from './useLogicBeat'
import type { BasicStep } from './logicSteps'
import { buildMissingAddendStory } from './missingAddendStory'

function makeStory(lines: string[]): { steps: BasicStep[]; finalIndex: number } {
  const steps = lines.map((caption, i): BasicStep => ({ phase: String(i), caption, hold: i === lines.length - 1 ? 0 : 1000, result: i === lines.length - 1 }))
  return { steps, finalIndex: steps.length - 1 }
}

function GenericCard(props: ExplainerProps & { title: string; lines: string[]; chips: string[] }) {
  const story = useMemo(() => makeStory(props.lines), [props.lines])
  const { beat } = useLogicBeat(story, props)
  return (
    <LogicFrame beat={beat} label={props.title}>
      <div className="flex flex-wrap justify-center gap-2">
        {props.chips.map((chip, i) => <Pill key={`${chip}-${i}`} active={beat.phase === String(i)} good={beat.result}>{chip}</Pill>)}
      </div>
    </LogicFrame>
  )
}

export function MissingAddendExplainer(props: ExplainerProps) {
  const { a, b } = props.params as { a: number; b: number }
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildMissingAddendStory({ a, b }, lang), [a, b, lang])
  const { beat } = useLogicBeat(story, props)
  const { sum } = story

  // Before the switch the +b term sits on the left of the = sign; after it,
  // it has crossed to the right and flipped to −b.
  const beforeSwitch = beat.phase === 'equation' || beat.phase === 'isolate'
  const isolating = beat.phase === 'isolate'
  const switching = beat.phase === 'switch'
  const showSolve = beat.phase === 'solve' || beat.phase === 'answer'
  const reveal = beat.phase === 'answer'

  const spring = { type: 'spring', stiffness: 380, damping: 30 } as const
  const missingBox = `grid h-16 w-16 place-items-center rounded-2xl border-4 text-4xl font-black shadow-sm transition-colors ${reveal ? 'border-emerald-400 bg-emerald-100 text-emerald-700' : 'border-amber-300 bg-amber-100 text-amber-700'}`

  return (
    <div
      className="mx-auto flex w-full max-w-[440px] flex-col items-center gap-6"
      role="img"
      aria-label={T(
        `Solve ? + ${b} = ${sum}: switch +${b} across the = sign where it becomes −${b}, so ? = ${sum} − ${b} = ${a}.`,
        `Selesaikan ? + ${b} = ${sum}: pindahkan +${b} melewati tanda = sehingga menjadi −${b}, jadi ? = ${sum} − ${b} = ${a}.`,
      )}
    >
      {/* Equation — the +b term slides across the = sign and flips to −b */}
      <div className="flex min-h-[5.5rem] flex-wrap items-center justify-center gap-2 text-4xl font-black text-slate-700">
        <motion.span layout transition={spring} className={missingBox}>
          {reveal ? a : '?'}
        </motion.span>

        {beforeSwitch && (
          <motion.span
            layout
            layoutId="movable-term"
            transition={spring}
            className={`grid h-14 min-w-[3.5rem] place-items-center rounded-2xl border-4 px-3 text-3xl font-black transition-colors ${isolating ? 'border-sky-400 bg-sky-100 text-sky-700 ring-4 ring-sky-200' : 'border-emerald-300 bg-emerald-50 text-emerald-700'}`}
          >
            +{b}
          </motion.span>
        )}

        <motion.span layout transition={spring} className="px-1 text-slate-400">=</motion.span>

        <motion.span
          layout
          transition={spring}
          className="grid h-14 min-w-[3.5rem] place-items-center rounded-2xl border-4 border-violet-300 bg-violet-100 px-3 text-violet-700"
        >
          {sum}
        </motion.span>

        {!beforeSwitch && (
          <motion.span
            layout
            layoutId="movable-term"
            transition={spring}
            initial={{ scale: 1 }}
            animate={switching ? { scale: [1, 1.18, 1] } : { scale: 1 }}
            className="grid h-14 min-w-[3.5rem] place-items-center rounded-2xl border-4 border-rose-300 bg-rose-100 px-3 text-3xl font-black text-rose-600"
          >
            −{b}
          </motion.span>
        )}
      </div>

      {/* Basic rule callout — only while the term is crossing */}
      <div className="flex min-h-[3rem] items-center justify-center">
        <AnimatePresence mode="wait">
          {switching && (
            <motion.div
              key="rule"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 rounded-xl border-2 px-4 py-2 font-display text-base font-extrabold"
              style={{ background: '#FFF4E8', borderColor: '#F97316', color: '#8a4b1d' }}
            >
              <span className="text-emerald-600">+</span>
              <span aria-hidden>→</span>
              <span className="text-rose-600">−</span>
              <span className="ml-1">{T('when it crosses =', 'saat melewati =')}</span>
            </motion.div>
          )}
          {showSolve && (
            <motion.div
              key="solve"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-black"
            >
              <span className="text-slate-400">? = </span>
              <span className="text-violet-700">{sum}</span>
              <span className="text-slate-400"> − </span>
              <span className="text-rose-500">{b}</span>
              <span className="text-slate-400"> = </span>
              <span className="text-emerald-700">{a}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Single caption */}
      <div
        className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
        style={
          beat.result
            ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
            : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
        }
      >
        {beat.caption}
      </div>
    </div>
  )
}

export function ArrangeDigitsExplainer(props: ExplainerProps) {
  const p = props.params as { digits: number[]; rank: number }
  const list = p.digits.flatMap((a) => p.digits.filter((b) => b !== a).map((b) => a * 10 + b)).sort((a, b) => a - b)
  return <GenericCard {...props} title="arrange digits" chips={list.map(String)} lines={[`Make all 2-digit numbers.`, `Sort: ${list.join(', ')}.`, `Rank ${p.rank} is ${list[p.rank - 1]}.`]} />
}

export function VisualPatternNextExplainer(props: ExplainerProps) {
  const p = props.params as { cycle: string[]; shown: number }
  const icon: Record<string, string> = { circle: '○', triangle: '△', square: '□', star: '☆' }
  const next = p.cycle[p.shown % p.cycle.length]
  return <GenericCard {...props} title="visual pattern" chips={p.cycle.map((x) => icon[x])} lines={[`Cycle: ${p.cycle.map((x) => icon[x]).join(' ')}.`, `Next is ${icon[next]}.`]} />
}

export function ShapeTransformationRuleExplainer(props: ExplainerProps) {
  const p = props.params as { shape: string; transform: 'turn' | 'flip' }
  const turn: Record<string, string> = { '▲': '▶', '▶': '▼', '■': '■' }
  const flip: Record<string, string> = { '▲': '▼', '▶': '◀', '■': '■' }
  const ans = (p.transform === 'turn' ? turn : flip)[p.shape]
  return <GenericCard {...props} title="shape rule" chips={[p.shape, p.transform, ans]} lines={[`Rule: ${p.transform}.`, `${p.shape} -> ${ans}.`]} />
}

export function NetProgressCyclesExplainer(props: ExplainerProps) {
  const p = props.params as { up: number; down: number; cycles: number }
  const net = p.up - p.down
  return <GenericCard {...props} title="net progress" chips={[`up ${p.up}`, `down ${p.down}`, `net ${net}`]} lines={[`${p.up} - ${p.down} = ${net}.`, `${net} x ${p.cycles} = ${net * p.cycles}.`]} />
}

export function RopeWrapsRatioExplainer(props: ExplainerProps) {
  const p = props.params as { aWraps: number; bWraps: number; bSecond: number }
  const ans = (p.bSecond * p.aWraps) / p.bWraps
  return <GenericCard {...props} title="rope ratio" chips={[`A ${p.aWraps}`, `B ${p.bWraps}`, `B ${p.bSecond}`]} lines={[`A/B = ${p.aWraps}/${p.bWraps}.`, `${p.bSecond} x ${p.aWraps} / ${p.bWraps} = ${ans}.`]} />
}

export function EquivalentFractionFillExplainer(props: ExplainerProps) {
  const p = props.params as { num: number; den: number; m: number }
  return <GenericCard {...props} title="equivalent fraction" chips={[`${p.num}/${p.den}`, `x ${p.m}`, `${p.num * p.m}/${p.den * p.m}`]} lines={[`${p.den} x ${p.m} = ${p.den * p.m}.`, `${p.num} x ${p.m} = ${p.num * p.m}.`]} />
}

export function TableLookupCombineExplainer(props: ExplainerProps) {
  const p = props.params as { apples: number; oranges: number; mode: 'sum' | 'diff' }
  const ans = p.mode === 'sum' ? p.apples + p.oranges : p.apples - p.oranges
  return <GenericCard {...props} title="table lookup" chips={[`apples ${p.apples}`, `oranges ${p.oranges}`, String(ans)]} lines={[`Read both table values.`, `${p.apples} ${p.mode === 'sum' ? '+' : '-'} ${p.oranges} = ${ans}.`]} />
}

export function TruthOrderCluesExplainer(props: ExplainerProps) {
  const p = props.params as { order: string[] }
  return <GenericCard {...props} title="order clues" chips={p.order} lines={[`Chain the clues.`, `${p.order.join(' -> ')}.`, `${p.order[0]} is first.`]} />
}

export function MakeGroupsLeftoverExplainer(props: ExplainerProps) {
  const p = props.params as { total: number; groupSize: number }
  const groups = Math.floor(p.total / p.groupSize)
  const used = groups * p.groupSize
  const left = p.total - used
  return <GenericCard {...props} title="groups leftover" chips={[`${p.total}`, `groups of ${p.groupSize}`, `left ${left}`]} lines={[`${groups} x ${p.groupSize} = ${used}.`, `${p.total} - ${used} = ${left}.`]} />
}
