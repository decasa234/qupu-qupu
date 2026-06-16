import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'

// Kid-concept visuals for the "shared factor" questions of WMI-19F3A:
//   Q10: 26×4 + 54×4 + 10×4 — boxes of 4 POUR TOGETHER into 90 boxes of 4.
//   Q16: 34×45 − 45×23 — 34 boxes of 45, TAKE AWAY 23 boxes, 11 remain.
// The bars are drawn to scale, so the grouping idea is visible, not abstract.

const GREEN = '#10B981'
const BLUE = '#2563EB'
const PURPLE = '#7C3AED'
const AMBER = '#D97706'
const RED = '#DC2626'
const INK = '#1F2937'
const VIEW_W = 380
const BAR_H = 34

function Section({ x, w, label, sub, color, fill, crossed = false }: { x: number; w: number; label: string; sub: string; color: string; fill: string; crossed?: boolean }) {
  return (
    <g opacity={crossed ? 0.45 : 1}>
      <rect x={x} y={0} width={w} height={BAR_H} rx={6} fill={fill} stroke={color} strokeWidth={2.5} />
      <text x={x + w / 2} y={BAR_H / 2 - 1} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill={color} className="font-display">
        {label}
      </text>
      <text x={x + w / 2} y={BAR_H + 13} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#64748B">
        {sub}
      </text>
      {crossed && <line x1={x + 4} y1={BAR_H - 4} x2={x + w - 4} y2={4} stroke={RED} strokeWidth={2.5} strokeLinecap="round" />}
    </g>
  )
}

/** Q10 — three piles of "boxes of 4" pour together. */
export function SharedFourVisualG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { merged: false, total: false, hold: 2600, result: false, caption: t('26 boxes of 4, then 54 boxes of 4, then 10 boxes of 4 — EVERY pile is boxes of 4.', '26 kotak isi 4, lalu 54 kotak isi 4, lalu 10 kotak isi 4 — SEMUA tumpukan berisi kotak isi 4.') },
      { merged: true, total: false, hold: 2600, result: false, caption: t('Pour the piles together: 26 + 54 + 10 = 90 boxes — every box still holds 4.', 'Tuangkan semua jadi satu: 26 + 54 + 10 = 90 kotak — tiap kotak tetap isi 4.') },
      { merged: true, total: true, hold: 2400, result: false, caption: t('90 boxes of 4 things: 90 × 4 = 360.', '90 kotak isi 4: 90 × 4 = 360.') },
      { merged: true, total: true, hold: 0, result: true, caption: t('So 26 × 4 + 54 × 4 + 10 × 4 = (26 + 54 + 10) × 4 = 360 (A).', 'Jadi 26 × 4 + 54 × 4 + 10 × 4 = (26 + 54 + 10) × 4 = 360 (A).') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const SCALE = 3.4
  const GAP = 10
  const x0 = (VIEW_W - (90 * SCALE + 2 * GAP)) / 2
  const aria = t('Twenty-six plus fifty-four plus ten boxes of four make ninety boxes, which is 360.', 'Dua puluh enam plus lima puluh empat plus sepuluh kotak isi empat menjadi sembilan puluh kotak, yaitu 360.')

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} 110`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
          <g transform="translate(0, 14)">
            {!beat.merged ? (
              <>
                <Section x={x0} w={26 * SCALE} label="26" sub={t('boxes of 4', 'kotak isi 4')} color={BLUE} fill="#DBEAFE" />
                <Section x={x0 + 26 * SCALE + GAP} w={54 * SCALE} label="54" sub={t('boxes of 4', 'kotak isi 4')} color={PURPLE} fill="#EDE9FE" />
                <Section x={x0 + 80 * SCALE + 2 * GAP} w={10 * SCALE} label="10" sub={t('boxes of 4', 'kotak isi 4')} color={AMBER} fill="#FEF3C7" />
              </>
            ) : (
              <>
                <Section x={x0} w={90 * SCALE + 2 * GAP} label={beat.total ? '90 × 4 = 360' : '26 + 54 + 10 = 90'} sub={t('boxes of 4', 'kotak isi 4')} color={beat.total ? GREEN : INK} fill={beat.total ? '#D1FAE5' : '#F1F5F9'} />
              </>
            )}
          </g>
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

/** Q16 — 34 boxes of 45, take away 23 boxes, 11 remain. */
export function SharedFortyFiveVisualG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { split: false, kept: false, total: false, hold: 2400, result: false, caption: t('34 × 45 means 34 boxes, each holding 45.', '34 × 45 artinya 34 kotak, masing-masing isi 45.') },
      { split: true, kept: false, total: false, hold: 2600, result: false, caption: t('− 45 × 23 means TAKE AWAY 23 of those boxes of 45.', '− 45 × 23 artinya AMBIL 23 kotak isi 45 itu.') },
      { split: true, kept: true, total: false, hold: 2400, result: false, caption: t('Left over: 34 − 23 = 11 boxes of 45.', 'Tersisa: 34 − 23 = 11 kotak isi 45.') },
      { split: true, kept: true, total: true, hold: 2300, result: false, caption: t('11 boxes of 45: 45 × 11 = 495.', '11 kotak isi 45: 45 × 11 = 495.') },
      { split: true, kept: true, total: true, hold: 0, result: true, caption: t('So 34 × 45 − 45 × 23 = 45 × (34 − 23) = 495.', 'Jadi 34 × 45 − 45 × 23 = 45 × (34 − 23) = 495.') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const SCALE = 9.4
  const x0 = (VIEW_W - 34 * SCALE) / 2
  const aria = t('Thirty-four boxes of forty-five minus twenty-three boxes leaves eleven boxes: 495.', 'Tiga puluh empat kotak isi empat puluh lima dikurangi dua puluh tiga kotak menyisakan sebelas kotak: 495.')

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} 110`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
          <g transform="translate(0, 14)">
            {!beat.split ? (
              <Section x={x0} w={34 * SCALE} label="34" sub={t('boxes of 45', 'kotak isi 45')} color={BLUE} fill="#DBEAFE" />
            ) : (
              <>
                <Section x={x0} w={23 * SCALE} label="23" sub={t('taken away', 'diambil')} color={RED} fill="#FEE2E2" crossed />
                <Section
                  x={x0 + 23 * SCALE + 6}
                  w={11 * SCALE}
                  label={beat.total ? '45 × 11' : '11'}
                  sub={beat.total ? '= 495' : t('boxes of 45 left', 'kotak isi 45 tersisa')}
                  color={beat.kept ? GREEN : INK}
                  fill={beat.kept ? '#D1FAE5' : '#F1F5F9'}
                />
              </>
            )}
          </g>
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
