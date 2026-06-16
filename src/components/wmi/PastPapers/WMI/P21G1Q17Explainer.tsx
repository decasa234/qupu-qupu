import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  FOLD,
  NOTCH,
  PaperOutline,
  Q17_VIEW_H,
  Q17_VIEW_W,
  SHEET,
  paperPath,
} from './P21G1Q17Illustration'
import { buildP21G1Q17Steps } from './p21G1Q17Steps'

// WMI-21P1A-Q17 — post-answer explainer. Reuses the illustration's PaperOutline
// / geometry so the animated sheet is literally the same sheet. It folds the left
// part (everything left of the vertical crease) over the crease; the notch ends
// up covered and the silhouette becomes a clean rectangle = option D.
//
// The fold is driven entirely by the beat's `fold` value (0..1) via an SVG
// transform, so it is deterministic and SSR-safe (no time-based animation, no
// window/document at module top).

const INK = '#1F2937'
const GREEN = '#10B981'
const BLUE = '#30598A'
const FLAP = '#CDE3F5'

export default function P21G1Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G1Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const aria = t(
    'Folding the notched sheet along the upright crease covers the notch, leaving a clean rectangle: shape D.',
    'Melipat kertas bertakik sepanjang garis tegak menutup takiknya, menyisakan persegi panjang utuh: bentuk D.',
  )

  // The left flap reflects across the vertical crease x = FOLD.vx as the fold
  // goes 0 → 1. scaleX from 1 (unfolded) to -1 (fully folded over the crease),
  // about the crease line.
  const sx = 1 - 2 * beat.fold // 1 → -1
  // Reflect about x = FOLD.vx:  x' = vx + sx * (x - vx)  ⇒ translate then scale.
  const flapTransform = `translate(${FOLD.vx} 0) scale(${sx} 1) translate(${-FOLD.vx} 0)`

  // The clean folded rectangle = the RIGHT block, from the crease to the right
  // edge, full height (the folded silhouette).
  const rectX = FOLD.vx
  const rectW = SHEET.x0 + SHEET.w - FOLD.vx

  // Notch outline (for the "show the notch" highlight).
  const notchPath = `M ${SHEET.x0} ${NOTCH.yTop} H ${SHEET.x0 + NOTCH.depth} V ${NOTCH.yBot} H ${SHEET.x0}`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${Q17_VIEW_W} ${Q17_VIEW_H}`}
          width="100%"
          style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {beat.showResult ? (
            // The folded result: a clean rectangle (the right block) — option D.
            <g>
              <rect
                x={rectX}
                y={SHEET.y0}
                width={rectW}
                height={SHEET.h}
                fill={beat.result ? 'rgba(16,185,129,0.12)' : '#FFFFFF'}
                stroke={beat.result ? GREEN : INK}
                strokeWidth={2.6}
                strokeLinejoin="round"
              />
              {beat.showOption && (
                <g>
                  <circle cx={rectX + rectW / 2} cy={SHEET.y0 + SHEET.h / 2} r={20} fill="#D1FAE5" stroke={GREEN} strokeWidth={2.6} />
                  <text
                    x={rectX + rectW / 2}
                    y={SHEET.y0 + SHEET.h / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={20}
                    fontWeight={900}
                    fill="#065F46"
                    className="font-display"
                  >
                    D
                  </text>
                </g>
              )}
            </g>
          ) : (
            <g>
              {/* The full sheet (with folds while not yet folded). When folding,
                  the right part stays put and the left part is drawn as a moving
                  flap reflected across the crease. */}
              {beat.fold === 0 ? (
                <PaperOutline showFolds={beat.showFolds} />
              ) : (
                <g>
                  {/* right (fixed) part: clip the sheet to the right of the crease */}
                  <clipPath id="q17-right">
                    <rect x={FOLD.vx} y={SHEET.y0 - 10} width={SHEET.w} height={SHEET.h + 20} />
                  </clipPath>
                  <path d={paperPath()} fill="#FFFFFF" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" clipPath="url(#q17-right)" />

                  {/* left flap: clip the sheet to the left of the crease, then
                      reflect it across the crease to show it folding over. */}
                  <clipPath id="q17-left">
                    <rect x={SHEET.x0 - 10} y={SHEET.y0 - 10} width={FOLD.vx - (SHEET.x0 - 10)} height={SHEET.h + 20} />
                  </clipPath>
                  <g transform={flapTransform}>
                    <path
                      d={paperPath()}
                      fill={beat.fold >= 1 ? FLAP : '#FFFFFF'}
                      fillOpacity={beat.fold >= 1 ? 0.85 : 1}
                      stroke={INK}
                      strokeWidth={2.4}
                      strokeLinejoin="round"
                      clipPath="url(#q17-left)"
                    />
                  </g>

                  {/* the crease itself stays visible during the fold */}
                  <line x1={FOLD.vx} y1={SHEET.y0 - 6} x2={FOLD.vx} y2={SHEET.y0 + SHEET.h + 6} stroke={BLUE} strokeWidth={1.8} strokeDasharray="5 5" strokeLinecap="round" />
                </g>
              )}

              {/* notch highlight */}
              {beat.showNotch && beat.fold === 0 && (
                <path d={notchPath} fill="none" stroke="#E0A82E" strokeWidth={3} strokeLinejoin="round" />
              )}
            </g>
          )}
        </svg>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
