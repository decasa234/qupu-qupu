import { describe, expect, it } from 'vitest'
import { filterSortPaginateVideos, type CatalogCriteria, type CatalogVideoRow } from './adminVideoCatalog'

const v = (over: Partial<CatalogVideoRow & { id: string }>) => ({
  id: over.id ?? 't', title: over.title ?? 'T', youtubeVideoId: over.youtubeVideoId ?? 'yt',
  isPublished: over.isPublished ?? false, updatedAt: over.updatedAt ?? '2026-01-01',
  subject: over.subject ?? null, ageGroup: over.ageGroup ?? null,
})
const base: CatalogCriteria = { search: '', status: 'all', subjectId: '', ageGroupId: '', sort: 'updated', page: 1, pageSize: 2 }

describe('filterSortPaginateVideos', () => {
  const rows = [
    v({ id: 'a', title: 'Alpha', isPublished: true, updatedAt: '2026-03-01' }),
    v({ id: 'b', title: 'Bravo', isPublished: false, updatedAt: '2026-02-01' }),
    v({ id: 'c', title: 'Charlie', isPublished: true, updatedAt: '2026-01-01' }),
  ]
  it('filters by status', () => {
    const r = filterSortPaginateVideos(rows, { ...base, status: 'draft' })
    expect(r.total).toBe(1)
    expect(r.items.map((x) => x.id)).toEqual(['b'])
  })
  it('searches title case-insensitively', () => {
    const r = filterSortPaginateVideos(rows, { ...base, search: 'brav' })
    expect(r.items.map((x) => x.id)).toEqual(['b'])
  })
  it('sorts by title A-Z', () => {
    const r = filterSortPaginateVideos(rows, { ...base, sort: 'title', pageSize: 10 })
    expect(r.items.map((x) => x.id)).toEqual(['a', 'b', 'c'])
  })
  it('paginates and reports pageCount', () => {
    const r = filterSortPaginateVideos(rows, { ...base, sort: 'title', page: 2, pageSize: 2 })
    expect(r.items.map((x) => x.id)).toEqual(['c'])
    expect(r.pageCount).toBe(2)
    expect(r.total).toBe(3)
  })
})
