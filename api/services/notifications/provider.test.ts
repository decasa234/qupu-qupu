// api/services/notifications/provider.test.ts
//
// Channel selection (pure, no network): email is the default, and the
// Fonnte-shaped WhatsApp stub can never activate without its envs.

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getNotificationProvider, whatsappProvider } from './provider.js'

const ENV_KEYS = ['NOTIFICATION_CHANNEL', 'WHATSAPP_TOKEN', 'WHATSAPP_SENDER'] as const
let saved: Record<string, string | undefined>

beforeEach(() => {
  saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]))
  for (const key of ENV_KEYS) delete process.env[key]
})

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key]
    else process.env[key] = saved[key]
  }
})

describe('getNotificationProvider', () => {
  it('defaults to the email provider when NOTIFICATION_CHANNEL is unset', () => {
    const provider = getNotificationProvider()
    expect(typeof provider.send).toBe('function')
  })

  it('refuses the whatsapp channel without WHATSAPP_TOKEN/WHATSAPP_SENDER', () => {
    process.env.NOTIFICATION_CHANNEL = 'whatsapp'
    expect(() => getNotificationProvider()).toThrow(/WHATSAPP_TOKEN or WHATSAPP_SENDER/)
  })

  it('whatsapp stub constructs with envs but send() is not implemented', async () => {
    process.env.WHATSAPP_TOKEN = 'token'
    process.env.WHATSAPP_SENDER = '628123'
    const provider = whatsappProvider()
    await expect(provider.send('628', 'subject', '<p>x</p>')).rejects.toThrow(/stub/)
  })
})
