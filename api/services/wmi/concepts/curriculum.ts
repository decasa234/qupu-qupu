import type { ConceptSlug } from './registry.js'

export type ThemeKey = 'bilangan' | 'bentuk' | 'logika' | 'pengukuran' | 'soalcerita'

export interface ThemeDef {
  themeKey: ThemeKey
  name_id: string
  name_en: string
  color_hex: string
  icon_key: string // Font Awesome name, e.g. 'calculator'
  sort_order: number
}

export const THEMES: ThemeDef[] = [
  { themeKey: 'bilangan',   name_id: 'Bilangan & Operasi', name_en: 'Numbers & Operations',  color_hex: '#30598A', icon_key: 'calculator',   sort_order: 1 },
  { themeKey: 'bentuk',     name_id: 'Bentuk & Ruang',     name_en: 'Shapes & Space',        color_hex: '#F0853A', icon_key: 'shapes',       sort_order: 2 },
  { themeKey: 'logika',     name_id: 'Pola & Logika',      name_en: 'Patterns & Logic',      color_hex: '#7C5CBF', icon_key: 'puzzle-piece', sort_order: 3 },
  { themeKey: 'pengukuran', name_id: 'Pengukuran & Data',  name_en: 'Measurement & Data',    color_hex: '#2E8B6B', icon_key: 'gauge-high',   sort_order: 4 },
  { themeKey: 'soalcerita', name_id: 'Soal Cerita & Uang', name_en: 'Word Problems & Money', color_hex: '#E0A000', icon_key: 'coins',        sort_order: 5 },
]

export interface ConceptCurriculum {
  themeKey: ThemeKey
  difficulty: 1 | 2 | 3
  sortOrder: number // order within (grade, theme); lower = earlier/easier
}

export const CURRICULUM: Record<ConceptSlug, ConceptCurriculum> = {
  // ── bilangan (Numbers & Operations) ──────────────────────────────────────
  // grades [0] → difficulty 1
  'count-objects':               { themeKey: 'bilangan', difficulty: 1, sortOrder: 10 },
  // grades [1,2] → difficulty 1
  'single-digit-addition':       { themeKey: 'bilangan', difficulty: 1, sortOrder: 20 },
  'single-digit-subtraction':    { themeKey: 'bilangan', difficulty: 1, sortOrder: 30 },
  'missing-addend':              { themeKey: 'bilangan', difficulty: 1, sortOrder: 40 },
  'compare-order-numbers':       { themeKey: 'bilangan', difficulty: 1, sortOrder: 50 },
  'more-or-less-by-k':           { themeKey: 'bilangan', difficulty: 1, sortOrder: 60 },
  'number-line-jumps':           { themeKey: 'bilangan', difficulty: 1, sortOrder: 70 },
  'which-expression-equals':     { themeKey: 'bilangan', difficulty: 1, sortOrder: 80 },
  'digit-sum':                   { themeKey: 'bilangan', difficulty: 1, sortOrder: 90 },
  'arrange-digits-to-form-number': { themeKey: 'bilangan', difficulty: 1, sortOrder: 100 },
  // grades [1,2] → difficulty 1
  'make-groups-leftover':        { themeKey: 'bilangan', difficulty: 1, sortOrder: 105 },
  // grades [2,3] → difficulty 2
  'place-value':                 { themeKey: 'bilangan', difficulty: 2, sortOrder: 110 },
  'arithmetic-expression-eval':  { themeKey: 'bilangan', difficulty: 2, sortOrder: 120 },
  'reverse-arithmetic-puzzle':   { themeKey: 'bilangan', difficulty: 2, sortOrder: 130 },
  'find-number-by-digit-sum':    { themeKey: 'bilangan', difficulty: 2, sortOrder: 140 },
  'custom-operation':            { themeKey: 'bilangan', difficulty: 2, sortOrder: 150 },
  'alternating-chain-eval':      { themeKey: 'bilangan', difficulty: 2, sortOrder: 160 },
  'mistaken-digit-correction':   { themeKey: 'bilangan', difficulty: 2, sortOrder: 170 },
  'build-number-from-digit-clues': { themeKey: 'bilangan', difficulty: 2, sortOrder: 180 },
  'operator-fill':               { themeKey: 'bilangan', difficulty: 2, sortOrder: 190 },
  'number-pyramid':              { themeKey: 'bilangan', difficulty: 2, sortOrder: 200 },
  'range-count-evaluate':        { themeKey: 'bilangan', difficulty: 2, sortOrder: 210 },
  // grades [3] → difficulty 3
  'multiplication-small':        { themeKey: 'bilangan', difficulty: 3, sortOrder: 220 },
  'digit-frequency':             { themeKey: 'bilangan', difficulty: 3, sortOrder: 230 },
  'sum-partition-split':         { themeKey: 'bilangan', difficulty: 3, sortOrder: 240 },

  // ── bentuk (Shapes & Space) ───────────────────────────────────────────────
  // grades [0,1] or [1,2] → difficulty 1
  'count-polygon-sides':         { themeKey: 'bentuk', difficulty: 1, sortOrder: 10 },
  'fraction-of-region':          { themeKey: 'bentuk', difficulty: 1, sortOrder: 20 },
  'grid-path-steps':             { themeKey: 'bentuk', difficulty: 1, sortOrder: 30 },
  // grades [1,2,3] → difficulty 1
  'block-count-3d':              { themeKey: 'bentuk', difficulty: 1, sortOrder: 40 },
  // grades [2,3] → difficulty 2
  'shape-perimeter-square':      { themeKey: 'bentuk', difficulty: 2, sortOrder: 50 },
  'shape-perimeter-rectangle':   { themeKey: 'bentuk', difficulty: 2, sortOrder: 60 },
  'rectangle-area-grid':         { themeKey: 'bentuk', difficulty: 2, sortOrder: 70 },
  'symmetry-count':              { themeKey: 'bentuk', difficulty: 2, sortOrder: 80 },
  'angle-type':                  { themeKey: 'bentuk', difficulty: 2, sortOrder: 90 },
  'dice-opposite-faces':         { themeKey: 'bentuk', difficulty: 2, sortOrder: 100 },
  'dice-net-fold':               { themeKey: 'bentuk', difficulty: 2, sortOrder: 110 },
  'same-figure-identify':        { themeKey: 'bentuk', difficulty: 2, sortOrder: 120 },
  'count-shapes-in-figure':      { themeKey: 'bentuk', difficulty: 2, sortOrder: 130 },
  'perimeter-area-composed':     { themeKey: 'bentuk', difficulty: 2, sortOrder: 140 },
  'maze-path-shortest':          { themeKey: 'bentuk', difficulty: 2, sortOrder: 150 },
  // grades [2] → difficulty 2
  'equivalent-fraction-fill':    { themeKey: 'bentuk', difficulty: 2, sortOrder: 160 },
  // grades [3] → difficulty 3
  'count-rectangles-grid':       { themeKey: 'bentuk', difficulty: 3, sortOrder: 170 },

  // ── logika (Patterns & Logic) ─────────────────────────────────────────────
  // grades [1,2] → difficulty 1
  'pattern-next':                { themeKey: 'logika', difficulty: 1, sortOrder: 10 },
  'visual-pattern-next':         { themeKey: 'logika', difficulty: 1, sortOrder: 20 },
  'position-in-line':            { themeKey: 'logika', difficulty: 1, sortOrder: 30 },
  'shape-transformation-rule':   { themeKey: 'logika', difficulty: 1, sortOrder: 40 },
  // grades [2,3] → difficulty 2
  'odd-even-reasoning':          { themeKey: 'logika', difficulty: 2, sortOrder: 50 },
  'divisibility-multiple-property': { themeKey: 'logika', difficulty: 2, sortOrder: 60 },
  'assignment-cycle':            { themeKey: 'logika', difficulty: 2, sortOrder: 70 },
  'which-might-be':              { themeKey: 'logika', difficulty: 2, sortOrder: 80 },
  'truth-order-clues':           { themeKey: 'logika', difficulty: 2, sortOrder: 90 },
  'direction-orientation':       { themeKey: 'logika', difficulty: 2, sortOrder: 100 },
  // grades [3] → difficulty 3
  'perfect-square-search':       { themeKey: 'logika', difficulty: 3, sortOrder: 110 },
  'product-of-consecutive':      { themeKey: 'logika', difficulty: 3, sortOrder: 120 },
  'combination-product-sum':     { themeKey: 'logika', difficulty: 3, sortOrder: 130 },

  // ── pengukuran (Measurement & Data) ──────────────────────────────────────
  // grades [1,2,3] or [1,2] → difficulty 1
  'clock-read-time':             { themeKey: 'pengukuran', difficulty: 1, sortOrder: 10 },
  'tally-marks-count':           { themeKey: 'pengukuran', difficulty: 1, sortOrder: 20 },
  'bar-chart-compare':           { themeKey: 'pengukuran', difficulty: 1, sortOrder: 30 },
  // grades [2,3] → difficulty 2
  'clock-time-after':            { themeKey: 'pengukuran', difficulty: 2, sortOrder: 40 },
  'unit-conversion':             { themeKey: 'pengukuran', difficulty: 2, sortOrder: 50 },
  'weight-balance-word':         { themeKey: 'pengukuran', difficulty: 2, sortOrder: 60 },
  'scale-read':                  { themeKey: 'pengukuran', difficulty: 2, sortOrder: 70 },
  'venn-set-membership':         { themeKey: 'pengukuran', difficulty: 2, sortOrder: 80 },

  // ── soalcerita (Word Problems & Money) ────────────────────────────────────
  // grades [1,2] → difficulty 1
  'story-sum':                   { themeKey: 'soalcerita', difficulty: 1, sortOrder: 10 },
  'money-coins-total':           { themeKey: 'soalcerita', difficulty: 2, sortOrder: 20 }, // grades [2,3] → 2
  // grades [1,2] → difficulty 1
  'table-lookup-combine':        { themeKey: 'soalcerita', difficulty: 1, sortOrder: 30 },
  // grades [2,3] → difficulty 2
  'legs-items-rate':             { themeKey: 'soalcerita', difficulty: 2, sortOrder: 40 },
  'money-shopping-change':       { themeKey: 'soalcerita', difficulty: 2, sortOrder: 50 },
  'distance-rate-time':          { themeKey: 'soalcerita', difficulty: 2, sortOrder: 60 },
  'lacking-money-shared':        { themeKey: 'soalcerita', difficulty: 2, sortOrder: 70 },
  'budget-selection':            { themeKey: 'soalcerita', difficulty: 2, sortOrder: 80 },
  // grades [2] → difficulty 2
  'rope-wraps-ratio':            { themeKey: 'soalcerita', difficulty: 2, sortOrder: 90 },
  'net-progress-cycles':         { themeKey: 'soalcerita', difficulty: 2, sortOrder: 100 },
}
