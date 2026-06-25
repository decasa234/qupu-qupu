// PolygonSidesHK19P1Q18Illustration — HKIMO 2019 Heat Primary-1 Q18
//
// "How many sides does the polygon below have?" → answer: 6
//
// OCR source: docs/reference/ocr-res/hkimo/heat/primary-1/2019.md Q18,
// image crop:  2019.imgs/004.jpg
//
// The figure is an irregular hexagon: a roughly-square body with the right
// side replaced by a short vertical + two diagonals forming a right-pointing
// arrow (►). Six vertices, six sides.
//
// No existing primitive covers a bare polygon-side-count figure → fresh SVG.
// SSR-safe — no hooks, no framer-motion, pure SVG.

// viewBox 160 × 130
// Vertices (clockwise from top-left):
//   A (10,  10)  top-left
//   B (100, 10)  top-right
//   C (100, 48)  right side drops before arrow
//   D (145, 65)  arrow tip (rightmost)
//   E (100,110)  bottom-right (arrow lower arm meets bottom)
//   F (10,  110) bottom-left
const PTS = '10,10 100,10 100,48 145,65 100,110 10,110'

export default function PolygonSidesHK19P1Q18Illustration() {
  return (
    <svg
      viewBox="0 0 160 130"
      width="200"
      height="163"
      aria-label="Irregular hexagon with six sides"
      role="img"
    >
      <polygon
        points={PTS}
        fill="none"
        stroke="#1E3A5F"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  )
}
