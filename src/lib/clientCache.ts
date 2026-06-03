type CacheEntry<T> = {
  expiresAt: number
  value: T
}

const memoryCache = new Map<string, CacheEntry<unknown>>()
const storagePrefix = 'qupu:client-cache:'

type CacheParams = Record<string, unknown> | URLSearchParams | undefined

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.sessionStorage ?? null
  } catch {
    return null
  }
}

function getStorageValue(storage: Storage | null, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null
  } catch {
    return null
  }
}

function setStorageValue(storage: Storage | null, key: string, value: string): void {
  try {
    storage?.setItem(key, value)
  } catch {
    return
  }
}

function removeStorageValue(storage: Storage | null, key: string): void {
  try {
    storage?.removeItem(key)
  } catch {
    return
  }
}

function getStorageLength(storage: Storage | null): number {
  try {
    return storage?.length ?? 0
  } catch {
    return 0
  }
}

function getStorageKey(storage: Storage | null, index: number): string | null {
  try {
    return storage?.key(index) ?? null
  } catch {
    return null
  }
}

function serializeValue(value: unknown): string | null {
  if (value == null || value === '') return null
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

export function makeCacheKey(url: string, params?: CacheParams): string {
  const entries = params instanceof URLSearchParams
    ? Array.from(params.entries()).filter(([, value]) => value !== '')
    : Object.entries(params ?? {}).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.flatMap((item) => {
          const serializedValue = serializeValue(item)
          return serializedValue == null ? [] : [[key, serializedValue] as [string, string]]
        })
      }

      const serializedValue = serializeValue(value)
      return serializedValue == null ? [] : [[key, serializedValue] as [string, string]]
    })

  if (entries.length === 0) return url

  const searchParams = new URLSearchParams()
  for (const [key, value] of entries.sort(([leftKey, leftValue], [rightKey, rightValue]) => (
    leftKey === rightKey ? leftValue.localeCompare(rightValue) : leftKey.localeCompare(rightKey)
  ))) {
    searchParams.append(key, value)
  }

  return `${url}?${searchParams.toString()}`
}

export function getCachedValue<T>(key: string): T | null {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined
  if (entry) {
    if (Date.now() < entry.expiresAt) return entry.value
    memoryCache.delete(key)
  }

  const storage = getSessionStorage()
  const storageKey = `${storagePrefix}${key}`
  const rawValue = getStorageValue(storage, storageKey)
  if (!rawValue) return null

  try {
    const storedEntry = JSON.parse(rawValue) as CacheEntry<T>
    if (Date.now() < storedEntry.expiresAt) {
      memoryCache.set(key, storedEntry)
      return storedEntry.value
    }
  } catch {
    removeStorageValue(storage, storageKey)
    return null
  }

  removeStorageValue(storage, storageKey)
  return null
}

export function setCachedValue<T>(key: string, value: T, ttlMs: number): void {
  const entry: CacheEntry<T> = {
    expiresAt: Date.now() + ttlMs,
    value,
  }
  memoryCache.set(key, entry)

  setStorageValue(getSessionStorage(), `${storagePrefix}${key}`, JSON.stringify(entry))
}

export function clearClientCache(): void {
  memoryCache.clear()
  const storage = getSessionStorage()
  if (!storage) return

  for (let index = getStorageLength(storage) - 1; index >= 0; index -= 1) {
    const key = getStorageKey(storage, index)
    if (key?.startsWith(storagePrefix)) {
      removeStorageValue(storage, key)
    }
  }
}
