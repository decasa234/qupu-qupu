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

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
