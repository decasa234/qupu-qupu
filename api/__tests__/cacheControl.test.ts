import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { applyCacheControl } from '../middleware/cacheControl.js'

function createCacheControlApp() {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(applyCacheControl)

  app.get('/api/public/videos', (_req, res) => res.json({ success: true }))
  app.get('/api/public/videos/missing-slug', (_req, res) => res.status(404).json({ error: 'Not found' }))
  app.get('/api/me/progress', (_req, res) => res.json({ success: true }))
  app.get('/api/health', (_req, res) => res.json({ success: true }))
  app.post('/api/public/videos', (_req, res) => res.json({ success: true }))

  return app
}

describe('cache control middleware', () => {
  it('sets public cache headers for public video listings', async () => {
    const response = await request(createCacheControlApp()).get('/api/public/videos')

    expect(response.headers['cache-control']).toBe('public, max-age=60, stale-while-revalidate=300')
  })

  it('does not set public cache headers for public 404 responses', async () => {
    const response = await request(createCacheControlApp()).get('/api/public/videos/missing-slug')

    expect(response.status).toBe(404)
    expect(response.headers['cache-control']).toBe('no-store')
  })

  it('sets private no-store headers for member progress', async () => {
    const response = await request(createCacheControlApp()).get('/api/me/progress')

    expect(response.headers['cache-control']).toBe('private, no-store')
  })

  it('sets no-store headers for health checks', async () => {
    const response = await request(createCacheControlApp()).get('/api/health')

    expect(response.headers['cache-control']).toBe('no-store')
  })

  it('sets private no-store headers for non-GET requests', async () => {
    const response = await request(createCacheControlApp()).post('/api/public/videos')

    expect(response.headers['cache-control']).toBe('private, no-store')
  })
})
