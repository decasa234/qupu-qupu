/**
 * Figure-presence scanner for WMI past-paper sources.
 *
 * Pre-pass for the wmi-paper-conversion skill (Phase 1 figure copy + Phase 2
 * needsVisual triage): tells you, per question, whether the OCR'd full.md has
 * a stem figure, option figures, or only a "text_image" (an image that is
 * really typeset text, e.g. vertical arithmetic) — so illustrator/animator
 * agents are only dispatched where a visual actually exists or is implied.
 *
 * Usage:
 *   npm run wmi:scan-figures -- "wmiPastPaper/2020 WMI Final G01 Paper A" "wmiPastPaper/2020 WMI Final G01 Paper B"
 *
 * Output: one JSON object per folder on stdout + a human summary on stderr.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

interface QuestionScan {
  number: number
  stemPreview: string
  stemImages: string[]
  optionImages: string[]
  textImageBlocks: number
  naturalImageBlocks: number
  /** true when the stem references at least one real (non-text) image */
  hasStemFigure: boolean
}

const IMG_RE = /!\[[^\]]*\]\((images\/[^)]+)\)/g
const Q_START_RE = /^(\d{1,2})\)\s*/
const OPTION_RE = /^\(([A-D])\)/

function scanFolder(dir: string): { dir: string; questions: QuestionScan[] } {
  const mdPath = join(dir, 'full.md')
  if (!existsSync(mdPath)) throw new Error(`no full.md in ${dir}`)
  const lines = readFileSync(mdPath, 'utf8').split(/\r?\n/)

  const questions: QuestionScan[] = []
  let cur: QuestionScan | null = null
  let inOptions = false
  let inDetails = false
  let detailsKind = ''

  for (const line of lines) {
    const qm = line.match(Q_START_RE)
    if (qm) {
      cur = {
        number: Number(qm[1]),
        stemPreview: line.replace(Q_START_RE, '').slice(0, 80),
        stemImages: [],
        optionImages: [],
        textImageBlocks: 0,
        naturalImageBlocks: 0,
        hasStemFigure: false,
      }
      questions.push(cur)
      inOptions = false
      continue
    }
    if (!cur) continue

    if (line.includes('<details>')) { inDetails = true; detailsKind = ''; continue }
    if (line.includes('</details>')) {
      if (detailsKind === 'text_image') cur.textImageBlocks++
      if (detailsKind === 'natural_image') cur.naturalImageBlocks++
      inDetails = false
      continue
    }
    if (inDetails) {
      const sm = line.match(/<summary>(\w+)<\/summary>/)
      if (sm) detailsKind = sm[1]
      continue
    }

    if (OPTION_RE.test(line)) inOptions = true

    for (const m of line.matchAll(IMG_RE)) {
      ;(inOptions ? cur.optionImages : cur.stemImages).push(m[1])
    }
    if (!inOptions && !cur.stemPreview && line.trim()) {
      cur.stemPreview = line.trim().slice(0, 80)
    }
  }

  for (const q of questions) {
    // a stem image that is ONLY a text_image is not a figure to redraw
    q.hasStemFigure = q.stemImages.length > q.textImageBlocks
  }
  return { dir, questions }
}

const dirs = process.argv.slice(2)
if (!dirs.length) {
  console.error('usage: tsx db/seed/wmi/scan-figures.ts <paper-folder> [...]')
  process.exit(1)
}

const results = dirs.map(scanFolder)
console.log(JSON.stringify(results, null, 2))

for (const r of results) {
  const figs = r.questions.filter((q) => q.hasStemFigure)
  const opts = r.questions.filter((q) => q.optionImages.length > 0)
  const txt = r.questions.filter((q) => q.textImageBlocks > 0)
  console.error(
    `${r.dir}: ${r.questions.length} questions | stem figure: ${figs.map((q) => q.number).join(',') || '-'} | option images: ${opts.map((q) => q.number).join(',') || '-'} | text-as-image: ${txt.map((q) => q.number).join(',') || '-'}`,
  )
}
