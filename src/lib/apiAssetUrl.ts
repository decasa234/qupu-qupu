const configuredApiBaseUrl =
  (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL?.trim() ||
  'http://localhost:3001/api'

export function resolveApiAssetUrl(src: string, apiBaseUrl: string): string {
  if (!src.startsWith('/api/')) return src

  const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, '')
  return `${normalizedBaseUrl}${src.slice('/api'.length)}`
}

export function resolveConfiguredApiAssetUrl(src: string): string {
  return resolveApiAssetUrl(src, configuredApiBaseUrl)
}
