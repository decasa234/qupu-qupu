import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CardsRow23G2, CARDS23G2 } from './Cards23G2Illustration'

// WMI-23F2A-Q2 — "Which 2 cards have a difference closest to 150?"
// Cards: 521, 214, 79, 244, 383, 407.
// Strategy: compute |diff − 150| for each answer-choice pair; smallest gap wins.
// Answer: A → |383 − 244| = 139, off by 11 — closest.

const BLUE = '#30598A'
const GREEN = '#10B981'
const AMBER = '#D97706'
const RED_DIM = '#9CA3AF'

// Each candidate option
interface Candidate {
  label: string
  a: number
  b: number
  diff: number
  gap: number // |diff - 150|
  result: boolean
  hold: number
}

const CANDIDATES: Candidate[] = [
  { label: 'A', a: 244, b: 383, diff: 139, gap: 11, result: true,  hold: 0    },
  { label: 'B', a: 521, b: 407, diff: 114, gap: 36, result: false, hold: 2100 },
  { label: 'C', a: 383, b: 214, diff: 169, gap: 19, result: false, hold: 2100 },
  { label: 'D', a: 79,  b: 214, diff: 135, gap: 15, result: false, hold: 2100 },
  { label: 'E', a: 244, b: 407, diff: 163, gap: 13, result: false, hold: 2100 },
]

interface Beat {
  highlighted: Set<number>
  caption: { en: string; id: string }
  result: boolean
  hold: number
}

function buildBeats(lang: 'en' | 'id'): Beat[] {
  void lang // beats are built language-agnostic; lang is used at render time
  const beats: Beat[] = []

  // Intro beat
  beats.push({
    highlighted: new Set<number>(),
    caption: {
      en: 'Find the pair whose difference is nearest 150. Try each option!',
      id: 'Cari pasangan yang selisihnya paling dekat 150. Coba satu per satu!',
    },
    result: false,
    hold: 2600,
  })

  // One beat per candidate (A first = answer, shown last in sequence below)
  // Order: B, C, D, E (rejected), then A (winner)
  const order = ['B', 'C', 'D', 'E', 'A']
  for (const lbl of order) {
    const c = CANDIDATES.find((x) => x.label === lbl)!
    const larger = Math.max(c.a, c.b)
    const smaller = Math.min(c.a, c.b)
    beats.push({
      highlighted: new Set([c.a, c.b]),
      caption: {
        en: c.result
          ? `Option A: ${larger} − ${smaller} = ${c.diff}. Off by only ${c.gap} — closest! Answer: A`
          : `Option ${c.label}: ${larger} − ${smaller} = ${c.diff}. Off by ${c.gap}. ✗ Not the closest.`,
        id: c.result
          ? `Pilihan A: ${larger} − ${smaller} = ${c.diff}. Hanya selisih ${c.gap} dari 150 — terdekat! Jawaban: A`
          : `Pilihan ${c.label}: ${larger} − ${smaller} = ${c.diff}. Selisih ${c.gap} dari 150. ✗ Bukan yang terdekat.`,
      },
      result: c.result,
      hold: c.hold,
    })
  }

  return beats
}

// Gap bar: a small visual showing how far the diff is from 150
function GapBar({ diff, gap, result }: { diff: number; gap: number; result: boolean }) {
  // Bar from 0..200, target at 150
  const W = 200
  const H = 28
  const scale = W / 200
  const diffX = diff * scale
  const targetX = 150 * scale

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true" style={{ display: 'block' }}>
      {/* track */}
      <rect x={0} y={H / 2 - 3} width={W} height={6} rx={3} fill="#E5E7EB" />
      {/* diff marker */}
      <rect
        x={Math.min(diffX, targetX)}
        y={H / 2 - 3}
        width={Math.abs(diffX - targetX)}
        height={6}
        fill={result ? '#10B981' : '#FCA5A5'}
      />
      {/* target line at 150 */}
      <line x1={targetX} y1={4} x2={targetX} y2={H - 4} stroke={AMBER} strokeWidth={2.5} />
      <text x={targetX} y={H - 1} textAnchor="middle" fontSize={8} fill={AMBER} fontWeight={700}>
        150
      </text>
      {/* diff marker dot */}
      <circle cx={diffX} cy={H / 2} r={5} fill={result ? GREEN : RED_DIM} />
      <text x={diffX} y={H / 2 - 7} textAnchor="middle" fontSize={8} fill={result ? '#065F46' : '#6B7280'} fontWeight={700}>
        {diff}
      </text>
      {/* gap label */}
      {gap > 0 && (
        <text
          x={(Math.min(diffX, targetX) + Math.max(diffX, targetX)) / 2}
          y={H / 2 + 13}
          textAnchor="middle"
          fontSize={8}
          fill={result ? '#065F46' : '#EF4444'}
          fontWeight={700}
        >
          off {gap}
        </text>
      )}
    </svg>
  )
}

export default function Cards23G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const beats = useMemo(() => buildBeats(lang), [lang])
  const index = useBeatControl(beats.length - 1, {
    ...props,
    holds: beats.map((b) => b.hold),
  })
  const beat = beats[index] ?? beats[beats.length - 1]

  // Find which candidate is currently highlighted (if any)
  const activeCand = CANDIDATES.find(
    (c) => beat.highlighted.has(c.a) && beat.highlighted.has(c.b),
  ) ?? null

  return (
    <div
      className="mx-auto w-full max-w-[480px]"
      role="img"
      aria-label={t(
        'Strategy: subtract each pair and find the difference nearest 150. Answer A: 383 minus 244 equals 139, off by only 11.',
        'Strategi: kurangkan setiap pasangan, cari yang paling dekat 150. Jawaban A: 383 dikurang 244 sama dengan 139, selisih hanya 11.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Cards row */}
        <div className="w-full rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <CardsRow23G2 cards={CARDS23G2} highlighted={beat.highlighted} />
        </div>

        {/* Gap bar + math line (only when a candidate is active) */}
        {activeCand && (
          <div className="flex w-full flex-col items-center gap-1 rounded-lg bg-slate-50 px-4 py-2">
            <div
              className="font-display text-sm font-bold"
              style={{ color: activeCand.result ? '#065F46' : BLUE }}
            >
              {t(
                `${Math.max(activeCand.a, activeCand.b)} − ${Math.min(activeCand.a, activeCand.b)} = ${activeCand.diff}`,
                `${Math.max(activeCand.a, activeCand.b)} − ${Math.min(activeCand.a, activeCand.b)} = ${activeCand.diff}`,
              )}
            </div>
            <GapBar diff={activeCand.diff} gap={activeCand.gap} result={activeCand.result} />
          </div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {t(beat.caption.en, beat.caption.id)}
        </div>
      </div>
    </div>
  )
}
