import { describe, expect, test } from 'vitest'
import { ALL_SLUGS } from './registry.js'
import {
  CONCEPT_TAGS,
  SHORT_ID_BY_SLUG,
  STRANDS,
  STRAND_ORDER,
  TOPICS,
  topicsForStrand,
  difficultyBand,
} from './taxonomy.js'

const TOPIC_CODES = new Set(TOPICS.map((t) => t.code))
const STRAND_CODES = new Set(STRANDS.map((s) => s.code))

describe('concept taxonomy', () => {
  test('every registered concept has tags', () => {
    for (const slug of ALL_SLUGS) {
      expect(CONCEPT_TAGS[slug], `missing tags for ${slug}`).toBeDefined()
    }
  })

  test('no stale tag entries — every tag key is a real slug', () => {
    const slugs = new Set<string>(ALL_SLUGS)
    for (const slug of Object.keys(CONCEPT_TAGS)) {
      expect(slugs.has(slug), `stale tag entry: ${slug}`).toBe(true)
    }
  })

  test('every concept tag is internally valid', () => {
    for (const [slug, tag] of Object.entries(CONCEPT_TAGS)) {
      expect(STRAND_CODES.has(tag.strand), `${slug}: bad strand ${tag.strand}`).toBe(true)
      expect(TOPIC_CODES.has(tag.topic), `${slug}: bad topic ${tag.topic}`).toBe(true)
      const topic = TOPICS.find((t) => t.code === tag.topic)!
      expect(topic.strand, `${slug}: topic ${tag.topic} not in strand ${tag.strand}`).toBe(tag.strand)
      expect(tag.difficulty).toBeGreaterThanOrEqual(1)
      expect(tag.difficulty).toBeLessThanOrEqual(5)
    }
  })

  test('every registered concept has a frozen short id', () => {
    for (const slug of ALL_SLUGS) {
      expect(SHORT_ID_BY_SLUG[slug], `missing short_id for ${slug}`).toBeTruthy()
    }
  })

  test('short ids are unique', () => {
    const seen = new Map<string, string>()
    for (const [slug, code] of Object.entries(SHORT_ID_BY_SLUG)) {
      expect(seen.has(code), `duplicate short id ${code}`).toBe(false)
      seen.set(code, slug)
    }
  })

  test('strands match STRAND_ORDER and every strand has topics', () => {
    expect(STRANDS.map((s) => s.code)).toEqual([...STRAND_ORDER])
    for (const code of STRAND_ORDER) {
      expect(topicsForStrand(code).length, `strand ${code} has no topics`).toBeGreaterThan(0)
    }
  })

  test('difficultyBand collapses 1-5 into easy/medium/hard', () => {
    expect(([1, 2, 3, 4, 5] as const).map((d) => difficultyBand(d))).toEqual([
      'easy',
      'easy',
      'medium',
      'hard',
      'hard',
    ])
  })
})
