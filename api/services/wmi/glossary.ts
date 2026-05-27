import { query } from '../../db.js'

export interface WmiGlossaryTerm {
  id: string
  slug: string
  term_en: string
  term_id: string
  definition_en: string
  definition_id: string
  example_en: string | null
  example_id: string | null
}

export async function listWmiGlossaryTerms(): Promise<WmiGlossaryTerm[]> {
  return query<WmiGlossaryTerm>(
    `
      SELECT id, slug, term_en, term_id, definition_en, definition_id, example_en, example_id
      FROM wmi_glossary_terms
      ORDER BY term_en ASC
    `,
  )
}
