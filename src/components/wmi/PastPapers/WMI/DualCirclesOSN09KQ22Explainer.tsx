// OSN-09-SD-KAB-Q22 — Two congruent circles, animated explainer.
//
// Three beats:
//   1. State circle dimensions (r = 10 cm, full circle area = 314 cm²).
//   2. Highlight the shaded region and recognise it = half a circle.
//   3. Show the final calculation: 314 ÷ 2 = 157 cm².

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DualCirclesOSN09KQ22Primitive } from './DualCirclesOSN09KQ22Illustration'
import { buildDualCirclesOSN09KQ22Steps } from './dualCirclesOSN09KQ22Steps'

const BLUE   = '#30598A'
const ORANGE = '#EA580C'
const GREEN  = '#059669'

const HOLDS = [2000, 2200, 0]

const W = 280
const H = 200

export default function DualCirclesOSN09KQ22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo(() => buildDualCirclesOSN09KQ22Steps(lang), [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: HOLDS })
  const beat = steps[index] ?? steps[steps.length - 1]

  const ariaLabel = t(
    'Each circle has diameter 20 cm. Radius = 10 cm. Area of one circle = 314 cm². Shaded region = half of one circle = 157 cm².',
    'Setiap lingkaran berdiameter 20 cm. Jari-jari = 10 cm. Luas satu lingkaran = 314 cm². Luas arsiran = setengah lingkaran = 157 cm².',
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Figure — primitive with animated highlight */}
        <motion.div
          key={`fig-${beat.beat}`}
          initial={{ opacity: 0.7, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="w-full"
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
            <DualCirclesOSN09KQ22Primitive
              shadeFill={beat.highlightShade ? '#FED7AA' : 'url(#osn09kq22-hatch)'}
              shadeOpacity={beat.highlightShade ? 0.85 : 1}
            />

            {/* Area annotation on the final beat */}
            <AnimatePresence>
              {beat.showArea && (
                <motion.g
                  key="area-label"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <rect x="160" y="42" width="96" height="28" rx="6" fill="#D1FAE5" stroke={GREEN} strokeWidth="1.5" />
                  <text x="208" y="61" textAnchor="middle" fontSize="13" fontWeight="800" fill="#065F46" fontFamily="sans-serif">
                    157 cm²
                  </text>
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </motion.div>

        {/* Caption */}
        <div
          className="min-h-[3rem] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.isResult
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.highlightShade
              ? { background: '#FFF7ED', borderColor: ORANGE, color: '#9A3412' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {lang === 'id' ? beat.caption.id : beat.caption.en}
        </div>
      </div>
    </div>
  )
}
