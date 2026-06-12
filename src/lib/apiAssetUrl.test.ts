import { describe, expect, it } from 'vitest'
import { resolveApiAssetUrl } from './apiAssetUrl'

describe('resolveApiAssetUrl', () => {
  it('resolves root-relative API assets against the configured API origin', () => {
    expect(
      resolveApiAssetUrl(
        '/api/public/wmi/figures/2022-final-g2-a-q1.jpg',
        'http://localhost:3001/api',
      ),
    ).toBe('http://localhost:3001/api/public/wmi/figures/2022-final-g2-a-q1.jpg')
  })

  it('keeps absolute asset URLs unchanged', () => {
    expect(
      resolveApiAssetUrl(
        'https://cdn.example.com/wmi/q1.jpg',
        'http://localhost:3001/api',
      ),
    ).toBe('https://cdn.example.com/wmi/q1.jpg')
  })
})
