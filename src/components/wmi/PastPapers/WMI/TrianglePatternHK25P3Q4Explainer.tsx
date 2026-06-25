// HKIMO-25-P3H-Q4 — animated explainer.
// Reuses TriPanel + layout constants from the illustration.
// Rule: top = (left + right) × 2.  Answer: 32.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  TriPanel,
  panelX,
  SVG_W,
  SVG_H,
  PANEL_W,
  TRI,
  COLOR,
} from './TrianglePatternHK25P3Q4Illustration'
import { buildTrianglePatternHK25P3Q4Steps } from './trianglePatternHK25P3Q4Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'
const AMBER = '#D97706'

/** Highlight ring around a triangle panel. */
function PanelHighlight({ panelIndex, color }: { panelIndex: number; color: string }) {
  const ox = panelX(panelIndex)
  const pad = 6
  return (
    <rect
      x={ox - pad}
      y={TRI.topY - 18}
      width={PANEL_W + pad * 2}
      height={SVG_H - (TRI.topY - 18) + 2}
      rx={8}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeDasharray="6 3"
    />
  )
}

export default function TrianglePatternHK25P3Q4Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildTrianglePatternHK25P3Q4Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  // On the result beat, override Triangle 3's apex to show "32" in green.
  const tri3Top = isResult ? '32' : '?'
  const tri3TopColor = isResult ? GREEN : COLOR.question

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: atas = (kiri + kanan) × 2; Segitiga 3: (11 + 5) × 2 = 32.'
      : 'Explainer: top = (left + right) × 2; Triangle 3: (11 + 5) × 2 = 32.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(340, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* Triangle 1 */}
          <TriPanel ox={panelX(0)} top="14" left="2" right="5" />
          {/* Triangle 2 */}
          <TriPanel ox={panelX(1)} top="20" left="3" right="7" />
          {/* Triangle 3 — apex updates on result beat */}
          <TriPanel ox={panelX(2)} top={tri3Top} left="11" right="5" topColor={tri3TopColor} />

          {/* animated highlight ring */}
          <AnimatePresence>
            {beat.highlightPanel >= 0 && (
              <motion.g
                key={`hl-${beat.highlightPanel}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <PanelHighlight
                  panelIndex={beat.highlightPanel}
                  color={isResult ? GREEN : AMBER}
                />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation chip */}
        {beat.equation && (
          <div
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 14,
              fontWeight: 700,
              color: isResult ? '#065F46' : BLUE,
              background: isResult ? '#D1FAE5' : '#DBEAFE',
              borderRadius: 6,
              padding: '4px 12px',
            }}
          >
            {beat.equation}
          </div>
        )}

        {/* caption */}
        <div
          style={{
            ...captionStyle,
            borderWidth: 1.5,
            borderStyle: 'solid',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 13,
            lineHeight: 1.5,
            textAlign: 'center',
            maxWidth: 320,
          }}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
