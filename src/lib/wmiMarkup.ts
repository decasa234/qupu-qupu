export type WmiMarkupSegment =
  | { type: 'text'; text: string }
  | { type: 'term'; slug: string; text: string }

const TOKEN_RE = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g

export function parseWmiMarkup(input: string): WmiMarkupSegment[] {
  const out: WmiMarkupSegment[] = []
  let lastIndex = 0

  for (const match of input.matchAll(TOKEN_RE)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      out.push({ type: 'text', text: input.slice(lastIndex, index) })
    }
    const slug = match[1]
    out.push({ type: 'term', slug, text: match[2] ?? slug })
    lastIndex = index + match[0].length
  }

  if (lastIndex < input.length) {
    out.push({ type: 'text', text: input.slice(lastIndex) })
  }

  return out
}

export function collectWmiMarkupSlugs(input: string): string[] {
  return parseWmiMarkup(input)
    .filter((segment): segment is Extract<WmiMarkupSegment, { type: 'term' }> => segment.type === 'term')
    .map((segment) => segment.slug)
}
