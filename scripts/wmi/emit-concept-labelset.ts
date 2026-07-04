import { writeFileSync } from 'node:fs'
import { ALL_SLUGS, getConcept } from '../../api/services/wmi/concepts/registry.js'
import { CONCEPT_TAGS } from '../../api/services/wmi/concepts/taxonomy.js'

const rows = ALL_SLUGS.map((slug) => {
  const c = getConcept(slug)!
  const t = CONCEPT_TAGS[slug]
  const desc = (c.meta.description_id ?? c.meta.name_en).replace(/\|/g, '/')
  return `| ${slug} | ${c.meta.name_en} | ${desc} | ${t.strand}/${t.topic} | ${t.difficulty} |`
})
const md = [
  '# Concept label set (classifier reference)',
  '',
  '| slug | name | description | strand/topic | difficulty |',
  '| --- | --- | --- | --- | --- |',
  ...rows,
  '',
].join('\n')
writeFileSync('docs/reference/_concept-labelset.md', md)
console.log(`wrote ${rows.length} concept labels`)
