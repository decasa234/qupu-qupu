/**
 * FlowchartOSN08KQ22Illustration — OSN-08-SD-KAB-Q22
 *
 * "Nilai x yang memenuhi operasi skematik berikut adalah …"
 * x → Dikali 4 → Ditambah 4 → Dibagi 5 → 12
 * Answer: 14  (work backwards: 12×5=60; 60−4=56; 56÷4=14)
 *
 * Source: docs/reference/ocr-res/osn/kabupaten/sd/2008.imgs/016.jpg
 * Fresh SVG — no primitive matches a linear function-machine flowchart.
 */

import React from 'react'

// ─── Layout constants ─────────────────────────────────────────────────────────
export const CX_X   = 36
export const CX_OUT = 514
export const CY     = 40
export const R      = 30

// Boxes: [label, x, y, w, h]
export const BOXES: Array<{ label: string; x: number; y: number; w: number; h: number }> = [
  { label: 'Dikali 4',   x: 100, y: 13, w: 90,  h: 54 },
  { label: 'Ditambah 4', x: 224, y: 13, w: 100, h: 54 },
  { label: 'Dibagi 5',   x: 358, y: 13, w: 90,  h: 54 },
]

// ─── Arrow component ──────────────────────────────────────────────────────────
function Arrow({ x1, x2 }: { x1: number; x2: number }) {
  const tipX = x2
  const headStart = tipX - 10
  return (
    <g>
      <line
        x1={x1} y1={CY}
        x2={headStart} y2={CY}
        stroke="#1F2937"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <polygon
        points={`${headStart - 1},${CY - 6} ${tipX},${CY} ${headStart - 1},${CY + 6}`}
        fill="#1F2937"
      />
    </g>
  )
}

// ─── Shared scene (reused by Explainer) ──────────────────────────────────────
export interface FlowchartSceneProps {
  /** Box indices (0,1,2) to highlight in amber */
  highlightBoxes?: number[]
  /** Highlight the x-circle */
  highlightX?: boolean
  /** Override label inside x-circle (e.g. '14' on result beat) */
  xLabel?: string
  /** Highlight the output "12" circle */
  highlightOutput?: boolean
}

export function FlowchartScene({
  highlightBoxes = [],
  highlightX = false,
  xLabel,
  highlightOutput = false,
}: FlowchartSceneProps) {
  const AMBER_FILL   = '#FEF08A'
  const AMBER_STROKE = '#CA8A04'
  const AMBER_TEXT   = '#92400E'
  const BASE_FILL    = '#E0F2FE'
  const BASE_STROKE  = '#1F2937'

  return (
    <svg
      viewBox="0 0 560 80"
      width="100%"
      style={{ display: 'block', maxWidth: 560, margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* x circle */}
      <circle
        cx={CX_X} cy={CY} r={R}
        fill={highlightX ? AMBER_FILL : BASE_FILL}
        stroke={highlightX ? AMBER_STROKE : BASE_STROKE}
        strokeWidth={highlightX ? 2.5 : 2}
      />
      <text
        x={CX_X} y={CY + 6}
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fontSize={xLabel ? 16 : 20}
        fontWeight={700}
        fill={highlightX ? AMBER_TEXT : '#1F2937'}
      >
        {xLabel ?? 'x'}
      </text>

      {/* Arrow: x-circle → box 0 */}
      <Arrow x1={CX_X + R} x2={BOXES[0].x} />

      {/* Three operation boxes */}
      {BOXES.map((box, i) => {
        const isHl = highlightBoxes.includes(i)
        return (
          <g key={box.label}>
            <rect
              x={box.x} y={box.y}
              width={box.w} height={box.h}
              rx={6}
              fill={isHl ? AMBER_FILL : '#F1F5F9'}
              stroke={isHl ? AMBER_STROKE : '#334155'}
              strokeWidth={isHl ? 2.5 : 1.8}
            />
            <text
              x={box.x + box.w / 2}
              y={box.y + box.h / 2 + 5}
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
              fontSize={13}
              fontWeight={700}
              fill={isHl ? AMBER_TEXT : '#1E293B'}
            >
              {box.label}
            </text>

            {/* Arrow to next box (or to output circle for last box) */}
            {i < BOXES.length - 1 ? (
              <Arrow x1={box.x + box.w} x2={BOXES[i + 1].x} />
            ) : (
              <Arrow x1={box.x + box.w} x2={CX_OUT - R} />
            )}
          </g>
        )
      })}

      {/* Output circle "12" */}
      <circle
        cx={CX_OUT} cy={CY} r={R}
        fill={highlightOutput ? AMBER_FILL : BASE_FILL}
        stroke={highlightOutput ? AMBER_STROKE : BASE_STROKE}
        strokeWidth={highlightOutput ? 2.5 : 2}
      />
      <text
        x={CX_OUT} y={CY + 6}
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontSize={18}
        fontWeight={700}
        fill={highlightOutput ? AMBER_TEXT : '#1F2937'}
      >
        12
      </text>
    </svg>
  )
}

// ─── Default export: stem illustration (shows problem, not answer) ────────────
export default function FlowchartOSN08KQ22Illustration() {
  return (
    <div
      className="my-4 overflow-x-auto rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Operasi skematik: x dikali 4, ditambah 4, dibagi 5, hasilnya 12. Cari nilai x.'
      }
    >
      <FlowchartScene />
    </div>
  )
}
