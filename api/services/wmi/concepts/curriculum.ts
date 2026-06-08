import type { ConceptSlug } from './registry.js'

export interface SubjectDef {
  subjectKey: string   // globally unique, grade-prefixed
  grade: 1 | 2 | 3
  name_id: string
  name_en: string
  color_hex: string
  icon_key: string     // Font Awesome 6 FREE name
  sortOrder: number
}

export const SUBJECTS: SubjectDef[] = [
  // Grade 1 — Fondasi
  { subjectKey: 'g1-hitung',        grade: 1, name_id: 'Menghitung & Urutan Bilangan', name_en: 'Counting & Ordering',       color_hex: '#30598A', icon_key: 'list-ol',              sortOrder: 1 },
  { subjectKey: 'g1-tambah-kurang', grade: 1, name_id: 'Penjumlahan & Pengurangan',    name_en: 'Add & Subtract',           color_hex: '#F0853A', icon_key: 'plus-minus',           sortOrder: 2 },
  { subjectKey: 'g1-pola',          grade: 1, name_id: 'Pola & Barisan',               name_en: 'Patterns & Sequences',     color_hex: '#7C5CBF', icon_key: 'puzzle-piece',         sortOrder: 3 },
  { subjectKey: 'g1-bentuk',        grade: 1, name_id: 'Bentuk & Simetri Dasar',       name_en: 'Shapes & Symmetry',        color_hex: '#2E8B6B', icon_key: 'shapes',               sortOrder: 4 },
  { subjectKey: 'g1-pecahan',       grade: 1, name_id: 'Pecahan Dasar',                name_en: 'Basic Fractions',          color_hex: '#E0A000', icon_key: 'chart-pie',            sortOrder: 5 },
  { subjectKey: 'g1-jam-data',      grade: 1, name_id: 'Jam, Turus & Diagram',         name_en: 'Clocks, Tally & Charts',   color_hex: '#C2575B', icon_key: 'clock',                sortOrder: 6 },
  { subjectKey: 'g1-cerita',        grade: 1, name_id: 'Soal Cerita Sederhana',        name_en: 'Simple Word Problems',     color_hex: '#5B8DEF', icon_key: 'book-open',            sortOrder: 7 },
  // Grade 2 — Pengembangan
  { subjectKey: 'g2-nilai-tempat',  grade: 2, name_id: 'Nilai Tempat & Bilangan',      name_en: 'Place Value & Numbers',    color_hex: '#30598A', icon_key: 'hashtag',              sortOrder: 8 },
  { subjectKey: 'g2-operasi',       grade: 2, name_id: 'Operasi & Ekspresi Hitung',    name_en: 'Operations & Expressions', color_hex: '#F0853A', icon_key: 'calculator',           sortOrder: 9 },
  { subjectKey: 'g2-keliling-luas', grade: 2, name_id: 'Keliling & Luas',              name_en: 'Perimeter & Area',         color_hex: '#2E8B6B', icon_key: 'ruler-combined',       sortOrder: 10 },
  { subjectKey: 'g2-geometri',      grade: 2, name_id: 'Geometri & Bangun Ruang',      name_en: 'Geometry & Solids',        color_hex: '#6B4FAE', icon_key: 'cube',                 sortOrder: 11 },
  { subjectKey: 'g2-pengukuran',    grade: 2, name_id: 'Pengukuran & Skala',           name_en: 'Measurement & Scale',      color_hex: '#14746F', icon_key: 'gauge-high',           sortOrder: 12 },
  { subjectKey: 'g2-logika',        grade: 2, name_id: 'Logika & Penalaran',           name_en: 'Logic & Reasoning',        color_hex: '#7C5CBF', icon_key: 'lightbulb',            sortOrder: 13 },
  { subjectKey: 'g2-uang-cerita',   grade: 2, name_id: 'Uang & Soal Cerita',           name_en: 'Money & Word Problems',    color_hex: '#E0A000', icon_key: 'coins',                sortOrder: 14 },
  { subjectKey: 'g2-data',          grade: 2, name_id: 'Diagram, Tabel & Data',        name_en: 'Charts, Tables & Data',    color_hex: '#C2575B', icon_key: 'chart-column',         sortOrder: 15 },
  // Grade 3 — Lanjutan
  { subjectKey: 'g3-perkalian',     grade: 3, name_id: 'Perkalian, Faktor & Kelipatan',name_en: 'Multiplication & Factors', color_hex: '#F0853A', icon_key: 'asterisk',             sortOrder: 16 },
  { subjectKey: 'g3-bilangan',      grade: 3, name_id: 'Bilangan & Pola Lanjut',       name_en: 'Advanced Numbers',         color_hex: '#30598A', icon_key: 'square-root-variable', sortOrder: 17 },
  { subjectKey: 'g3-geometri',      grade: 3, name_id: 'Geometri Lanjut',              name_en: 'Advanced Geometry',        color_hex: '#2E8B6B', icon_key: 'draw-polygon',         sortOrder: 18 },
  { subjectKey: 'g3-logika',        grade: 3, name_id: 'Logika & Strategi',            name_en: 'Logic & Strategy',         color_hex: '#7C5CBF', icon_key: 'chess-knight',         sortOrder: 19 },
  { subjectKey: 'g3-cerita-multi',  grade: 3, name_id: 'Soal Cerita Multi-langkah',    name_en: 'Multi-step Problems',      color_hex: '#E0A000', icon_key: 'list-check',           sortOrder: 20 },
  { subjectKey: 'g3-pengukuran',    grade: 3, name_id: 'Pengukuran Lanjut',            name_en: 'Advanced Measurement',     color_hex: '#14746F', icon_key: 'ruler',                sortOrder: 21 },
]

export interface ConceptCurriculum {
  subjectKey: string   // must be one of SUBJECTS[].subjectKey; its grade is the concept's home grade
  difficulty: 1 | 2 | 3
  sortOrder: number    // order within the subject; lower = earlier/easier
}

export const CURRICULUM: Record<ConceptSlug, ConceptCurriculum> = {
  // ── Grade 1: g1-hitung (Menghitung & Urutan Bilangan) ────────────────────
  // grades [0]  → home: grade 1, g1-hitung (former grade-0 concept placed in lowest grade)
  'count-objects':                  { subjectKey: 'g1-hitung',        difficulty: 1, sortOrder: 10 },
  // grades [1,2]
  'compare-order-numbers':          { subjectKey: 'g1-hitung',        difficulty: 1, sortOrder: 20 },
  'more-or-less-by-k':              { subjectKey: 'g1-hitung',        difficulty: 1, sortOrder: 30 },
  'number-line-jumps':              { subjectKey: 'g1-hitung',        difficulty: 1, sortOrder: 40 },
  'position-in-line':               { subjectKey: 'g1-hitung',        difficulty: 1, sortOrder: 50 },
  'digit-sum':                      { subjectKey: 'g1-hitung',        difficulty: 1, sortOrder: 60 },
  'arrange-digits-to-form-number':  { subjectKey: 'g1-hitung',        difficulty: 2, sortOrder: 70 },

  // ── Grade 1: g1-tambah-kurang (Penjumlahan & Pengurangan) ────────────────
  // grades [1,2]
  'single-digit-addition':          { subjectKey: 'g1-tambah-kurang', difficulty: 1, sortOrder: 10 },
  'single-digit-subtraction':       { subjectKey: 'g1-tambah-kurang', difficulty: 1, sortOrder: 20 },
  'missing-addend':                 { subjectKey: 'g1-tambah-kurang', difficulty: 1, sortOrder: 30 },
  'make-groups-leftover':           { subjectKey: 'g1-tambah-kurang', difficulty: 2, sortOrder: 40 },

  // ── Grade 1: g1-pola (Pola & Barisan) ────────────────────────────────────
  // grades [1,2]
  'pattern-next':                   { subjectKey: 'g1-pola',          difficulty: 1, sortOrder: 10 },
  'visual-pattern-next':            { subjectKey: 'g1-pola',          difficulty: 1, sortOrder: 20 },
  'shape-transformation-rule':      { subjectKey: 'g1-pola',          difficulty: 2, sortOrder: 30 },

  // ── Grade 1: g1-bentuk (Bentuk & Simetri Dasar) ──────────────────────────
  // grades [0,1] / [1,2] / [1,2,3]
  'count-polygon-sides':            { subjectKey: 'g1-bentuk',        difficulty: 1, sortOrder: 10 },
  'symmetry-count':                 { subjectKey: 'g1-bentuk',        difficulty: 1, sortOrder: 20 },
  'block-count-3d':                 { subjectKey: 'g1-bentuk',        difficulty: 2, sortOrder: 30 },

  // ── Grade 1: g1-pecahan (Pecahan Dasar) ──────────────────────────────────
  // grades [1,2]
  'fraction-of-region':             { subjectKey: 'g1-pecahan',       difficulty: 1, sortOrder: 10 },

  // ── Grade 1: g1-jam-data (Jam, Turus & Diagram) ──────────────────────────
  // grades [1,2] / [1,2,3]
  'clock-read-time':                { subjectKey: 'g1-jam-data',      difficulty: 1, sortOrder: 10 },
  'tally-marks-count':              { subjectKey: 'g1-jam-data',      difficulty: 1, sortOrder: 20 },
  'bar-chart-compare':              { subjectKey: 'g1-jam-data',      difficulty: 1, sortOrder: 30 },

  // ── Grade 1: g1-cerita (Soal Cerita Sederhana) ───────────────────────────
  // grades [1,2]
  'story-sum':                      { subjectKey: 'g1-cerita',        difficulty: 1, sortOrder: 10 },
  'which-expression-equals':        { subjectKey: 'g1-cerita',        difficulty: 1, sortOrder: 20 },
  'table-lookup-combine':           { subjectKey: 'g1-cerita',        difficulty: 1, sortOrder: 30 },

  // ── Grade 2: g2-nilai-tempat (Nilai Tempat & Bilangan) ───────────────────
  // grades [2,3]
  'place-value':                    { subjectKey: 'g2-nilai-tempat',  difficulty: 1, sortOrder: 10 },
  'build-number-from-digit-clues':  { subjectKey: 'g2-nilai-tempat',  difficulty: 2, sortOrder: 20 },
  'find-number-by-digit-sum':       { subjectKey: 'g2-nilai-tempat',  difficulty: 2, sortOrder: 30 },

  // ── Grade 2: g2-operasi (Operasi & Ekspresi Hitung) ──────────────────────
  // grades [2,3]
  'arithmetic-expression-eval':     { subjectKey: 'g2-operasi',       difficulty: 1, sortOrder: 10 },
  'alternating-chain-eval':         { subjectKey: 'g2-operasi',       difficulty: 2, sortOrder: 20 },
  'operator-fill':                  { subjectKey: 'g2-operasi',       difficulty: 2, sortOrder: 30 },
  'custom-operation':               { subjectKey: 'g2-operasi',       difficulty: 2, sortOrder: 40 },
  'mistaken-digit-correction':      { subjectKey: 'g2-operasi',       difficulty: 2, sortOrder: 50 },

  // ── Grade 2: g2-keliling-luas (Keliling & Luas) ──────────────────────────
  // grades [2,3]
  'shape-perimeter-square':         { subjectKey: 'g2-keliling-luas', difficulty: 1, sortOrder: 10 },
  'shape-perimeter-rectangle':      { subjectKey: 'g2-keliling-luas', difficulty: 1, sortOrder: 20 },
  'rectangle-area-grid':            { subjectKey: 'g2-keliling-luas', difficulty: 2, sortOrder: 30 },

  // ── Grade 2: g2-geometri (Geometri & Bangun Ruang) ───────────────────────
  // grades [2,3] / [1,2,3]
  'angle-type':                     { subjectKey: 'g2-geometri',      difficulty: 1, sortOrder: 10 },
  'same-figure-identify':           { subjectKey: 'g2-geometri',      difficulty: 1, sortOrder: 20 },
  'count-shapes-in-figure':         { subjectKey: 'g2-geometri',      difficulty: 2, sortOrder: 30 },
  'dice-opposite-faces':            { subjectKey: 'g2-geometri',      difficulty: 2, sortOrder: 40 },
  'grid-path-steps':                { subjectKey: 'g2-geometri',      difficulty: 2, sortOrder: 50 },

  // ── Grade 2: g2-pengukuran (Pengukuran & Skala) ──────────────────────────
  // grades [2,3]
  'unit-conversion':                { subjectKey: 'g2-pengukuran',    difficulty: 1, sortOrder: 10 },
  'clock-time-after':               { subjectKey: 'g2-pengukuran',    difficulty: 2, sortOrder: 20 },

  // ── Grade 2: g2-logika (Logika & Penalaran) ──────────────────────────────
  // grades [2,3]
  'odd-even-reasoning':             { subjectKey: 'g2-logika',        difficulty: 1, sortOrder: 10 },
  'divisibility-multiple-property': { subjectKey: 'g2-logika',        difficulty: 1, sortOrder: 20 },
  'which-might-be':                 { subjectKey: 'g2-logika',        difficulty: 2, sortOrder: 30 },
  'assignment-cycle':               { subjectKey: 'g2-logika',        difficulty: 2, sortOrder: 40 },
  'direction-orientation':          { subjectKey: 'g2-logika',        difficulty: 2, sortOrder: 50 },

  // ── Grade 2: g2-uang-cerita (Uang & Soal Cerita) ─────────────────────────
  // grades [2,3] / [2]
  'money-shopping-change':          { subjectKey: 'g2-uang-cerita',   difficulty: 1, sortOrder: 10 },
  'money-coins-total':              { subjectKey: 'g2-uang-cerita',   difficulty: 1, sortOrder: 20 },
  'legs-items-rate':                { subjectKey: 'g2-uang-cerita',   difficulty: 2, sortOrder: 30 },
  'equivalent-fraction-fill':       { subjectKey: 'g2-uang-cerita',   difficulty: 2, sortOrder: 40 },

  // ── Grade 2: g2-data (Diagram, Tabel & Data) ─────────────────────────────
  // grades [2,3] / [2]
  'venn-set-membership':            { subjectKey: 'g2-data',          difficulty: 2, sortOrder: 10 },
  'net-progress-cycles':            { subjectKey: 'g2-data',          difficulty: 2, sortOrder: 20 },

  // ── Grade 3: g3-perkalian (Perkalian, Faktor & Kelipatan) ────────────────
  // grades [3]
  'multiplication-small':           { subjectKey: 'g3-perkalian',     difficulty: 1, sortOrder: 10 },
  'combination-product-sum':        { subjectKey: 'g3-perkalian',     difficulty: 2, sortOrder: 20 },
  'perfect-square-search':          { subjectKey: 'g3-perkalian',     difficulty: 2, sortOrder: 30 },
  'product-of-consecutive':         { subjectKey: 'g3-perkalian',     difficulty: 3, sortOrder: 40 },

  // ── Grade 3: g3-bilangan (Bilangan & Pola Lanjut) ────────────────────────
  // grades [3] and pulled-up [2,3]
  'digit-frequency':                { subjectKey: 'g3-bilangan',      difficulty: 2, sortOrder: 10 },
  'number-pyramid':                 { subjectKey: 'g3-bilangan',      difficulty: 2, sortOrder: 20 },
  'sum-partition-split':            { subjectKey: 'g3-bilangan',      difficulty: 3, sortOrder: 30 },
  'reverse-arithmetic-puzzle':      { subjectKey: 'g3-bilangan',      difficulty: 2, sortOrder: 40 },

  // ── Grade 3: g3-geometri (Geometri Lanjut) ───────────────────────────────
  // grades [3] and pulled-up [2,3]
  'count-rectangles-grid':          { subjectKey: 'g3-geometri',      difficulty: 3, sortOrder: 10 },
  'perimeter-area-composed':        { subjectKey: 'g3-geometri',      difficulty: 2, sortOrder: 20 },
  'dice-net-fold':                  { subjectKey: 'g3-geometri',      difficulty: 2, sortOrder: 30 },

  // ── Grade 3: g3-logika (Logika & Strategi) ───────────────────────────────
  // grades [2,3]
  'maze-path-shortest':             { subjectKey: 'g3-logika',        difficulty: 2, sortOrder: 10 },
  'truth-order-clues':              { subjectKey: 'g3-logika',        difficulty: 2, sortOrder: 20 },
  'budget-selection':               { subjectKey: 'g3-logika',        difficulty: 2, sortOrder: 30 },
  'range-count-evaluate':           { subjectKey: 'g3-logika',        difficulty: 3, sortOrder: 40 },

  // ── Grade 3: g3-cerita-multi (Soal Cerita Multi-langkah) ─────────────────
  // grades [2,3]
  'distance-rate-time':             { subjectKey: 'g3-cerita-multi',  difficulty: 2, sortOrder: 10 },
  'lacking-money-shared':           { subjectKey: 'g3-cerita-multi',  difficulty: 2, sortOrder: 20 },
  'rope-wraps-ratio':               { subjectKey: 'g3-cerita-multi',  difficulty: 3, sortOrder: 30 },

  // ── Grade 3: g3-pengukuran (Pengukuran Lanjut) ───────────────────────────
  // grades [2,3] / [2]
  'weight-balance-word':            { subjectKey: 'g3-pengukuran',    difficulty: 1, sortOrder: 10 },
  'scale-read':                     { subjectKey: 'g3-pengukuran',    difficulty: 2, sortOrder: 20 },
}
