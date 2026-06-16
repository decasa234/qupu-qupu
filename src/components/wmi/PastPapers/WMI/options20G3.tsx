import type { WmiChoice } from '../../../../types/wmi'
import { W_GRIDS, WGrid, MiniTempChart, TEMP_CHARTS, PatternShape } from './scenes20G3Illustrations'

// Choice renderers for WMI-20F3A. Each binds to the option LABEL (A–D),
// matching the printed paper.

/** Q2 — each option is a 5×3 letter grid. */
export function WGridOption20G3({ choice }: { choice: WmiChoice }) {
  const rows = W_GRIDS[choice.label]
  if (!rows) return <span>{choice.text}</span>
  return (
    <span role="img" aria-label={choice.text} style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}>
      <WGrid rows={rows} size={20} />
    </span>
  )
}

/** Q8 — each option is a small line chart. */
export function TempChartOption20G3({ choice }: { choice: WmiChoice }) {
  const values = TEMP_CHARTS[choice.label]
  if (!values) return <span>{choice.text}</span>
  return (
    <span role="img" aria-label={choice.text} style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}>
      <MiniTempChart values={values} badIndex={null} size={132} />
    </span>
  )
}

/** Q14 — each option is a triple of shapes. */
const PATTERN_OPTIONS: Record<string, Array<'c' | 't'>> = {
  A: ['c', 'c', 't'],
  B: ['c', 't', 'c'],
  C: ['c', 'c', 'c'],
  D: ['t', 'c', 'c'],
}
export function PatternOption20G3({ choice }: { choice: WmiChoice }) {
  const shapes = PATTERN_OPTIONS[choice.label]
  if (!shapes) return <span>{choice.text}</span>
  return (
    <span role="img" aria-label={choice.text} style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}>
      <svg viewBox="0 0 110 36" width={110} aria-hidden="true">
        {shapes.map((k, i) => (
          <PatternShape key={i} kind={k} x={20 + i * 35} y={19} size={12} />
        ))}
      </svg>
    </span>
  )
}
