export type CatalogSort = 'updated' | 'title' | 'status'
export type CatalogStatus = 'all' | 'draft' | 'published'

export interface CatalogCriteria {
  search: string
  status: CatalogStatus
  subjectId: string
  ageGroupId: string
  sort: CatalogSort
  page: number
  pageSize: number
}

export interface CatalogPage<T> {
  items: T[]
  total: number
  page: number
  pageCount: number
}

/** Structural row type accepted by filterSortPaginateVideos. */
export interface CatalogVideoRow {
  title: string
  isPublished: boolean
  /** ISO date string used for 'updated' sort (desc). Not present on VideoCard; add at call-site. */
  updatedAt?: string | null
  youtubeVideoId?: string | null
  subject?: { id: string } | null
  ageGroup?: { id: string } | null
}

export function filterSortPaginateVideos<T extends CatalogVideoRow>(
  videos: T[],
  c: CatalogCriteria,
): CatalogPage<T> {
  const q = c.search.trim().toLowerCase()
  let rows = videos.filter((v) => {
    if (c.status === 'draft' && v.isPublished) return false
    if (c.status === 'published' && !v.isPublished) return false
    if (c.subjectId && v.subject?.id !== c.subjectId) return false
    if (c.ageGroupId && v.ageGroup?.id !== c.ageGroupId) return false
    if (q) {
      const hay = `${v.title} ${v.youtubeVideoId ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  rows = rows.slice().sort((a, b) => {
    if (c.sort === 'title') return a.title.localeCompare(b.title)
    if (c.sort === 'status') return Number(a.isPublished) - Number(b.isPublished)
    return (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '') // 'updated' desc
  })

  const total = rows.length
  const pageSize = Math.max(1, c.pageSize)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(1, c.page), pageCount)
  const start = (page - 1) * pageSize
  return { items: rows.slice(start, start + pageSize), total, page, pageCount }
}
