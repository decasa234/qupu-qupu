export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null

  try {
    const url = new URL(input)

    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1) || null
    }

    if (url.searchParams.get('v')) {
      return url.searchParams.get('v')
    }

    const pathParts = url.pathname.split('/').filter(Boolean)
    const embedIndex = pathParts.findIndex((part) => part === 'embed' || part === 'shorts')

    if (embedIndex >= 0 && pathParts[embedIndex + 1]) {
      return pathParts[embedIndex + 1]
    }
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input
    }
  }

  return null
}

export function buildYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export function buildYouTubeEmbed(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

export function buildYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function slugifyForBulk(
  title: string,
  youtubeVideoId: string,
): { base: string; withSuffix: string } {
  const base = slugify(title) || youtubeVideoId.toLowerCase()
  return {
    base,
    withSuffix: `${base}-${youtubeVideoId.toLowerCase()}`,
  }
}

const YOUTUBE_THUMBNAIL_HOSTS = new Set(['i.ytimg.com', 'img.youtube.com'])

export function validateHttpsThumbnailUrl(url: string): string {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('Thumbnail URL is not a valid URL')
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('Thumbnail URL must use https://')
  }
  if (!YOUTUBE_THUMBNAIL_HOSTS.has(parsed.hostname)) {
    throw new Error(`Thumbnail URL host ${parsed.hostname} is not in the YouTube CDN allowlist`)
  }
  return url
}

// YouTube returns durations in ISO 8601 (PT[h]H[m]M[s]S). Returns total
// seconds; returns 0 for malformed input so callers can use it as a sentinel.
export function parseIsoDurationSeconds(iso: string | null | undefined): number {
  if (!iso) return 0
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso)
  if (!match) return 0
  const [, hours, minutes, seconds] = match
  return (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60 + (Number(seconds) || 0)
}

// Anything <= this is treated as a YouTube Short.
export const SHORT_VIDEO_MAX_SECONDS = 120

export function sanitizeYouTubeText(text: string | null | undefined, maxLen: number): string {
  if (!text) return ''
  // Strip HTML tags (simple, sufficient for YouTube title/description metadata).
  const stripped = text.replace(/<[^>]*>/g, '')
  // Collapse whitespace runs to single spaces.
  const collapsed = stripped.replace(/\s+/g, ' ').trim()
  return collapsed.length > maxLen ? collapsed.slice(0, maxLen) : collapsed
}
