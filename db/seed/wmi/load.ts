import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const GLOSSARY_PATH = path.join(__dirname, 'glossary.json')
const PAPERS_DIR = path.join(__dirname, 'papers')

interface GlossaryTerm {
  slug: string
  term_en: string
  term_id: string
  definition_en: string
  definition_id: string
  example_en?: string
  example_id?: string
}

import type { PaperFile, PaperQuestion } from '../../../api/services/wmi/paperImport/types.js'

const MARKUP_RE = /\[\[([a-z0-9-]+)(?:\|[^\]]*)?\]\]/g

async function loadJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw) as T
}

function collectSlugs(text: string | undefined, out: Set<string>): void {
  if (!text) return
  for (const match of text.matchAll(MARKUP_RE)) {
    out.add(match[1])
  }
}

function validateQuestionSlugs(fileName: string, question: PaperQuestion, glossarySlugs: Set<string>): void {
  const referenced = new Set<string>()
  collectSlugs(question.body_en, referenced)
  collectSlugs(question.body_id, referenced)
  collectSlugs(question.hint_en, referenced)
  collectSlugs(question.hint_id, referenced)
  for (const choice of question.choices_en ?? []) collectSlugs(choice.text, referenced)
  for (const choice of question.choices_id ?? []) collectSlugs(choice.text, referenced)

  for (const slug of referenced) {
    if (!glossarySlugs.has(slug)) {
      throw new Error(
        `Unknown glossary slug "${slug}" referenced in ${fileName} question #${question.number}.`,
      )
    }
  }
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required')
  }

  const glossary = await loadJson<GlossaryTerm[]>(GLOSSARY_PATH)
  const glossarySlugs = new Set(glossary.map((term) => term.slug))
  const paperFiles = (await fs.readdir(PAPERS_DIR)).filter((f) => f.endsWith('.json')).sort()

  const papers = await Promise.all(
    paperFiles.map(async (fileName) => ({
      fileName,
      paper: await loadJson<PaperFile>(path.join(PAPERS_DIR, fileName)),
    })),
  )

  for (const { fileName, paper } of papers) {
    for (const question of paper.questions) {
      validateQuestionSlugs(fileName, question, glossarySlugs)
    }
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    for (const term of glossary) {
      await client.query(
        `
          INSERT INTO wmi_glossary_terms
            (slug, term_en, term_id, definition_en, definition_id, example_en, example_id, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          ON CONFLICT (slug) DO UPDATE SET
            term_en = EXCLUDED.term_en,
            term_id = EXCLUDED.term_id,
            definition_en = EXCLUDED.definition_en,
            definition_id = EXCLUDED.definition_id,
            example_en = EXCLUDED.example_en,
            example_id = EXCLUDED.example_id,
            updated_at = NOW()
        `,
        [
          term.slug,
          term.term_en,
          term.term_id,
          term.definition_en,
          term.definition_id,
          term.example_en ?? null,
          term.example_id ?? null,
        ],
      )
    }

    for (const { paper } of papers) {
      const paperRow = await client.query<{ id: string }>(
        `
          INSERT INTO wmi_papers
            (year, grade, round, variant, title, source_url, recommended_duration_min, question_count, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT (year, grade, round, variant) DO UPDATE SET
            title = EXCLUDED.title,
            source_url = EXCLUDED.source_url,
            recommended_duration_min = EXCLUDED.recommended_duration_min,
            question_count = EXCLUDED.question_count,
            updated_at = NOW()
          RETURNING id
        `,
        [
          paper.year,
          paper.grade,
          paper.round,
          paper.variant,
          paper.title,
          paper.source_url ?? null,
          paper.recommended_duration_min,
          paper.questions.length,
        ],
      )
      const paperId = paperRow.rows[0].id

      for (const question of paper.questions) {
        await client.query(
          `
            INSERT INTO wmi_questions
              (paper_id, number, body_en, body_id, answer_type, choices_en, choices_id, answer,
               figure_url, hint_en, hint_id, difficulty, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            ON CONFLICT (paper_id, number) DO UPDATE SET
              body_en = EXCLUDED.body_en,
              body_id = EXCLUDED.body_id,
              answer_type = EXCLUDED.answer_type,
              choices_en = EXCLUDED.choices_en,
              choices_id = EXCLUDED.choices_id,
              answer = EXCLUDED.answer,
              figure_url = EXCLUDED.figure_url,
              hint_en = EXCLUDED.hint_en,
              hint_id = EXCLUDED.hint_id,
              difficulty = EXCLUDED.difficulty,
              updated_at = NOW()
          `,
          [
            paperId,
            question.number,
            question.body_en,
            question.body_id,
            question.answer_type,
            question.choices_en ? JSON.stringify(question.choices_en) : null,
            question.choices_id ? JSON.stringify(question.choices_id) : null,
            question.answer,
            question.figure_url ?? null,
            question.hint_en ?? null,
            question.hint_id ?? null,
            question.difficulty ?? null,
          ],
        )
      }

      console.log(`Seeded ${paper.title} (${paper.questions.length} questions)`)
    }

    await client.query('COMMIT')
    console.log(`Done. ${glossary.length} glossary terms, ${papers.length} papers.`)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
