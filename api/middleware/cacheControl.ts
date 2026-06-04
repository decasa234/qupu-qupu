import type { NextFunction, Request, Response } from 'express'

const PUBLIC_CACHE = 'public, max-age=60, stale-while-revalidate=300'
const PRIVATE_NO_STORE = 'private, no-store'
const NO_STORE = 'no-store'

const publicPrefixes = ['/api/public', '/api/meta']
const privatePrefixes = [
  '/api/auth',
  '/api/me',
  '/api/users',
  '/api/admin',
  '/api/shop',
  '/api/analytics',
]

function startsWithPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

export function applyCacheControl(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== 'GET') {
    res.setHeader('Cache-Control', PRIVATE_NO_STORE)
    next()
    return
  }

  if (req.path === '/api/health') {
    res.setHeader('Cache-Control', NO_STORE)
    next()
    return
  }

  if (startsWithPrefix(req.path, publicPrefixes)) {
    const writeHead = res.writeHead.bind(res)

    res.writeHead = ((...args: Parameters<Response['writeHead']>) => {
      if (!res.headersSent) {
        res.setHeader('Cache-Control', res.statusCode >= 400 ? NO_STORE : PUBLIC_CACHE)
      }
      return writeHead(...args)
    }) as Response['writeHead']

    next()
    return
  }

  if (startsWithPrefix(req.path, privatePrefixes)) {
    res.setHeader('Cache-Control', PRIVATE_NO_STORE)
    next()
    return
  }

  res.setHeader('Cache-Control', NO_STORE)
  next()
}
