import { GridBoard } from '../../PastPapers/WMI/primitives/GridBoard'
import {
  TriLattice,
  triLatticeViewBox,
  triPolygonPoints,
} from '../../PastPapers/WMI/primitives/TriLattice'
import {
  readGridShadedParams,
  type GridFigureView,
  type GridShadedView,
} from '../explainers/gridShadedAreaCountSteps'

// In-card figure for `grid-shaded-area-count`: grid paper with the shaded
// region laid on top of it. The grid comes from the shared `GridBoard` (square)
// and `TriLattice` (triangle) primitives; the region is one `<polygon>` drawn
// straight from the params vertex list, in the same coordinate space as the
// grid. So the picture and the answer are measuring the same outline — there is
// no second copy of the geometry to drift.
//
// Pure render from params: no hooks, no randomness, no dates — SSR-safe.

const INK = '#30598A' // qupu-brand-blue
const PEACH = '#FFD3B1'
const MUTED = '#B9C0CC'
const CREAM = '#FFF9F4'
const LINE = '#D7DEE8'

const PAD = 4

function ShapeSvg({
  view,
  figure,
  cell,
}: {
  view: GridShadedView
  figure: GridFigureView
  cell: number
}) {
  if (view.lattice === 'triangle') {
    return (
      <svg
        viewBox={triLatticeViewBox(figure.triCells, cell, PAD)}
        width={figure.cols * cell + PAD * 2}
        aria-hidden="true"
        style={{ display: 'block', maxWidth: '100%' }}
      >
        <TriLattice
          cells={figure.triCells}
          size={cell}
          gridStroke={LINE}
          fill={() => CREAM}
        />
        <polygon
          points={triPolygonPoints(figure.verts, cell)}
          fill={PEACH}
          stroke={INK}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  const x0 = figure.originA * cell
  const y0 = figure.originB * cell
  return (
    <svg
      viewBox={`${x0 - PAD} ${y0 - PAD} ${figure.cols * cell + PAD * 2} ${figure.rows * cell + PAD * 2}`}
      width={figure.cols * cell + PAD * 2}
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <g transform={`translate(${x0} ${y0})`}>
        <GridBoard
          rows={figure.rows}
          cols={figure.cols}
          cellSize={cell}
          gridStroke={LINE}
          fill={() => CREAM}
        />
      </g>
      <polygon
        points={figure.verts.map(([x, y]) => `${x * cell},${y * cell}`).join(' ')}
        fill={PEACH}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Speaks the drawn evidence and nothing else: how big the grid paper is, how
 * many shaded shapes there are, and whether any of them has a slanting edge.
 * Never a count of cells, and never an area — those are the question.
 */
function aria(view: GridShadedView): string {
  const paper = view.lattice === 'square' ? 'kertas berpetak kotak' : 'kertas berpetak segitiga'
  const slant = view.anyHalves
    ? ' Ada sisi miring yang memotong beberapa petak di tepinya dari sudut ke sudut.'
    : ''
  if (view.ask === 'area') {
    const f = view.figures[0]
    return `Sebuah daerah berwarna digambar pada ${paper} berukuran ${f.cols} kali ${f.rows} petak.${slant}`
  }
  const labels = view.options.map((o) => o.label).join(', ')
  if (view.ask === 'which-largest') {
    return `Tiga daerah berwarna, ${labels}, digambar berdampingan pada ${paper} yang sama.${slant}`
  }
  return `Satu daerah berwarna sebagai contoh dan tiga daerah berwarna lain, ${labels}, digambar berdampingan pada ${paper} yang sama.${slant}`
}

export default function GridShadedAreaCountIllustration({ params }: { params: unknown }) {
  const view = readGridShadedParams(params)
  // One shape gets room to breathe; a comparison has to fit four of them across.
  const cell = view.ask === 'area' ? 30 : view.figures.length > 3 ? 20 : 24

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={aria(view)}>
      <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-5">
        {view.figures.map((figure, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <ShapeSvg view={view} figure={figure} cell={cell} />
            {view.ask !== 'area' && (
              <span
                className="font-display text-sm font-extrabold"
                style={{ color: figure.isExample ? MUTED : INK }}
              >
                {figure.isExample ? 'Contoh' : figure.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
