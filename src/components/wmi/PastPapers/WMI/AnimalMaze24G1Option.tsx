import type { WmiChoice } from '../../../../types/wmi'
import { ANIMAL_GLYPH, ANIMAL_NAME_ID, type AnimalKey } from './AnimalMaze24G1Illustration'

// Renders a WMI-24F1A-Q11 answer option as the animal icon it stands for
// (monkey / chick / tiger / dog / lion), reusing the maze's own glyph table so
// the options always match the figure. Binds to the choice LABEL (A–E) — the
// option order is fixed in the source paper, so the drawn animal can't drift.
// Unknown labels fall back to the plain choice text.
export default function AnimalMaze24G1Option({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase()
  const isAnimal = (k: string): k is AnimalKey => k === 'A' || k === 'B' || k === 'C' || k === 'D' || k === 'E'
  if (!isAnimal(label)) return <span>{choice.text}</span>

  return (
    <svg
      viewBox="0 0 56 56"
      width={52}
      height={52}
      style={{ display: 'block' }}
      role="img"
      aria-label={ANIMAL_NAME_ID[label]}
    >
      <circle cx={28} cy={28} r={24} className="fill-qupu-cream stroke-qupu-brand-orange" strokeWidth={2.5} />
      <text x={28} y={29} textAnchor="middle" dominantBaseline="central" fontSize={30}>
        {ANIMAL_GLYPH[label]}
      </text>
    </svg>
  )
}
