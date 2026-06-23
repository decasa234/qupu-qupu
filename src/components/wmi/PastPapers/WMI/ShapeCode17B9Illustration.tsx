// SEAMO-17-B-Q9 — "What number does AB represent?"
//
// Each figure = outer shape + inner shape.  Shape type encodes the digit:
//   triangle → 1  |  circle → 2  |  square → 3
//
// Colour is decorative — it identifies which example is which but does NOT
// change the numeric digit.
//
// Given examples (image crops 013–017):
//   013: green triangle / yellow triangle  = 11
//   014: grey circle    / green square     = 23
//   015: green square   / red triangle     = 31
//   016: yellow square  / purple square    = 33
//   017: blue triangle  / peach circle     = 12
//   018: purple square  / yellow circle    = AB  ← answer is D = 32
//
// Pure SVG, SSR-safe, no hooks, no framer-motion.

// ---------------------------------------------------------------------------
// Colour palette (per image-crop visual inspection)
// ---------------------------------------------------------------------------
const CLR = {
  greenTriOuter:   '#3CB944',
  yellowTriInner:  '#F5E642',
  greyCirOuter:    '#B8B8B8',
  greenSqInner:    '#3CB944',
  greenSqOuter:    '#3CB944',
  redTriInner:     '#E03030',
  yellowSqOuter:   '#F5E642',
  purpleSqInner:   '#9B59B6',
  blueTriOuter:    '#3B9DE8',
  peachCirInner:   '#F4C89A',
  purpleSqOuter:   '#9B59B6',
  yellowCirInner:  '#F5E642',
  black:           '#1A1A1A',
}

// ---------------------------------------------------------------------------
// Shape primitives — all in 100×100 viewBox, centred at (50, 50)
// ---------------------------------------------------------------------------

function Triangle({ hw, fill }: { hw: number; fill: string }) {
  // Equilateral-ish triangle centred at (50, 50) with half-width hw
  const top  = 50 - hw
  const bot  = 50 + hw * 0.75
  const left = 50 - hw
  const right= 50 + hw
  return (
    <polygon
      points={`50,${top} ${right},${bot} ${left},${bot}`}
      fill={fill}
      stroke={CLR.black}
      strokeWidth={2.5}
      strokeLinejoin="round"
    />
  )
}

function Circle({ r, fill }: { r: number; fill: string }) {
  return (
    <circle
      cx={50}
      cy={50}
      r={r}
      fill={fill}
      stroke={CLR.black}
      strokeWidth={2.5}
    />
  )
}

function Square({ hw, fill }: { hw: number; fill: string }) {
  return (
    <rect
      x={50 - hw}
      y={50 - hw}
      width={hw * 2}
      height={hw * 2}
      fill={fill}
      stroke={CLR.black}
      strokeWidth={2.5}
    />
  )
}

// ---------------------------------------------------------------------------
// Figure spec — outer and inner shape + colours + the two-digit code
// ---------------------------------------------------------------------------
interface FigSpec {
  outerShape: 'triangle' | 'circle' | 'square'
  outerColor: string
  innerShape: 'triangle' | 'circle' | 'square'
  innerColor: string
  code: string          // e.g. "11"
  ariaLabel: string
}

const EXAMPLES: FigSpec[] = [
  {
    outerShape: 'triangle', outerColor: CLR.greenTriOuter,
    innerShape: 'triangle', innerColor: CLR.yellowTriInner,
    code: '11',
    ariaLabel: 'green triangle containing yellow triangle, code 11',
  },
  {
    outerShape: 'circle', outerColor: CLR.greyCirOuter,
    innerShape: 'square',  innerColor: CLR.greenSqInner,
    code: '23',
    ariaLabel: 'grey circle containing green square, code 23',
  },
  {
    outerShape: 'square',   outerColor: CLR.greenSqOuter,
    innerShape: 'triangle', innerColor: CLR.redTriInner,
    code: '31',
    ariaLabel: 'green square containing red triangle, code 31',
  },
  {
    outerShape: 'square', outerColor: CLR.yellowSqOuter,
    innerShape: 'square', innerColor: CLR.purpleSqInner,
    code: '33',
    ariaLabel: 'yellow square containing purple square, code 33',
  },
  {
    outerShape: 'triangle', outerColor: CLR.blueTriOuter,
    innerShape: 'circle',   innerColor: CLR.peachCirInner,
    code: '12',
    ariaLabel: 'blue triangle containing peach circle, code 12',
  },
]

// The query figure (image 018): purple square / yellow circle
const QUERY_FIG: FigSpec = {
  outerShape: 'square',  outerColor: CLR.purpleSqOuter,
  innerShape: 'circle',  innerColor: CLR.yellowCirInner,
  code: 'AB',
  ariaLabel: 'purple square containing yellow circle, code = AB (find the number)',
}

// ---------------------------------------------------------------------------
// Outer sizes (half-widths / radii) per shape type — outer and inner
// ---------------------------------------------------------------------------
const OUTER_HW: Record<string, number> = { triangle: 40, circle: 42, square: 42 }
const INNER_HW: Record<string, number> = { triangle: 22, circle: 22, square: 22 }

function renderShape(shape: 'triangle' | 'circle' | 'square', hw: number, color: string) {
  switch (shape) {
    case 'triangle': return <Triangle hw={hw} fill={color} />
    case 'circle':   return <Circle   r={hw}  fill={color} />
    case 'square':   return <Square   hw={hw} fill={color} />
  }
}

// ---------------------------------------------------------------------------
// One compound figure
// ---------------------------------------------------------------------------
function ShapeFig({ spec, size = 80 }: { spec: FigSpec; size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-label={spec.ariaLabel}
      role="img"
      style={{ display: 'block' }}
    >
      {renderShape(spec.outerShape, OUTER_HW[spec.outerShape], spec.outerColor)}
      {renderShape(spec.innerShape, INNER_HW[spec.innerShape], spec.innerColor)}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Stem illustration — five examples + the query figure
// ---------------------------------------------------------------------------

/**
 * ShapeCode17B9Illustration — shows the five given shape-code examples and the
 * "AB = ?" query figure for SEAMO-17-B-Q9.
 *
 * Layout:
 *   Row 1: examples 1–3
 *   Row 2: examples 4–5 + query figure
 */
export default function ShapeCode17B9Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Shape-code puzzle: five examples show how outer and inner shapes encode a two-digit number. ' +
        'Triangle=1, circle=2, square=3. ' +
        'Examples: green triangle with yellow triangle = 11; ' +
        'grey circle with green square = 23; ' +
        'green square with red triangle = 31; ' +
        'yellow square with purple square = 33; ' +
        'blue triangle with peach circle = 12. ' +
        'What is AB for a purple square with a yellow circle?'
      }
    >
      <div
        className="grid gap-x-6 gap-y-4"
        style={{ gridTemplateColumns: 'repeat(3, auto)' }}
        aria-hidden="true"
      >
        {/* 5 examples + 1 query = 6 cells in a 3-column grid */}
        {[...EXAMPLES, QUERY_FIG].map((spec, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <ShapeFig spec={spec} size={76} />
            <span
              className="text-sm font-bold"
              style={{ color: spec.code === 'AB' ? '#9B59B6' : '#374151' }}
            >
              {spec.code}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
