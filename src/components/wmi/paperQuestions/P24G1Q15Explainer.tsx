import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { PaperSheet } from './P24G1Q15Illustration'
import { buildP24G1Q15Steps, SHEET_PAGES } from './p24G1Q15Steps'

const GREEN = '#10B981'
const USED_FILL = '#E7E2C4'
const INK = '#3A352B'
const HILITE = '#2f6df0'

const VIEW_W = 520
const VIEW_H = 210

// One mini sheet per beat-state: front/back page numbers, dimmed when used,
// ringed when it is the unused sheet.
function MiniSheet({
  x,
  pages,
  used,
  unused,
  showSum,
  lang,
}: {
  x: number
  pages: [number, number]
  used: boolean
  unused: boolean
  showSum: boolean
  lang: 'en' | 'id'
}) {
  const w = 88
  const h = 116
  const y = 30
  return (
    <g>
      <PaperSheet x={x} y={y} w={w} h={h} />
      {/* recolor face when dimmed/used */}
      {used && !unused && (
        <rect x={x} y={y} width={w} height={h} rx={6} fill={USED_FILL} fillOpacity={0.85} />
      )}
      {/* two page numbers: front (top) and back (bottom) */}
      <text x={x + w / 2} y={y + 38} textAnchor="middle" dominantBaseline="middle" fontSize={26} fontWeight={800} fontFamily="Georgia, serif" fill={INK}>
        {pages[0]}
      </text>
      <line x1={x + 14} y1={y + h / 2} x2={x + w - 14} y2={y + h / 2} stroke={INK} strokeWidth={1.5} strokeDasharray="4 4" opacity={0.5} />
      <text x={x + w / 2} y={y + h - 30} textAnchor="middle" dominantBaseline="middle" fontSize={26} fontWeight={800} fontFamily="Georgia, serif" fill={INK}>
        {pages[1]}
      </text>

      {used && !unused && (
        <text x={x + w / 2} y={y - 8} textAnchor="middle" fontSize={13} fontWeight={800} fill="#9a8f63">
          {lang === 'id' ? 'dipakai' : 'used'}
        </text>
      )}
      {unused && (
        <>
          <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={9} fill="none" stroke={HILITE} strokeWidth={4} />
          <text x={x + w / 2} y={y - 8} textAnchor="middle" fontSize={13} fontWeight={900} fill={HILITE}>
            {lang === 'id' ? 'tak dipakai' : 'unused'}
          </text>
          {showSum && (
            <text x={x + w / 2} y={y + h + 28} textAnchor="middle" fontSize={20} fontWeight={900} fill={GREEN}>
              {`${pages[0]} + ${pages[1]} = ${pages[0] + pages[1]}`}
            </text>
          )}
        </>
      )}
    </g>
  )
}

export default function P24G1Q15Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G1Q15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const firstX = 16
  const gap = 100

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: lembar tak terpakai memuat halaman ${story.unusedPages[0]} dan ${story.unusedPages[1]}, jumlahnya ${story.answerSum}.`
      : `Explainer: the unused sheet holds pages ${story.unusedPages[0]} and ${story.unusedPages[1]}, summing to ${story.answerSum}.`

  return (
    <div className="mx-auto w-full max-w-[540px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {SHEET_PAGES.map((pages, i) => (
            <MiniSheet
              key={i}
              x={firstX + i * gap}
              pages={pages}
              used={beat.usedSheets.includes(i)}
              unused={beat.showUnused && i === 3}
              showSum={beat.showSum}
              lang={lang}
            />
          ))}
        </svg>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
