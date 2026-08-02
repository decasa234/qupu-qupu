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

export interface TagDef {
  key: string
  name_id: string
  name_en: string
  color_hex: string
}

export const TAGS: TagDef[] = [
  { key: 'arithmetic',    name_id: 'Aritmetika',     name_en: 'Arithmetic',     color_hex: '#30598A' },
  { key: 'place-value',   name_id: 'Nilai Tempat',   name_en: 'Place Value',    color_hex: '#3F6BA0' },
  { key: 'fractions',     name_id: 'Pecahan',        name_en: 'Fractions',      color_hex: '#E0A000' },
  { key: 'decimals',      name_id: 'Desimal',        name_en: 'Decimals',       color_hex: '#C9920A' },
  { key: 'number-theory', name_id: 'Teori Bilangan', name_en: 'Number Theory',  color_hex: '#6B4FAE' },
  { key: 'patterns',      name_id: 'Pola',           name_en: 'Patterns',       color_hex: '#7C5CBF' },
  { key: 'geometry',      name_id: 'Geometri',       name_en: 'Geometry',       color_hex: '#2E8B6B' },
  { key: 'measurement',   name_id: 'Pengukuran',     name_en: 'Measurement',    color_hex: '#14746F' },
  { key: 'data',          name_id: 'Data & Diagram', name_en: 'Data & Charts',  color_hex: '#C2575B' },
  { key: 'logic',         name_id: 'Logika',         name_en: 'Logic',          color_hex: '#B5497E' },
  { key: 'counting',      name_id: 'Membilang',      name_en: 'Counting',       color_hex: '#4C84C4' },
  { key: 'money',         name_id: 'Uang',           name_en: 'Money',          color_hex: '#E8843C' },
  { key: 'spatial',       name_id: 'Ruang & Jalur',  name_en: 'Spatial',        color_hex: '#3E8E7E' },
  { key: 'word-problem',  name_id: 'Soal Cerita',    name_en: 'Word Problem',   color_hex: '#5B8DEF' },
]

export type TagKey =
  | 'arithmetic' | 'place-value' | 'fractions' | 'decimals' | 'number-theory'
  | 'patterns' | 'geometry' | 'measurement' | 'data' | 'logic'
  | 'counting' | 'money' | 'spatial' | 'word-problem'

export interface ConceptCurriculum {
  subjectKey: string   // must be one of SUBJECTS[].subjectKey; its grade is the concept's home grade
  difficulty: 1 | 2 | 3
  sortOrder: number    // order within the subject; lower = earlier/easier
  tags: TagKey[]
}

export const CURRICULUM: Record<ConceptSlug, ConceptCurriculum> = {
  // ── Grade 1: g1-hitung (Menghitung & Urutan Bilangan) ────────────────────
  // grades [1,2]
  'compare-order-numbers':          { subjectKey: 'g1-hitung',        difficulty: 1, sortOrder: 20, tags: ['counting', 'arithmetic'] },
  'more-or-less-by-k':              { subjectKey: 'g1-hitung',        difficulty: 1, sortOrder: 30, tags: ['counting', 'arithmetic'] },
  'number-line-jumps':              { subjectKey: 'g1-hitung',        difficulty: 1, sortOrder: 40, tags: ['counting', 'arithmetic'] },
  'position-in-line':               { subjectKey: 'g1-hitung',        difficulty: 1, sortOrder: 50, tags: ['counting'] },
  'digit-sum':                      { subjectKey: 'g1-hitung',        difficulty: 1, sortOrder: 60, tags: ['arithmetic', 'place-value'] },
  'arrange-digits-to-form-number':  { subjectKey: 'g1-hitung',        difficulty: 2, sortOrder: 70, tags: ['place-value', 'arithmetic'] },

  // ── Grade 1: g1-tambah-kurang (Penjumlahan & Pengurangan) ────────────────
  // grades [1,2]
  'single-digit-addition':          { subjectKey: 'g1-tambah-kurang', difficulty: 1, sortOrder: 10, tags: ['arithmetic'] },
  'single-digit-subtraction':       { subjectKey: 'g1-tambah-kurang', difficulty: 1, sortOrder: 20, tags: ['arithmetic'] },
  'missing-addend':                 { subjectKey: 'g1-tambah-kurang', difficulty: 1, sortOrder: 30, tags: ['arithmetic'] },
  'make-groups-leftover':           { subjectKey: 'g1-tambah-kurang', difficulty: 2, sortOrder: 40, tags: ['arithmetic', 'counting'] },

  // ── Grade 1: g1-pola (Pola & Barisan) ────────────────────────────────────
  // grades [1,2]
  'pattern-next':                   { subjectKey: 'g1-pola',          difficulty: 1, sortOrder: 10, tags: ['patterns'] },
  'visual-pattern-next':            { subjectKey: 'g1-pola',          difficulty: 1, sortOrder: 20, tags: ['patterns'] },
  'shape-transformation-rule':      { subjectKey: 'g1-pola',          difficulty: 2, sortOrder: 30, tags: ['patterns', 'geometry'] },

  // ── Grade 1: g1-bentuk (Bentuk & Simetri Dasar) ──────────────────────────
  // grades [0,1] / [1,2] / [1,2,3]
  'count-polygon-sides':            { subjectKey: 'g1-bentuk',        difficulty: 1, sortOrder: 10, tags: ['geometry'] },
  'symmetry-count':                 { subjectKey: 'g1-bentuk',        difficulty: 1, sortOrder: 20, tags: ['geometry', 'spatial'] },
  'block-count-3d':                 { subjectKey: 'g1-bentuk',        difficulty: 2, sortOrder: 30, tags: ['geometry', 'spatial'] },

  // ── Grade 1: g1-pecahan (Pecahan Dasar) ──────────────────────────────────
  // grades [1,2]
  'fraction-of-region':             { subjectKey: 'g1-pecahan',       difficulty: 1, sortOrder: 10, tags: ['fractions', 'geometry'] },

  // ── Grade 1: g1-jam-data (Jam, Turus & Diagram) ──────────────────────────
  // grades [1,2] / [1,2,3]
  'clock-read-time':                { subjectKey: 'g1-jam-data',      difficulty: 1, sortOrder: 10, tags: ['measurement'] },
  'tally-marks-count':              { subjectKey: 'g1-jam-data',      difficulty: 1, sortOrder: 20, tags: ['data', 'counting'] },
  'bar-chart-compare':              { subjectKey: 'g1-jam-data',      difficulty: 1, sortOrder: 30, tags: ['data'] },

  // ── Grade 1: g1-cerita (Soal Cerita Sederhana) ───────────────────────────
  // grades [1,2]
  'story-sum':                      { subjectKey: 'g1-cerita',        difficulty: 1, sortOrder: 10, tags: ['word-problem', 'arithmetic'] },
  'which-expression-equals':        { subjectKey: 'g1-cerita',        difficulty: 1, sortOrder: 20, tags: ['word-problem', 'arithmetic'] },
  'table-lookup-combine':           { subjectKey: 'g1-cerita',        difficulty: 1, sortOrder: 30, tags: ['word-problem', 'data'] },

  // ── Grade 2: g2-nilai-tempat (Nilai Tempat & Bilangan) ───────────────────
  // grades [2,3]
  'place-value':                    { subjectKey: 'g2-nilai-tempat',  difficulty: 1, sortOrder: 10, tags: ['place-value', 'arithmetic'] },
  'build-number-from-digit-clues':  { subjectKey: 'g2-nilai-tempat',  difficulty: 2, sortOrder: 20, tags: ['place-value', 'logic'] },
  'find-number-by-digit-sum':       { subjectKey: 'g2-nilai-tempat',  difficulty: 2, sortOrder: 30, tags: ['place-value', 'arithmetic'] },

  // ── Grade 2: g2-operasi (Operasi & Ekspresi Hitung) ──────────────────────
  // grades [2,3]
  'arithmetic-expression-eval':     { subjectKey: 'g2-operasi',       difficulty: 1, sortOrder: 10, tags: ['arithmetic'] },
  'alternating-chain-eval':         { subjectKey: 'g2-operasi',       difficulty: 2, sortOrder: 20, tags: ['arithmetic'] },
  'operator-fill':                  { subjectKey: 'g2-operasi',       difficulty: 2, sortOrder: 30, tags: ['arithmetic', 'logic'] },
  'custom-operation':               { subjectKey: 'g2-operasi',       difficulty: 2, sortOrder: 40, tags: ['arithmetic', 'logic'] },
  'mistaken-digit-correction':      { subjectKey: 'g2-operasi',       difficulty: 2, sortOrder: 50, tags: ['arithmetic', 'place-value'] },

  // ── Grade 2: g2-keliling-luas (Keliling & Luas) ──────────────────────────
  // grades [2,3]
  'shape-perimeter-square':         { subjectKey: 'g2-keliling-luas', difficulty: 1, sortOrder: 10, tags: ['geometry', 'measurement'] },
  'shape-perimeter-rectangle':      { subjectKey: 'g2-keliling-luas', difficulty: 1, sortOrder: 20, tags: ['geometry', 'measurement'] },
  'rectangle-area-grid':            { subjectKey: 'g2-keliling-luas', difficulty: 2, sortOrder: 30, tags: ['geometry', 'measurement'] },

  // ── Grade 2: g2-geometri (Geometri & Bangun Ruang) ───────────────────────
  // grades [2,3] / [1,2,3]
  'angle-type':                     { subjectKey: 'g2-geometri',      difficulty: 1, sortOrder: 10, tags: ['geometry'] },
  'same-figure-identify':           { subjectKey: 'g2-geometri',      difficulty: 1, sortOrder: 20, tags: ['geometry', 'spatial'] },
  'count-shapes-in-figure':         { subjectKey: 'g2-geometri',      difficulty: 2, sortOrder: 30, tags: ['geometry', 'counting'] },
  'dice-opposite-faces':            { subjectKey: 'g2-geometri',      difficulty: 2, sortOrder: 40, tags: ['geometry', 'spatial'] },
  'grid-path-steps':                { subjectKey: 'g2-geometri',      difficulty: 2, sortOrder: 50, tags: ['spatial', 'counting'] },

  // ── Grade 2: g2-pengukuran (Pengukuran & Skala) ──────────────────────────
  // grades [2,3]
  'unit-conversion':                { subjectKey: 'g2-pengukuran',    difficulty: 1, sortOrder: 10, tags: ['measurement'] },
  'clock-time-after':               { subjectKey: 'g2-pengukuran',    difficulty: 2, sortOrder: 20, tags: ['measurement'] },

  // ── Grade 2: g2-logika (Logika & Penalaran) ──────────────────────────────
  // grades [2,3]
  'odd-even-reasoning':             { subjectKey: 'g2-logika',        difficulty: 1, sortOrder: 10, tags: ['logic', 'number-theory'] },
  'divisibility-multiple-property': { subjectKey: 'g2-logika',        difficulty: 1, sortOrder: 20, tags: ['logic', 'number-theory'] },
  'which-might-be':                 { subjectKey: 'g2-logika',        difficulty: 2, sortOrder: 30, tags: ['logic'] },
  'assignment-cycle':               { subjectKey: 'g2-logika',        difficulty: 2, sortOrder: 40, tags: ['logic'] },
  'direction-orientation':          { subjectKey: 'g2-logika',        difficulty: 2, sortOrder: 50, tags: ['logic', 'spatial'] },

  // ── Grade 2: g2-uang-cerita (Uang & Soal Cerita) ─────────────────────────
  // grades [2,3] / [2]
  'money-shopping-change':          { subjectKey: 'g2-uang-cerita',   difficulty: 1, sortOrder: 10, tags: ['money', 'word-problem'] },
  'money-coins-total':              { subjectKey: 'g2-uang-cerita',   difficulty: 1, sortOrder: 20, tags: ['money', 'arithmetic'] },
  'legs-items-rate':                { subjectKey: 'g2-uang-cerita',   difficulty: 2, sortOrder: 30, tags: ['arithmetic', 'word-problem'] },
  'equivalent-fraction-fill':       { subjectKey: 'g2-uang-cerita',   difficulty: 2, sortOrder: 40, tags: ['fractions', 'number-theory'] },

  // ── Grade 2: g2-data (Diagram, Tabel & Data) ─────────────────────────────
  // grades [2,3] / [2]
  'venn-set-membership':            { subjectKey: 'g2-data',          difficulty: 2, sortOrder: 10, tags: ['data', 'logic'] },
  'net-progress-cycles':            { subjectKey: 'g2-data',          difficulty: 2, sortOrder: 20, tags: ['arithmetic', 'word-problem'] },

  // ── Grade 3: g3-perkalian (Perkalian, Faktor & Kelipatan) ────────────────
  // grades [3]
  'multiplication-small':           { subjectKey: 'g3-perkalian',     difficulty: 1, sortOrder: 10, tags: ['arithmetic', 'number-theory'] },
  'combination-product-sum':        { subjectKey: 'g3-perkalian',     difficulty: 2, sortOrder: 20, tags: ['arithmetic', 'number-theory'] },
  'perfect-square-search':          { subjectKey: 'g3-perkalian',     difficulty: 2, sortOrder: 30, tags: ['arithmetic', 'number-theory'] },
  'product-of-consecutive':         { subjectKey: 'g3-perkalian',     difficulty: 3, sortOrder: 40, tags: ['arithmetic', 'number-theory'] },

  // ── Grade 3: g3-bilangan (Bilangan & Pola Lanjut) ────────────────────────
  // grades [3] and pulled-up [2,3]
  'digit-frequency':                { subjectKey: 'g3-bilangan',      difficulty: 2, sortOrder: 10, tags: ['number-theory', 'arithmetic'] },
  'number-pyramid':                 { subjectKey: 'g3-bilangan',      difficulty: 2, sortOrder: 20, tags: ['number-theory', 'arithmetic'] },
  'sum-partition-split':            { subjectKey: 'g3-bilangan',      difficulty: 3, sortOrder: 30, tags: ['number-theory', 'arithmetic'] },
  'reverse-arithmetic-puzzle':      { subjectKey: 'g3-bilangan',      difficulty: 2, sortOrder: 40, tags: ['logic', 'arithmetic'] },

  // ── Grade 3: g3-geometri (Geometri Lanjut) ───────────────────────────────
  // grades [3] and pulled-up [2,3]
  'count-rectangles-grid':          { subjectKey: 'g3-geometri',      difficulty: 3, sortOrder: 10, tags: ['geometry', 'spatial'] },
  'perimeter-area-composed':        { subjectKey: 'g3-geometri',      difficulty: 2, sortOrder: 20, tags: ['geometry', 'measurement'] },
  'dice-net-fold':                  { subjectKey: 'g3-geometri',      difficulty: 2, sortOrder: 30, tags: ['geometry', 'spatial'] },

  // ── Grade 3: g3-logika (Logika & Strategi) ───────────────────────────────
  // grades [2,3]
  'maze-path-shortest':             { subjectKey: 'g3-logika',        difficulty: 2, sortOrder: 10, tags: ['spatial', 'logic'] },
  'truth-order-clues':              { subjectKey: 'g3-logika',        difficulty: 2, sortOrder: 20, tags: ['logic'] },
  'budget-selection':               { subjectKey: 'g3-logika',        difficulty: 2, sortOrder: 30, tags: ['money', 'logic'] },
  // Gap-fill concepts from the WMI drill concept map (2026-07).
  'solve-symbol-equations':         { subjectKey: 'g3-logika',        difficulty: 3, sortOrder: 50, tags: ['logic', 'arithmetic'] },
  'rank-computed-expressions':      { subjectKey: 'g2-operasi',       difficulty: 2, sortOrder: 60, tags: ['arithmetic'] },
  'calendar-day-reasoning':         { subjectKey: 'g3-pengukuran',    difficulty: 2, sortOrder: 30, tags: ['measurement', 'logic'] },
  'painted-cube-faces-count':       { subjectKey: 'g3-geometri',      difficulty: 3, sortOrder: 40, tags: ['geometry', 'spatial'] },
  'cryptarithmetic-addition':       { subjectKey: 'g3-bilangan',      difficulty: 3, sortOrder: 50, tags: ['number-theory', 'logic'] },
  'consecutive-integer-sum':        { subjectKey: 'g3-bilangan',      difficulty: 3, sortOrder: 60, tags: ['number-theory', 'patterns'] },
  'common-factor-shortcut':         { subjectKey: 'g3-perkalian',     difficulty: 2, sortOrder: 50, tags: ['arithmetic'] },
  'container-capacity-allocation':  { subjectKey: 'g3-cerita-multi',  difficulty: 2, sortOrder: 40, tags: ['word-problem', 'counting'] },
  'range-count-evaluate':           { subjectKey: 'g3-logika',        difficulty: 3, sortOrder: 40, tags: ['logic', 'arithmetic'] },

  // ── Grade 3: g3-cerita-multi (Soal Cerita Multi-langkah) ─────────────────
  // grades [2,3]
  'distance-rate-time':             { subjectKey: 'g3-cerita-multi',  difficulty: 2, sortOrder: 10, tags: ['measurement', 'word-problem'] },
  'lacking-money-shared':           { subjectKey: 'g3-cerita-multi',  difficulty: 2, sortOrder: 20, tags: ['money', 'word-problem'] },
  'rope-wraps-ratio':               { subjectKey: 'g3-cerita-multi',  difficulty: 3, sortOrder: 30, tags: ['word-problem', 'arithmetic'] },

  // ── Grade 3: g3-pengukuran (Pengukuran Lanjut) ───────────────────────────
  // grades [2,3] / [2]
  'weight-balance-word':            { subjectKey: 'g3-pengukuran',    difficulty: 1, sortOrder: 10, tags: ['measurement', 'logic'] },
  'scale-read':                     { subjectKey: 'g3-pengukuran',    difficulty: 2, sortOrder: 20, tags: ['measurement'] },

  // Grade-1 concepts mined from real WMI papers (2026-07).
  'sort-count-by-attribute': { subjectKey: 'g1-jam-data', difficulty: 2, sortOrder: 40, tags: ['data', 'counting'] },
  'count-many-objects': { subjectKey: 'g1-hitung', difficulty: 1, sortOrder: 10, tags: ['counting'] },
  'number-figure-rule': { subjectKey: 'g1-pola', difficulty: 2, sortOrder: 40, tags: ['patterns', 'arithmetic'] },
  'sequence-repair': { subjectKey: 'g1-pola', difficulty: 2, sortOrder: 50, tags: ['patterns'] },
  'length-measure-compare': { subjectKey: 'g1-jam-data', difficulty: 2, sortOrder: 50, tags: ['measurement'] },
  'balance-substitution': { subjectKey: 'g1-cerita', difficulty: 2, sortOrder: 40, tags: ['logic', 'measurement'] },
  'count-two-digit-numbers': { subjectKey: 'g1-hitung', difficulty: 2, sortOrder: 80, tags: ['place-value', 'counting'] },
  'transfer-to-equalize': { subjectKey: 'g1-tambah-kurang', difficulty: 2, sortOrder: 50, tags: ['word-problem', 'arithmetic'] },
  // Mined from the 1050-question WMI corpus (grades 1-3), July 2026.
  'ordinal-position-read': { subjectKey: 'g1-hitung', difficulty: 1, sortOrder: 90, tags: ['counting', 'spatial'] },
  'min-adjacent-swaps': { subjectKey: 'g1-pola', difficulty: 3, sortOrder: 60, tags: ['counting', 'logic'] },
  'book-sheet-pages': { subjectKey: 'g2-nilai-tempat', difficulty: 3, sortOrder: 60, tags: ['place-value', 'logic'] },
  'subset-sum-target': { subjectKey: 'g2-logika', difficulty: 2, sortOrder: 60, tags: ['counting', 'arithmetic'] },
  'comparison-chain-solve': { subjectKey: 'g3-cerita-multi', difficulty: 2, sortOrder: 60, tags: ['word-problem', 'arithmetic'] },
  'count-numbers-from-digits': { subjectKey: 'g3-bilangan', difficulty: 2, sortOrder: 65, tags: ['counting', 'place-value'] },
  'delete-digits-extremise': { subjectKey: 'g3-bilangan', difficulty: 3, sortOrder: 70, tags: ['place-value', 'logic'] },
  'digits-into-equation-fill': { subjectKey: 'g3-bilangan', difficulty: 3, sortOrder: 80, tags: ['place-value', 'arithmetic', 'logic'] },
  // Wave 2. Three concepts each asked for g1-bentuk sortOrder 40 (10/20/30 were
  // taken, so all three were right); they get 40/50/60. Same for the g3-logika
  // and g3-bilangan clashes below. `difficulty` here is capped at 3 by
  // curriculum.test.ts, so the four contest-difficulty-4 concepts carry 3 in
  // this table while taxonomy.ts keeps their real 4.
  'tile-fill-count': { subjectKey: 'g1-bentuk', difficulty: 2, sortOrder: 40, tags: ['geometry', 'measurement'] },
  'pieces-fill-region': { subjectKey: 'g1-bentuk', difficulty: 3, sortOrder: 50, tags: ['geometry', 'spatial'] },
  'views-of-solid': { subjectKey: 'g1-bentuk', difficulty: 3, sortOrder: 60, tags: ['geometry', 'spatial'] },
  'row-column-sum-grid': { subjectKey: 'g1-tambah-kurang', difficulty: 2, sortOrder: 60, tags: ['arithmetic', 'logic'] },
  'odd-one-out': { subjectKey: 'g1-pola', difficulty: 3, sortOrder: 70, tags: ['patterns', 'logic'] },
  'path-sum-optimize': { subjectKey: 'g2-geometri', difficulty: 3, sortOrder: 60, tags: ['spatial', 'logic'] },
  'latin-square-cage': { subjectKey: 'g3-logika', difficulty: 3, sortOrder: 60, tags: ['logic', 'counting'] },
  'map-route-distance': { subjectKey: 'g3-logika', difficulty: 2, sortOrder: 70, tags: ['spatial', 'logic'] },
  'mastermind-code-deduce': { subjectKey: 'g3-logika', difficulty: 3, sortOrder: 80, tags: ['logic'] },
  'visit-all-cells-path': { subjectKey: 'g3-logika', difficulty: 3, sortOrder: 90, tags: ['spatial', 'logic'] },
  'cryptarithmetic-multiplication': { subjectKey: 'g3-bilangan', difficulty: 3, sortOrder: 85, tags: ['number-theory', 'logic'] },
  'compare-fractions': { subjectKey: 'g3-bilangan', difficulty: 2, sortOrder: 90, tags: ['fractions'] },
  'growing-figure-nth-term': { subjectKey: 'g3-bilangan', difficulty: 3, sortOrder: 95, tags: ['patterns', 'counting'] },
}
