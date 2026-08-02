import type { Lang } from './makeTenSteps'
import {
  CHOICE_LABELS,
  coerceViewsParams,
  columnHeights,
  heightAt,
  maxHeightOf,
  optionFlats,
  projectVoxels,
  solidVoxels,
  viewFrame,
  type Flat,
  type Frame,
  type Solid,
  type ViewDir,
  type ViewsAsk,
  type ViewsParams,
  type Voxel,
} from '../views-of-solid'

// `views-of-solid`. A pile of cubes and its flat pictures. The storyboard has to
// beat one instinct: that a flat view is a headcount of the cubes. It is not —
// it is a shadow. So the pile is flattened ONE column (or one row) at a time,
// with the cubes that fall into that column lit up, and the child watches a
// short stack disappear behind a taller one instead of being told it does.
//
// The projection helpers are imported from ../views-of-solid, which mirrors
// api/services/wmi/concepts/views-of-solid — the same function draws the figure,
// builds the four options and lands the answer, so no beat can narrate a picture
// the question does not offer.

export type ViewsPhase = 'setup' | 'read' | 'truth' | 'eliminate' | 'result'

export interface ViewsBeat {
  phase: ViewsPhase
  caption: string
  /** Voxel keys `"x,y,z"` lit this beat. */
  lit: string[]
  /** Dim every cube that is not lit. */
  focus: boolean
  /** Grid cells of the view that have been decided so far. */
  shown: number[]
  /** Option index this beat is talking about, or −1. */
  option: number
  /** Options already crossed out. */
  crossed: number[]
  /** Cell of the talked-about option to ring red. */
  mismatch: number | null
  /** Plan row lit, front row = 0 (the numbered-plan ask). */
  planRow: number | null
  reveal: string | null
  hold: number
}

export interface ViewsStoryboard {
  ask: ViewsAsk
  view: ViewDir
  solid: Solid
  frame: Frame
  truth: Flat
  options: Flat[]
  answerLabel: string
  total: number
  layer: number
  layerCount: number
  rows: number[][]
  rowTotals: number[]
  answer: string
  steps: ViewsBeat[]
  finalIndex: number
}

const vk = (v: Voxel): string => `${v.x},${v.y},${v.z}`

function rowNames(depth: number, lang: Lang): string[] {
  if (depth >= 3) return lang === 'id' ? ['depan', 'tengah', 'belakang'] : ['front', 'middle', 'back']
  return lang === 'id' ? ['depan', 'belakang'] : ['front', 'back']
}

const VIEW_WORD: Record<ViewDir, { en: string; id: string }> = {
  front: { en: 'front', id: 'depan' },
  side: { en: 'right side', id: 'samping kanan' },
  top: { en: 'top', id: 'atas' },
}

function listOf(parts: string[], lang: Lang): string {
  if (parts.length <= 1) return parts.join('')
  const join = lang === 'id' ? ' dan ' : ' and '
  return `${parts.slice(0, -1).join(', ')}${join}${parts[parts.length - 1]}`
}

export function buildViewsOfSolidSteps(raw: unknown, lang: Lang): ViewsStoryboard {
  const p: ViewsParams = coerceViewsParams(raw)
  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const solid: Solid = { width: p.width, depth: p.depth, heights: p.heights }
  const cubes = solidVoxels(solid)
  const frame = viewFrame(solid, p.view)
  const truth = projectVoxels(cubes, p.view, frame)
  const options = p.ask === 'which-view' ? (optionFlats(solid, p.view, p.answerSlot) ?? []) : []
  const answerLabel = options.length > 0 ? CHOICE_LABELS[p.answerSlot] : ''

  const rows: number[][] = []
  for (let y = 0; y < solid.depth; y++) {
    const row: number[] = []
    for (let x = 0; x < solid.width; x++) row.push(heightAt(solid, x, y))
    rows.push(row)
  }
  const rowTotals = rows.map((row) => row.reduce((a, b) => a + b, 0))
  const total = rowTotals.reduce((a, b) => a + b, 0)
  const layer = Math.max(1, Math.min(maxHeightOf(solid), p.layer))
  const tallEnough: { x: number; y: number; height: number }[] = []
  for (let y = 0; y < solid.depth; y++) {
    for (let x = 0; x < solid.width; x++) {
      const height = heightAt(solid, x, y)
      if (height >= layer) tallEnough.push({ x, y, height })
    }
  }
  const layerCount = tallEnough.length
  const answer = p.ask === 'which-view' ? answerLabel : p.ask === 'cubes-per-layer' ? String(layerCount) : String(total)

  const steps: ViewsBeat[] = []
  type Draft = Partial<ViewsBeat> & { phase: ViewsPhase; caption: string }
  const push = (draft: Draft) => {
    steps.push({
      lit: [],
      focus: false,
      shown: [],
      option: -1,
      crossed: [],
      mismatch: null,
      planRow: null,
      reveal: null,
      hold: 2400,
      ...draft,
    })
  }

  const names = rowNames(solid.depth, lang)

  if (p.ask === 'which-view') {
    buildWhichView()
  } else if (p.ask === 'cubes-per-layer') {
    buildLayer()
  } else {
    buildCount()
  }

  function buildWhichView(): void {
    push({
      phase: 'setup',
      caption:
        p.view === 'top'
          ? T(
              `Looking down from the ${VIEW_WORD.top.en}, all you see is the floor: a square is filled when a cube stands on it. How tall that stack is does not show at all.`,
              `Dilihat dari ${VIEW_WORD.top.id}, yang terlihat hanya lantainya: sebuah kotak terisi kalau ada kubus berdiri di situ. Tinggi tumpukannya sama sekali tidak terlihat.`,
            )
          : T(
              `Seen from the ${VIEW_WORD[p.view].en}, stacks line up one behind another and squash into ONE column of squares — as tall as the tallest of them. A short stack can vanish behind a tall one.`,
              `Dilihat dari ${VIEW_WORD[p.view].id}, tumpukan-tumpukan berjajar dan menyatu jadi SATU kolom kotak — setinggi yang paling tinggi. Tumpukan pendek bisa hilang di balik yang tinggi.`,
            ),
      hold: 3200,
    })

    const shown: number[] = []
    if (p.view === 'top') {
      // One beat per depth row, back row first so the picture fills downward.
      for (let y = solid.depth - 1; y >= 0; y--) {
        const r = solid.depth - 1 - y
        for (let c = 0; c < frame.cols; c++) shown.push(r * frame.cols + c)
        const marks = rows[y].map((h) => (h > 0 ? T('filled', 'terisi') : T('empty', 'kosong')))
        push({
          phase: 'read',
          lit: cubes.filter((v) => v.y === y).map(vk),
          focus: true,
          shown: shown.slice(),
          caption: T(
            `The ${names[y]} row has stacks ${rows[y].join(', ')}, so its squares are ${marks.join(', ')} — a stack of 3 marks its square exactly like a stack of 1.`,
            `Baris ${names[y]} punya tumpukan ${rows[y].join(', ')}, jadi kotaknya ${marks.join(', ')} — tumpukan 3 menandai kotaknya persis seperti tumpukan 1.`,
          ),
        })
      }
    } else {
      const heights = columnHeights(truth)
      for (let c = 0; c < frame.cols; c++) {
        for (let r = 0; r < frame.rows; r++) shown.push(r * frame.cols + c)
        const behind =
          p.view === 'front'
            ? Array.from({ length: solid.depth }, (_, y) => heightAt(solid, c, y))
            : Array.from({ length: solid.width }, (_, x) => heightAt(solid, x, c))
        const lit =
          p.view === 'front' ? cubes.filter((v) => v.x === c) : cubes.filter((v) => v.y === c)
        push({
          phase: 'read',
          lit: lit.map(vk),
          focus: true,
          shown: shown.slice(),
          caption: T(
            `Column ${c + 1} has stack heights ${behind.join(' and ')}. From here they overlap, so the column shows ${heights[c]} ${heights[c] === 1 ? 'square' : 'squares'} — the height of the tallest one.`,
            `Kolom ke-${c + 1} punya tinggi tumpukan ${behind.join(' dan ')}. Dari sini semuanya bertumpang tindih, jadi kolom itu terlihat ${heights[c]} kotak — setinggi yang paling tinggi.`,
          ),
        })
      }
    }

    push({
      phase: 'truth',
      shown: shown.slice(),
      caption:
        p.view === 'top'
          ? T(
              `So the true ${VIEW_WORD.top.en} view is this picture. Now check the four choices against it, square by square.`,
              `Jadi tampak ${VIEW_WORD.top.id} yang benar adalah gambar ini. Sekarang cocokkan keempat pilihan dengan gambar itu, kotak demi kotak.`,
            )
          : T(
              `So the true view has columns ${columnHeights(truth).join(', ')} tall, left to right. Now check the four choices against it, column by column.`,
              `Jadi tampakan yang benar punya kolom setinggi ${columnHeights(truth).join(', ')} dari kiri ke kanan. Sekarang cocokkan keempat pilihan dengan itu, kolom demi kolom.`,
            ),
      hold: 3000,
    })

    const crossed: number[] = []
    options.forEach((option, i) => {
      if (CHOICE_LABELS[i] === answerLabel) return
      let cell: number | null = null
      for (let k = 0; k < truth.cells.length && cell === null; k++) {
        if (truth.cells[k] !== option.cells[k]) cell = k
      }
      if (cell === null) return
      const r = Math.floor(cell / frame.cols)
      const c = cell % frame.cols
      const optionFilled = option.cells[cell]
      const trueFilled = truth.cells[cell]
      const where =
        p.view === 'top'
          ? T(`the ${names[solid.depth - 1 - r]} row, column ${c + 1}`, `baris ${names[solid.depth - 1 - r]} kolom ke-${c + 1}`)
          : T(`column ${c + 1}, level ${frame.rows - r}`, `kolom ke-${c + 1} tingkat ke-${frame.rows - r}`)
      crossed.push(i)
      push({
        phase: 'eliminate',
        shown: shown.slice(),
        option: i,
        crossed: crossed.slice(),
        mismatch: cell,
        caption: T(
          `${CHOICE_LABELS[i]} has ${optionFilled ? 'a square' : 'no square'} at ${where}, but the pile ${trueFilled ? 'does put one there' : 'puts none there'}. Cross out ${CHOICE_LABELS[i]}.`,
          `${CHOICE_LABELS[i]} ${optionFilled ? 'punya kotak' : 'tidak punya kotak'} di ${where}, padahal tumpukan itu ${trueFilled ? 'memang menaruh kotak di situ' : 'tidak menaruh kotak di situ'}. Coret ${CHOICE_LABELS[i]}.`,
        ),
        hold: 2600,
      })
    })

    push({
      phase: 'result',
      shown: shown.slice(),
      option: p.answerSlot,
      crossed: crossed.slice(),
      caption: T(
        `Three pictures are gone, and ${answerLabel} matches on every square. The answer is ${answerLabel}.`,
        `Tiga gambar sudah tercoret, dan ${answerLabel} cocok di setiap kotak. Jawabannya ${answerLabel}.`,
      ),
      reveal: answerLabel,
      hold: 0,
    })
  }

  function buildLayer(): void {
    push({
      phase: 'setup',
      caption: T(
        `Every stack is solid from the floor up, so a stack ${layer} cubes tall fills layers 1 to ${layer}. A stack reaches layer ${layer} only if it is AT LEAST ${layer} cubes tall.`,
        `Setiap tumpukan padat dari lantai ke atas, jadi tumpukan setinggi ${layer} kubus mengisi tingkat 1 sampai ${layer}. Tumpukan sampai ke tingkat ke-${layer} hanya kalau tingginya PALING SEDIKIT ${layer} kubus.`,
      ),
      hold: 3200,
    })
    push({
      phase: 'read',
      lit: cubes.map(vk),
      caption: T(
        `Read every stack off the pile: ${rows.map((row, y) => `${names[y]} row ${row.join(', ')}`).join('; ')}.`,
        `Baca tinggi tiap tumpukan dari gambarnya: ${rows.map((row, y) => `baris ${names[y]} ${row.join(', ')}`).join('; ')}.`,
      ),
      hold: 3000,
    })
    push({
      phase: 'read',
      lit: cubes.filter((v) => v.z === layer - 1).map(vk),
      focus: true,
      caption: T(
        `Layer ${layer} is this one slice, ${layer - 1} ${layer - 1 === 1 ? 'cube' : 'cubes'} up from the floor. Only the lit cubes are in it.`,
        `Tingkat ke-${layer} adalah irisan ini, ${layer - 1} kubus di atas lantai. Hanya kubus yang menyala yang ada di tingkat itu.`,
      ),
      hold: 2800,
    })
    const reaching = tallEnough.map((st) =>
      T(`${names[st.y]} row column ${st.x + 1} (${st.height} tall)`, `baris ${names[st.y]} kolom ke-${st.x + 1} (tinggi ${st.height})`),
    )
    push({
      phase: 'truth',
      lit: cubes.filter((v) => v.z === layer - 1).map(vk),
      focus: true,
      caption: T(
        `The stacks at least ${layer} tall are ${listOf(reaching, lang)} — ${layerCount} of them, and each leaves exactly one cube in this slice.`,
        `Tumpukan yang tingginya paling sedikit ${layer} adalah ${listOf(reaching, lang)} — ada ${layerCount}, dan tiap-tiapnya meninggalkan tepat satu kubus di irisan ini.`,
      ),
      hold: 3200,
    })
    push({
      phase: 'result',
      lit: cubes.filter((v) => v.z === layer - 1).map(vk),
      focus: true,
      caption: T(
        `So layer ${layer} holds ${layerCount} cubes.`,
        `Jadi tingkat ke-${layer} berisi ${layerCount} kubus.`,
      ),
      reveal: String(layerCount),
      hold: 0,
    })
  }

  function buildCount(): void {
    push({
      phase: 'setup',
      caption: T(
        `A square here is a floor space, not a cube. The number written on it says how many cubes are stacked there, hidden one behind another from above.`,
        `Kotak di sini adalah tempat di lantai, bukan kubus. Angka di atasnya memberi tahu berapa kubus ditumpuk di situ, saling menutupi kalau dilihat dari atas.`,
      ),
      hold: 3200,
    })
    let running = 0
    for (let y = 0; y < solid.depth; y++) {
      running += rowTotals[y]
      push({
        phase: 'read',
        planRow: y,
        caption: T(
          `The ${names[y]} row: ${rows[y].join(' + ')} = ${rowTotals[y]} cubes. Running total ${running}.`,
          `Baris ${names[y]}: ${rows[y].join(' + ')} = ${rowTotals[y]} kubus. Sementara ini sudah ${running}.`,
        ),
        hold: 2600,
      })
    }
    push({
      phase: 'result',
      caption: T(
        `Add the rows: ${rowTotals.join(' + ')} = ${total} cubes altogether — more than the ${solid.width * solid.depth} squares, because most squares carry a whole stack.`,
        `Jumlahkan barisnya: ${rowTotals.join(' + ')} = ${total} kubus seluruhnya — lebih banyak dari ${solid.width * solid.depth} kotaknya, karena kebanyakan kotak memikul satu tumpukan penuh.`,
      ),
      reveal: String(total),
      hold: 0,
    })
  }

  return {
    ask: p.ask,
    view: p.view,
    solid,
    frame,
    truth,
    options,
    answerLabel,
    total,
    layer,
    layerCount,
    rows,
    rowTotals,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
