import type { WmiChoice } from '../../../types/wmi'
import { resolveConfiguredApiAssetUrl } from '../../../lib/apiAssetUrl'

const figureUrl = (filename: string) =>
  resolveConfiguredApiAssetUrl(`/api/public/wmi/figures/${filename}`)

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={aria}
    >
      {children}
    </div>
  )
}

function RasterGrid({
  aria,
  files,
  columns = 1,
}: {
  aria: string
  files: string[]
  columns?: number
}) {
  const rows = Math.ceil(files.length / columns)
  const cellW = 400
  const cellH = 280
  return (
    <Frame aria={aria}>
      <svg
        viewBox={`0 0 ${columns * cellW} ${rows * cellH}`}
        width="100%"
        style={{ display: 'block', margin: '0 auto', maxWidth: columns > 1 ? 760 : 560 }}
        aria-hidden="true"
      >
        {files.map((file, index) => {
          const col = index % columns
          const row = Math.floor(index / columns)
          return (
            <image
              key={file}
              href={figureUrl(file)}
              x={col * cellW + 8}
              y={row * cellH + 8}
              width={cellW - 16}
              height={cellH - 16}
              preserveAspectRatio="xMidYMid meet"
            />
          )
        })}
      </svg>
    </Frame>
  )
}

export function Shark22G2Illustration() {
  return <RasterGrid aria="A shark numbered 374 surrounded by fish with different numbers." files={['2022-final-g2-a-q1.jpg']} />
}

export function PaperStack22G2Illustration() {
  return <RasterGrid aria="Seven numbered sheets of paper overlap in a stack." files={['2022-final-g2-a-q3.jpg']} />
}

const ballFiles = ['a', 'b', 'c', 'd'].map((label) => `2022-final-g2-q5-${label}.jpg`)

export function Balls22G2Illustration() {
  return <RasterGrid aria="Four options showing six black and white balls of different sizes." files={ballFiles} columns={2} />
}

const lineFiles = ['a', 'b', 'c', 'd'].map((label) => `2022-final-g2-q8-${label}.jpg`)

export function ThickLines22G2Illustration() {
  return <RasterGrid aria="Four orange paths drawn on grids of three by two centimetre rectangles." files={lineFiles} columns={2} />
}

export function ChildrenOrder22G2Illustration() {
  return <RasterGrid aria="Four children of different heights standing from left to right." files={['2022-final-g2-a-q10.jpg']} />
}

export function Targets22G2Illustration() {
  return (
    <RasterGrid
      aria="Four archery targets for Alex, Bob, Celine, and Dan."
      files={[
        '2022-final-g2-q11-alex.jpg',
        '2022-final-g2-q11-bob.jpg',
        '2022-final-g2-q11-celine.jpg',
        '2022-final-g2-q11-dan.jpg',
      ]}
      columns={2}
    />
  )
}

export function EggPath22G2Illustration() {
  return <RasterGrid aria="A winding orange path through numbered eggs in a three by four grid." files={['2022-final-g2-a-q12.jpg']} />
}

export function Cups22G2Illustration() {
  return (
    <Frame aria="Four mugs total thirty-six, two cups multiply to forty-nine, and one mug plus one cup is asked.">
      <svg viewBox="0 0 520 210" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 560 }} aria-hidden="true">
        <text x={260} y={54} textAnchor="middle" fontSize={34} fontWeight={800} fill="#312E81" className="font-display">
          4 × mug = 36
        </text>
        <text x={260} y={112} textAnchor="middle" fontSize={34} fontWeight={800} fill="#BE185D" className="font-display">
          cup × cup = 49
        </text>
        <rect x={116} y={142} width={288} height={52} rx={12} fill="#ECFDF5" stroke="#10B981" strokeWidth={3} />
        <text x={260} y={169} textAnchor="middle" dominantBaseline="central" fontSize={30} fontWeight={900} fill="#065F46" className="font-display">
          mug + cup = ?
        </text>
      </svg>
    </Frame>
  )
}

export function Flowchart22G2Illustration() {
  return <RasterGrid aria="A flowchart using A equals sixty-five and B equals eighty." files={['2022-final-g2-a-q16.jpg']} />
}

export function Balance22G2Illustration() {
  return <RasterGrid aria="Four balanced scales relating balls A, B, C, and D." files={['2022-final-g2-a-q17.jpg']} />
}

export function SeatGrid22G2Illustration() {
  return <RasterGrid aria="A five by five coordinate grid filled with letters A to E." files={['2022-final-g2-a-q18.jpg']} />
}

export function ShapeAddition22G2Illustration() {
  return <RasterGrid aria="A vertical addition where equal shapes represent equal digits." files={['2022-final-g2-a-q19.jpg']} />
}

export function PasswordDial22G2Illustration() {
  return <RasterGrid aria="A numbered password dial and a sequence of clockwise and counterclockwise turns." files={['2022-final-g2-a-q20.jpg']} />
}

export function CardHands22G2Illustration() {
  return <RasterGrid aria="Playing-card hands for Angie, Bob, Cox, and an unknown hand for Danny." files={['2022-final-g2-a-q21.jpg']} />
}

export function Soldiers22G2Illustration() {
  return <RasterGrid aria="Numbered soldiers moving across two holes in a road." files={['2022-final-g2-a-q23.jpg']} />
}

export function MirrorBlocks22G2Illustration() {
  return <RasterGrid aria="A block solid shown with two coloured mirror projections." files={['2022-final-g2-a-q24.jpg']} />
}

export function TCover22G2Illustration() {
  return (
    <Frame aria="A T-shaped four-square cover and a four by four grid of arithmetic values.">
      <svg viewBox="0 0 820 520" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 760 }} aria-hidden="true">
        <g transform="translate(35 150)" fill="#F59E0B" stroke="#92400E" strokeWidth={3}>
          <rect x={0} y={80} width={90} height={90} />
          <rect x={90} y={80} width={90} height={90} />
          <rect x={180} y={80} width={90} height={90} />
          <rect x={90} y={-10} width={90} height={90} />
        </g>
        <image
          href={figureUrl('2022-final-g2-a-q25.jpg')}
          x={330}
          y={20}
          width={470}
          height={480}
          preserveAspectRatio="xMidYMid meet"
        />
      </svg>
    </Frame>
  )
}

function ImageChoice({ choice, prefix }: { choice: WmiChoice; prefix: string }) {
  const label = choice.label.toLowerCase()
  return (
    <span role="img" aria-label={choice.text} className="inline-flex min-h-16 items-center justify-center p-1">
      <img
        src={figureUrl(`${prefix}-${label}.jpg`)}
        alt={choice.text}
        className="max-h-20 max-w-full object-contain"
      />
    </span>
  )
}

export function BallOption22G2({ choice }: { choice: WmiChoice }) {
  return <ImageChoice choice={choice} prefix="2022-final-g2-q5" />
}

export function ThickLineOption22G2({ choice }: { choice: WmiChoice }) {
  return <ImageChoice choice={choice} prefix="2022-final-g2-q8" />
}
