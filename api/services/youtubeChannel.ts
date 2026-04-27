import { query, queryOne } from '../db.js'
import { buildYouTubeThumbnail } from '../lib/youtube.js'

const CACHE_TTL_SECONDS = 600 // 10 minutes
const PAGE_SIZE = 50
const HANDLE_PATTERN = /^@[A-Za-z0-9_.-]{1,50}$/

export interface ChannelItem {
  id: string
  title: string
  publishedAt: string | null
  thumbnailUrl: string
  alreadyImported: boolean
  available: boolean
  unavailableReason?: string
}

interface CachedPayload {
  items: ChannelItem[]
}

interface PlaylistItem {
  contentDetails: {
    videoId: string
    videoPublishedAt: string
  }
}

interface VideoSnippet {
  id: string
  snippet?: {
    title: string
    description: string
    publishedAt: string
    thumbnails?: {
      maxres?: { url: string }
      standard?: { url: string }
      high?: { url: string }
      medium?: { url: string }
      default?: { url: string }
    }
  }
}

let cachedPlaylistId: string | null = null

export class YouTubeUnavailableError extends Error {
  constructor(message = 'youtube_unavailable') {
    super(message)
    this.name = 'YouTubeUnavailableError'
  }
}

export class YouTubeMisconfiguredError extends Error {
  constructor(message = 'server_misconfigured') {
    super(message)
    this.name = 'YouTubeMisconfiguredError'
  }
}

export function validateChannelHandle(handle: string | undefined): void {
  if (!handle) return // resolveUploadsPlaylistId enforces the default
  if (!HANDLE_PATTERN.test(handle)) {
    throw new YouTubeMisconfiguredError(
      `YOUTUBE_CHANNEL_HANDLE must match /^@[A-Za-z0-9_.-]{1,50}$/`,
    )
  }
}

export async function resolveUploadsPlaylistId(): Promise<string> {
  if (cachedPlaylistId) return cachedPlaylistId

  const fromEnv = process.env.YOUTUBE_UPLOADS_PLAYLIST_ID?.trim()
  if (fromEnv) {
    cachedPlaylistId = fromEnv
    return fromEnv
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    throw new YouTubeMisconfiguredError('YOUTUBE_API_KEY is not configured')
  }

  const handle = process.env.YOUTUBE_CHANNEL_HANDLE?.trim() || '@qupuid'
  if (!HANDLE_PATTERN.test(handle)) {
    throw new YouTubeMisconfiguredError(
      `YOUTUBE_CHANNEL_HANDLE must match /^@[A-Za-z0-9_.-]{1,50}$/`,
    )
  }

  const url =
    `https://www.googleapis.com/youtube/v3/channels?forHandle=${encodeURIComponent(handle)}` +
    `&part=contentDetails&key=${encodeURIComponent(apiKey)}`

  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new YouTubeUnavailableError()
  }
  if (!response.ok) {
    throw new YouTubeUnavailableError()
  }
  const body = (await response.json()) as {
    items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }>
  }
  const playlistId = body.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
  if (!playlistId) {
    throw new YouTubeUnavailableError(`Could not resolve uploads playlist for handle ${handle}`)
  }
  cachedPlaylistId = playlistId
  return playlistId
}

async function fetchAllPlaylistItems(playlistId: string, apiKey: string): Promise<PlaylistItem[]> {
  const items: PlaylistItem[] = []
  let pageToken: string | undefined
  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
    url.searchParams.set('playlistId', playlistId)
    url.searchParams.set('part', 'contentDetails')
    url.searchParams.set('maxResults', '50')
    url.searchParams.set('key', apiKey)
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    let response: Response
    try {
      response = await fetch(url)
    } catch {
      throw new YouTubeUnavailableError()
    }
    if (!response.ok) {
      throw new YouTubeUnavailableError()
    }
    const body = (await response.json()) as {
      items?: PlaylistItem[]
      nextPageToken?: string
    }
    if (body.items) items.push(...body.items)
    pageToken = body.nextPageToken
  } while (pageToken)
  return items
}

async function fetchVideoSnippets(
  videoIds: string[],
  apiKey: string,
): Promise<Map<string, VideoSnippet>> {
  const result = new Map<string, VideoSnippet>()
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const url =
      `https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(batch.join(','))}` +
      `&part=snippet&key=${encodeURIComponent(apiKey)}`
    let response: Response
    try {
      response = await fetch(url)
    } catch {
      throw new YouTubeUnavailableError()
    }
    if (!response.ok) {
      throw new YouTubeUnavailableError()
    }
    const body = (await response.json()) as { items?: VideoSnippet[] }
    if (body.items) {
      for (const item of body.items) {
        result.set(item.id, item)
      }
    }
  }
  return result
}

function pickBestThumbnail(snippet: VideoSnippet['snippet'], videoId: string): string {
  const thumbs = snippet?.thumbnails
  return (
    thumbs?.maxres?.url ??
    thumbs?.standard?.url ??
    thumbs?.high?.url ??
    thumbs?.medium?.url ??
    thumbs?.default?.url ??
    buildYouTubeThumbnail(videoId)
  )
}

export async function listChannelVideosCached(): Promise<{
  playlistId: string
  items: ChannelItem[]
}> {
  const playlistId = await resolveUploadsPlaylistId()

  const cached = await queryOne<{ payload: CachedPayload }>(
    'SELECT payload FROM youtube_channel_cache WHERE playlist_id = $1 AND expires_at > NOW()',
    [playlistId],
  )
  if (cached) {
    return { playlistId, items: cached.payload.items }
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    throw new YouTubeMisconfiguredError('YOUTUBE_API_KEY is not configured')
  }

  const playlistItems = await fetchAllPlaylistItems(playlistId, apiKey)
  const allIds = playlistItems.map((it) => it.contentDetails.videoId)

  const snippets = allIds.length > 0 ? await fetchVideoSnippets(allIds, apiKey) : new Map()

  const existingRows = await query<{ youtube_video_id: string }>(
    'SELECT youtube_video_id FROM videos WHERE youtube_video_id = ANY($1::text[])',
    [allIds],
  )
  const importedIds = new Set(existingRows.map((row) => row.youtube_video_id))

  const items: ChannelItem[] = playlistItems.map((it) => {
    const id = it.contentDetails.videoId
    const snippet = snippets.get(id)
    if (!snippet?.snippet) {
      return {
        id,
        title: '(Unavailable on YouTube)',
        publishedAt: it.contentDetails.videoPublishedAt ?? null,
        thumbnailUrl: buildYouTubeThumbnail(id),
        alreadyImported: importedIds.has(id),
        available: false,
        unavailableReason: 'Video is private, unlisted, or deleted',
      }
    }
    return {
      id,
      title: snippet.snippet.title,
      publishedAt: snippet.snippet.publishedAt ?? null,
      thumbnailUrl: pickBestThumbnail(snippet.snippet, id),
      alreadyImported: importedIds.has(id),
      available: true,
    }
  })

  items.sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return ta - tb
  })

  const payload: CachedPayload = { items }
  await query(
    `
      INSERT INTO youtube_channel_cache (playlist_id, payload, fetched_at, expires_at)
      VALUES ($1, $2::jsonb, NOW(), NOW() + ($3 || ' seconds')::interval)
      ON CONFLICT (playlist_id)
      DO UPDATE SET
        payload = EXCLUDED.payload,
        fetched_at = NOW(),
        expires_at = EXCLUDED.expires_at
    `,
    [playlistId, JSON.stringify(payload), String(CACHE_TTL_SECONDS)],
  )

  return { playlistId, items }
}

export async function invalidateChannelListingCache(playlistId: string): Promise<void> {
  await query('DELETE FROM youtube_channel_cache WHERE playlist_id = $1', [playlistId])
}

export function paginateChannelItems(
  items: ChannelItem[],
  page: number,
  pageSize: number = PAGE_SIZE,
) {
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const start = (safePage - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    total,
  }
}
