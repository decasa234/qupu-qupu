import { extractYouTubeVideoId, buildYouTubeThumbnail } from '../lib/youtube.js'

export interface YouTubeVideoMetadata {
  videoId: string
  title: string
  description: string
  thumbnailUrl: string
  publishedAt: string | null
  channelTitle: string | null
}

interface YouTubeApiSnippet {
  title: string
  description: string
  publishedAt: string
  channelTitle: string
  thumbnails?: {
    maxres?: { url: string }
    standard?: { url: string }
    high?: { url: string }
    medium?: { url: string }
    default?: { url: string }
  }
}

interface YouTubeApiItem {
  id: string
  snippet: YouTubeApiSnippet
}

interface YouTubeApiResponse {
  items: YouTubeApiItem[]
}

export async function fetchYouTubeMetadata(input: string): Promise<YouTubeVideoMetadata> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not configured on the server')
  }

  const videoId = extractYouTubeVideoId(input)
  if (!videoId) {
    throw new Error('Invalid YouTube URL or video ID')
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(apiKey)}`

  const response = await fetch(apiUrl)
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`)
  }

  const data = (await response.json()) as YouTubeApiResponse
  const item = data.items?.[0]
  if (!item) {
    throw new Error('Video not found on YouTube (or unlisted/private)')
  }

  const thumbnails = item.snippet.thumbnails
  const thumbnailUrl =
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    buildYouTubeThumbnail(videoId)

  return {
    videoId,
    title: item.snippet.title,
    description: item.snippet.description ?? '',
    thumbnailUrl,
    publishedAt: item.snippet.publishedAt ?? null,
    channelTitle: item.snippet.channelTitle ?? null,
  }
}
