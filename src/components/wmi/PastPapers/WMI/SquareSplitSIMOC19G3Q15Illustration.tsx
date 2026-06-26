/**
 * SquareSplitSIMOC19G3Q15Illustration — SIMOC-19-G3-Q15
 *
 * "ABCD adalah persegi yang terdiri dari 2 persegi panjang dengan luas
 *  masing-masing 44 cm² dan 28 cm², serta sebuah persegi kecil.
 *  Tentukan jumlah luas kedua persegi tersebut."
 * Answer: C (170) — big sq 121 + small sq 49 = 170 cm²
 *
 * Source crop: docs/reference/ocr-res/simoc/contest/g3/2019.imgs/016.jpg
 * Layout (s=11 units, p=4 units, 1 unit=16px):
 *   Left tall rectangle  : 4 × 11 = 44 cm²
 *   Upper-right rectangle: 7 × 4  = 28 cm²
 *   Lower-right square   : 7 × 7  = 49 cm²  (the small square)
 *
 * No primitive matches a square-partition figure — fresh SVG.
 */

import React from 'react'

// SVG grid: 1 unit = 16 px, big square side = 11 × 16 = 176 px
const O_X = 12          // square origin X
const O_Y = 12          // square origin Y
const S_PX = 176        // big square side in px  (s = 11)
const P_PX = 64         // left strip / top strip in px  (p = 4)

const DIV_X = O_X + P_PX          // x of vertical divider  = 76
const DIV_Y = O_Y + P_PX          // y of horizontal divider = 76  (right section only)
const END   = O_X + S_PX          // right / bottom edge     = 188

// Region centres
const L_CX  = O_X + P_PX / 2          // left rect  cx = 44
const L_CY  = O_Y + S_PX / 2          // left rect  cy = 100
const UR_CX = DIV_X + (S_PX - P_PX) / 2  // upper-right cx = 132
const UR_CY = O_Y + P_PX / 2              // upper-right cy = 44
const SQ_CX = DIV_X + (S_PX - P_PX) / 2  // small sq   cx = 132
const SQ_CY = DIV_Y + (S_PX - P_PX) / 2  // small sq   cy = 132

export default function SquareSplitSIMOC19G3Q15Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Persegi ABCD dibagi menjadi persegi panjang kiri (44 cm²), persegi panjang kanan atas (28 cm²), dan persegi kecil kanan bawah (?). Tentukan jumlah luas kedua persegi."
    >
      <svg
        viewBox="0 0 200 200"
        width="200"
        height="200"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Region fills */}
        <rect x={O_X} y={O_Y} width={P_PX} height={S_PX} fill="#F8FAFC" />
        <rect x={DIV_X} y={O_Y} width={S_PX - P_PX} height={P_PX} fill="#F8FAFC" />
        <rect x={DIV_X} y={DIV_Y} width={S_PX - P_PX} height={S_PX - P_PX} fill="#F8FAFC" />

        {/* Big square outline */}
        <rect
          x={O_X} y={O_Y} width={S_PX} height={S_PX}
          fill="none" stroke="#1E293B" strokeWidth="2"
        />

        {/* Vertical divider — full height */}
        <line x1={DIV_X} y1={O_Y} x2={DIV_X} y2={END}
          stroke="#1E293B" strokeWidth="1.5" />

        {/* Horizontal divider — right section only */}
        <line x1={DIV_X} y1={DIV_Y} x2={END} y2={DIV_Y}
          stroke="#1E293B" strokeWidth="1.5" />

        {/* Area labels */}
        <text x={L_CX} y={L_CY - 6} textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">44</text>
        <text x={L_CX} y={L_CY + 10} textAnchor="middle" fontSize="10" fill="#64748B">cm²</text>

        <text x={UR_CX} y={UR_CY - 6} textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">28</text>
        <text x={UR_CX} y={UR_CY + 10} textAnchor="middle" fontSize="10" fill="#64748B">cm²</text>

        {/* Unknown small square */}
        <text x={SQ_CX} y={SQ_CY + 8} textAnchor="middle" fontSize="24" fontWeight="700" fill="#94A3B8">?</text>

        {/* Corner labels — just outside the square corners */}
        <text x={O_X - 5}  y={O_Y - 2}   textAnchor="end"    fontSize="13" fontWeight="700" fill="#1E293B">A</text>
        <text x={END + 5}  y={O_Y - 2}   textAnchor="start"  fontSize="13" fontWeight="700" fill="#1E293B">B</text>
        <text x={END + 5}  y={END + 12}  textAnchor="start"  fontSize="13" fontWeight="700" fill="#1E293B">C</text>
        <text x={O_X - 5}  y={END + 12}  textAnchor="end"    fontSize="13" fontWeight="700" fill="#1E293B">D</text>
      </svg>
    </div>
  )
}
