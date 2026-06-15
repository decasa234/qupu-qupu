import type { WmiChoice } from '../../../types/wmi'
import { ClockPicture } from './ClockPic24G1Illustration'

// WMI-24F1A-Q13 answer options A–E, each an axis-aligned square "picture":
// a square frame, one corner-to-corner diagonal, and a lollipop (a small circle
// on a short stick). The five differ in WHICH diagonal is drawn and WHERE the
// lollipop sits — exactly as printed on Paper A.
//
// All five share the "\" diagonal (top-left → bottom-right); they differ only
// in where the lollipop hangs:
//   A  circle top-centre, stick along the TOP from the top-left corner
//   B  circle just below centre, stick from the BOTTOM-LEFT corner
//   C  circle at the BOTTOM-LEFT, stick down the LEFT side from the top-left corner
//   D  circle top-centre, stick UP from the BOTTOM-RIGHT corner               ← answer
//   E  circle at the TOP-LEFT, stick to the right toward the diagonal
//
// D is the only option that equals the stem picture rotated -120° (11:50 → 3:30),
// so we render D from the shared <ClockPicture> primitive — it can never drift
// from the stem. The other four are hand-drawn decoys in the same 100×100 box.

const INK = '#3a3438'
const SW = 6

/** A 100×100 picture box with the square frame already drawn; children add the diagonal + lollipop. */
function PicBox({ children }: { children: React.ReactNode }) {
  return (
    <g stroke={INK} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <rect x={3} y={3} width={94} height={94} />
      {children}
    </g>
  )
}

/** Lollipop head circle (white fill so the diagonal/stick read behind it). */
function Head({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={12} fill="#ffffff" />
}

function OptionA() {
  return (
    <PicBox>
      <line x1={3} y1={3} x2={97} y2={97} />
      {/* stick along the top from the top-left corner to the circle */}
      <line x1={8} y1={9} x2={56} y2={20} />
      <Head cx={66} cy={20} />
    </PicBox>
  )
}

function OptionB() {
  return (
    <PicBox>
      <line x1={3} y1={3} x2={97} y2={97} />
      {/* stick from the bottom-left corner up-right to the circle just below centre */}
      <line x1={9} y1={92} x2={58} y2={62} />
      <Head cx={68} cy={62} />
    </PicBox>
  )
}

function OptionC() {
  return (
    <PicBox>
      {/* "\" diagonal: top-left → bottom-right */}
      <line x1={3} y1={3} x2={97} y2={97} />
      {/* stick straight down the left side, from the top-left corner to the circle */}
      <line x1={11} y1={9} x2={22} y2={68} />
      <Head cx={24} cy={79} />
    </PicBox>
  )
}

function OptionD() {
  // The canonical picture (the stem's picture at the 3:30 orientation).
  return <ClockPicture strokeWidth={SW} />
}

function OptionE() {
  return (
    <PicBox>
      {/* "\" diagonal: top-left → bottom-right (its top end is the circle's stick) */}
      <line x1={3} y1={3} x2={97} y2={97} />
      {/* stick from the top-left circle rightward to the top edge */}
      <line x1={36} y1={24} x2={84} y2={14} />
      <Head cx={24} cy={24} />
    </PicBox>
  )
}

const BY_LABEL: Record<string, () => React.ReactElement> = {
  A: OptionA,
  B: OptionB,
  C: OptionC,
  D: OptionD,
  E: OptionE,
}

const ARIA_BY_LABEL: Record<string, string> = {
  A: 'Pilihan A: persegi dengan diagonal kiri-atas ke kanan-bawah, lingkaran di tengah-atas dengan tangkai dari pojok kiri-atas.',
  B: 'Pilihan B: persegi dengan diagonal kiri-atas ke kanan-bawah, lingkaran sedikit di bawah tengah dengan tangkai dari pojok kiri-bawah.',
  C: 'Pilihan C: persegi dengan diagonal kiri-atas ke kanan-bawah, lingkaran di pojok kiri-bawah dengan tangkai turun dari pojok kiri-atas.',
  D: 'Pilihan D: persegi dengan diagonal kiri-atas ke kanan-bawah, lingkaran di tengah-atas dengan tangkai dari pojok kanan-bawah.',
  E: 'Pilihan E: persegi dengan diagonal kiri-atas ke kanan-bawah, lingkaran di pojok kiri-atas dengan tangkai ke kanan.',
}

export default function ClockPic24G1Option({ choice }: { choice: WmiChoice }) {
  const Draw = BY_LABEL[choice.label]
  if (!Draw) return <span>{choice.text}</span>
  return (
    <span
      role="img"
      aria-label={ARIA_BY_LABEL[choice.label] ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg viewBox="0 0 100 100" width={88} height={88} aria-hidden="true" style={{ overflow: 'visible' }}>
        <Draw />
      </svg>
    </span>
  )
}
