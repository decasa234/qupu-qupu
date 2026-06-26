// SASMO-20-G3-Q3 — animated explainer for the face-matrix pattern question.
//
// Animation flow:
//   0. Intro — show the full 3×3 grid.
//   1. Mouth-rule — highlight all 8 known cells; caption explains Latin square.
//   2. Mouth-id — highlight bottom row; identifies ? mouth = smile.
//   3. Hair-rule — highlight all cells grouped by column; caption explains direction rule.
//   4. Hair-id — highlight col 2; identifies ? hair = 1 stroke right.
//   5. Result — highlight ? cell + spotlight option C as the answer.
//
// Reuses FaceParts geometry from FacePatternSASMO20G3Q3Illustration.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  OPTION_FACES,
  STEM_FACES,
} from './FacePatternSASMO20G3Q3Illustration'
import type { FaceSpec, Mouth, HairDir } from './FacePatternSASMO20G3Q3Illustration'
import { buildFacePatternSASMO20G3Q3Steps } from './facePatternSASMO20G3Q3Steps'

// ---------------------------------------------------------------------------
// Internal face renderer (mirrors Illustration's FaceParts but also accepts highlight)
// ---------------------------------------------------------------------------

const INK       = '#111827'
const FACE_FILL = '#FFFFFF'
const HIGHLIGHT = '#FCD34D'   // amber ring
const ANSWER_G  = '#10B981'   // green for answer cell
const R         = 36
const EYE_R     = 3.5
const EYE_DX    = 12
const EYE_DY    = 11

function FaceParts({ mouth, hair, hairDir }: FaceSpec) {
  const hairStrokes: Array<[number, number, number, number]> = []
  if (hair > 0 && hairDir !== 'none') {
    const spacing = 5
    for (let i = 0; i < hair; i++) {
      const xBase = (i - (hair - 1) / 2) * spacing
      const yBase = -R + 2
      let xEnd: number, yEnd: number
      if (hairDir === 'up') {
        xEnd = xBase;      yEnd = yBase - 16
      } else if (hairDir === 'left') {
        xEnd = xBase - 12; yEnd = yBase - 12
      } else {
        xEnd = xBase + 12; yEnd = yBase - 12
      }
      hairStrokes.push([xBase, yBase, xEnd, yEnd])
    }
  }

  let mouthD: string
  if (mouth === 'smile')      mouthD = 'M -14,16 Q 0,27 14,16'
  else if (mouth === 'frown') mouthD = 'M -14,24 Q 0,14 14,24'
  else                        mouthD = 'M -14,20 L 14,20'

  return (
    <>
      <circle cx={0} cy={0} r={R} fill={FACE_FILL} stroke={INK} strokeWidth={2} />
      {hairStrokes.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      ))}
      <circle cx={-EYE_DX} cy={-EYE_DY} r={EYE_R} fill={INK} />
      <circle cx={ EYE_DX} cy={-EYE_DY} r={EYE_R} fill={INK} />
      <line x1={0} y1={-1} x2={0} y2={9} stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <path d={mouthD} stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
    </>
  )
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const CELL = 90
const PAD  = 4
const GRID_W = CELL * 3 + PAD * 2
const GRID_H = CELL * 3 + PAD * 2
const OPT_SIZE = 72

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'] as const

// The answer face for the "?" cell (revealed on result beat)
const ANSWER_FACE: FaceSpec = { mouth: 'smile', hair: 1, hairDir: 'right' }

// ---------------------------------------------------------------------------
// Explainer component
// ---------------------------------------------------------------------------

export default function FacePatternSASMO20G3Q3Explainer({
  lang = 'id',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const storyboard = useMemo(
    () => buildFacePatternSASMO20G3Q3Steps(lang === 'en' ? 'en' : 'id'),
    [lang],
  )

  const beat = useBeatControl(storyboard.finalIndex, {
    step, playing, onStepCount, onStepChange, onPlayEnd,
  })

  const current = storyboard.steps[beat] ?? storyboard.steps[0]
  const highlightSet = new Set(current.highlight)
  const isResult = current.result

  return (
    <div className="flex flex-col items-center gap-4 py-2">

      {/* 3×3 grid */}
      <svg
        viewBox={`0 0 ${GRID_W} ${GRID_H}`}
        width={GRID_W}
        height={GRID_H}
        aria-hidden="true"
        style={{ display: 'block', maxWidth: '100%' }}
      >
        {STEM_FACES.map((spec, idx) => {
          const col = idx % 3
          const row = Math.floor(idx / 3)
          const tx = PAD + col * CELL
          const ty = PAD + row * CELL
          const isQ = spec === null
          const highlighted = highlightSet.has(idx)
          const isAnswer = isResult && isQ

          const bgFill = highlighted ? '#FEF3C7' : isAnswer ? '#D1FAE5' : '#F9FAFB'
          const ringColor = isAnswer ? ANSWER_G : highlighted ? HIGHLIGHT : INK
          const ringW = (highlighted || isAnswer) ? 2.5 : 1.5

          const faceSpec = isAnswer ? ANSWER_FACE : (spec ?? null)

          return (
            <g key={idx} transform={`translate(${tx}, ${ty})`}>
              <rect x={0} y={0} width={CELL} height={CELL} fill={bgFill} stroke={ringColor} strokeWidth={ringW} />
              {isQ && !isAnswer ? (
                <text
                  x={CELL / 2} y={CELL / 2 + 14}
                  textAnchor="middle"
                  fontSize={48}
                  fontWeight="bold"
                  fill={INK}
                  fontFamily="serif"
                >
                  ?
                </text>
              ) : faceSpec ? (
                <g transform={`translate(${CELL / 2}, ${CELL / 2})`}>
                  <FaceParts {...faceSpec} />
                </g>
              ) : null}
            </g>
          )
        })}
      </svg>

      {/* Options row (always visible; highlight chosen on result) */}
      <div className="flex gap-3 flex-wrap justify-center" aria-hidden="true">
        {OPTION_LABELS.map((label) => {
          const spec  = OPTION_FACES[label]
          const isSpot = current.spotOption === label
          const borderColor = isSpot ? ANSWER_G : '#D1D5DB'
          const borderW = isSpot ? 3 : 1.5

          return (
            <div
              key={label}
              style={{
                border: `${borderW}px solid ${borderColor}`,
                borderRadius: 8,
                background: isSpot ? '#D1FAE5' : '#F9FAFB',
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <svg
                viewBox={`${-OPT_SIZE / 2} ${-OPT_SIZE / 2} ${OPT_SIZE} ${OPT_SIZE}`}
                width={OPT_SIZE}
                height={OPT_SIZE}
                aria-hidden="true"
                style={{ display: 'block' }}
              >
                <FaceParts {...spec} />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{label}</span>
            </div>
          )
        })}
      </div>

      {/* Caption */}
      <p
        className="text-sm text-center text-gray-700 max-w-xs px-2"
        aria-live="polite"
      >
        {current.caption}
      </p>
    </div>
  )
}
