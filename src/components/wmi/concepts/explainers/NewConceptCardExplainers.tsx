import { useMemo } from 'react'
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

  const showBar = beat.phase !== 'equation'
  const removeKnown = beat.phase === 'inverse' || beat.phase === 'solve' || beat.phase === 'answer'
  const showSolve = beat.phase === 'solve' || beat.phase === 'answer'
  const reveal = beat.phase === 'answer'

  const missingBox = `grid h-14 w-14 place-items-center rounded-2xl border-4 text-3xl font-black shadow-sm transition-all ${reveal ? 'border-emerald-400 bg-emerald-100 text-emerald-700' : 'border-amber-300 bg-amber-100 text-amber-700'}`

  return (
    <div
      className="mx-auto flex w-full max-w-[440px] flex-col items-center gap-4"
      role="img"
      aria-label={T(
        `Find the missing addend: the whole ${sum} minus the known part ${b} gives ${a}.`,
        `Cari bilangan yang hilang: seluruh ${sum} dikurangi bagian diketahui ${b} sama dengan ${a}.`,
      )}
    >
      <div className="flex w-full flex-col items-center gap-5">
        {/* Equation row */}
        <div className="flex items-center gap-2 text-3xl font-black text-slate-800">
          <span className={missingBox}>{reveal ? a : '?'}</span>
          <span className="text-slate-400">+</span>
          <span className="grid h-14 min-w-14 place-items-center rounded-2xl border-4 border-sky-300 bg-sky-100 px-2 text-sky-700">{b}</span>
          <span className="text-slate-400">=</span>
          <span className="grid h-14 min-w-14 place-items-center rounded-2xl border-4 border-violet-300 bg-violet-100 px-2 text-violet-700">{sum}</span>
        </div>

        {/* Part–whole bar model */}
        <div className={`flex w-full max-w-sm flex-col gap-2 transition-opacity duration-500 ${showBar ? 'opacity-100' : 'opacity-30'}`}>
          {/* Whole */}
          <div className="flex h-12 items-center justify-center rounded-2xl border-4 border-violet-300 bg-violet-100 text-2xl font-black text-violet-700">
            {sum}
          </div>
          {/* Two parts */}
          <div className="flex gap-2">
            <div
              style={{ flex: Math.max(1, a) }}
              className={`flex h-12 min-w-[3rem] items-center justify-center rounded-2xl border-4 text-2xl font-black transition-all ${reveal ? 'border-emerald-400 bg-emerald-100 text-emerald-700' : 'border-amber-300 bg-amber-100 text-amber-700'}`}
            >
              {reveal ? a : '?'}
            </div>
            <div
              style={{ flex: Math.max(1, b) }}
              className={`flex h-12 min-w-[3rem] items-center justify-center rounded-2xl border-4 text-2xl font-black transition-all ${removeKnown ? 'border-rose-300 bg-rose-50 text-rose-400 opacity-50' : 'border-sky-300 bg-sky-100 text-sky-700'}`}
            >
              {b}
            </div>
          </div>
          {/* Part labels */}
          <div className="flex gap-2 px-1 text-xs font-bold text-slate-500">
            <div style={{ flex: Math.max(1, a) }} className="min-w-[3rem] text-center">{T('missing part', 'bagian hilang')}</div>
            <div style={{ flex: Math.max(1, b) }} className="min-w-[3rem] text-center">{T('known part', 'bagian diketahui')}</div>
          </div>
          {/* Inverse arithmetic */}
          <div className={`text-center text-xl font-black transition-opacity duration-300 ${showSolve ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-violet-700">{sum}</span>
            <span className="text-slate-400"> − </span>
            <span className="text-rose-500">{b}</span>
            <span className="text-slate-400"> = </span>
            <span className="text-emerald-700">{a}</span>
          </div>
        </div>

        {/* Step-by-step */}
        <div className="rounded-2xl border border-admin-line bg-admin-card p-4 shadow-admin-soft sm:p-5">
          <ol className="space-y-3 text-left text-sm font-bold text-admin-text">
            {story.steps.map((step, index) => (
              <li key={step.phase} className={`flex gap-3 transition-all ${step.phase === beat.phase ? 'text-admin-accent' : 'text-admin-muted'}`}>
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black ${step.phase === beat.phase ? 'bg-admin-accent text-white' : 'bg-admin-subtle text-admin-muted'}`}>{index + 1}</span>
                <span>{step.caption}</span>
              </li>
            ))}
          </ol>
        </div>
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
