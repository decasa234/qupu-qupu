# Performance Cache and Cookie Consent Design

## Goal

Improve perceived load speed while keeping user consent clear and limited to non-essential cookies. Essential performance caching should stay enabled by default because it does not require consent and directly improves page loads.

## Scope

- Add cache headers for safe, cacheable API responses.
- Keep authenticated and admin responses private or uncached.
- Add lightweight client-side caching for repeat public/meta reads where useful.
- Add a QUPU-styled cookie consent banner for analytics/preferences only.
- Do not move authentication from localStorage to cookies in this change.

## Recommended Approach

Use a layered approach:

1. Server cache headers for public read endpoints and immutable built assets.
2. Client session cache for public metadata/catalog requests to avoid duplicate network work during a visit.
3. Cookie consent UI that asks before analytics/preferences cookies are enabled, while performance cache remains always on.

This gives immediate speed wins without changing auth behavior or blocking essential caching behind a consent prompt.

## Server Behavior

Add a small cache middleware in the API layer.

- Public/meta endpoints get `Cache-Control` headers with short stale windows.
- Authenticated member/admin endpoints stay `private, no-store` unless explicitly proven safe.
- Health endpoints can use `no-store`.
- Error responses should not be cached.

Suggested policy:

- `/api/public`, `/api/public/wmi`, `/api/meta`: `public, max-age=60, stale-while-revalidate=300`.
- `/api/auth`, `/api/me`, `/api/users`, `/api/admin`, `/api/shop`: `private, no-store` by default.

## Client Behavior

Add a small cache helper for GET requests that are public and stable during a session.

- Cache only successful GET responses.
- Use request URL + params as the key.
- Use short TTLs and allow bypass for endpoints that must be fresh.
- Never cache authenticated user-specific data in shared client helpers.

Good candidates:

- Public metadata.
- Public video lists/details.
- Public WMI lookup data.

## Cookie Consent Behavior

Add a public/member-facing QUPU-styled banner.

- Explain that essential performance cache is always on.
- Ask permission only for analytics/preferences cookies.
- Store consent choice locally.
- Default to analytics/preferences off until accepted.
- Include Accept and Decline actions.
- Keep styling consistent with QUPU public UI: rounded card, peach hard-shadow, brand-blue/orange buttons.

Suggested text:

> Kami memakai cache penting supaya QUPU lebih cepat. Untuk cookie analitik dan preferensi tambahan, boleh kami aktifkan?

## Data Flow

1. User visits the site.
2. Essential browser/server caching improves static and public API loads automatically.
3. If no consent choice exists, the cookie banner appears.
4. If accepted, analytics/preferences cookies may be enabled.
5. If declined, analytics/preferences stay disabled; performance cache still works.

## Error Handling

- If localStorage is unavailable, silently treat consent as not granted and keep the banner usable for the current session.
- If cached client data parsing fails, discard the entry and refetch.
- If server cache policy is missing for a route, default to safe `no-store` for private endpoints.

## Testing and Verification

- Run `npm run check`.
- Run `npm run lint`.
- Manually verify public pages still load.
- Inspect response headers for public and private endpoints.
- Confirm the banner appears once, accepts, declines, and does not block performance cache.

## Out of Scope

- Service worker offline caching.
- Moving auth tokens into cookies.
- CDN-specific configuration.
- Analytics provider integration beyond consent gating.
