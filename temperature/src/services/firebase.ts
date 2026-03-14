/**
 * Firebase Realtime Database — SSE streaming.
 *
 * Firebase SSE path field tells us what happened:
 *   path === "/"        → initial full snapshot  (all children as object)
 *   path === "/-Nkey"   → single new child added (data is the entry object)
 *   path === "/-Nkey/x" → field updated inside a child
 */

const DB_URL  = import.meta.env.VITE_FIREBASE_DATABASE_URL as string
const TOKEN   = import.meta.env.VITE_FIREBASE_TOKEN as string
const DB_PATH = (import.meta.env.VITE_FIREBASE_DB_PATH as string) ?? '/temperature_log'

export const IS_DUMMY_TOKEN = !TOKEN || TOKEN === 'YOUR_DATABASE_SECRET_HERE'

export type FirebaseEvent =
  | { kind: 'snapshot'; readings: unknown[] }  // initial load — all entries oldest→newest
  | { kind: 'new';      reading: unknown }      // single new entry just arrived

type Listener = (event: FirebaseEvent) => void

function sortedValues(obj: Record<string, unknown>): unknown[] {
  return Object.keys(obj).sort().map((k) => obj[k])
}

export function subscribeToTemperature(
  onEvent: Listener,
  onError?: (e: Event) => void,
): () => void {
  if (IS_DUMMY_TOKEN) {
    console.warn('[Firebase] No token — using simulated data.')
    return () => {}
  }

  const url = `${DB_URL}${DB_PATH}.json?auth=${TOKEN}`
  console.log('[Firebase] Connecting to:', `${DB_URL}${DB_PATH}.json?auth=***`)

  const es = new EventSource(url)

  es.addEventListener('put', (e: MessageEvent) => {
    try {
      const parsed = JSON.parse(e.data) as { path: string; data: unknown }
      const { path, data } = parsed

      if (path === '/') {
        // ── Initial full snapshot ─────────────────────────────────────────────
        if (!data) return
        if (typeof data === 'object' && 'temperature_c' in (data as object)) {
          // Listening directly on a single node
          onEvent({ kind: 'snapshot', readings: [data] })
        } else {
          // Collection — sort all children oldest → newest
          onEvent({ kind: 'snapshot', readings: sortedValues(data as Record<string, unknown>) })
        }
      } else {
        // ── Single new child: path is "/-NxyzKey" ────────────────────────────
        if (data && typeof data === 'object' && 'temperature_c' in (data as object)) {
          onEvent({ kind: 'new', reading: data })
        }
      }
    } catch (err) {
      console.error('[Firebase] Parse error (put):', err)
    }
  })

  // patch = field-level update inside an existing child — treat as new reading
  es.addEventListener('patch', (e: MessageEvent) => {
    try {
      const parsed = JSON.parse(e.data) as { path: string; data: unknown }
      const { data } = parsed
      if (!data || typeof data !== 'object') return
      if ('temperature_c' in (data as object)) {
        onEvent({ kind: 'new', reading: data })
      }
    } catch (err) {
      console.error('[Firebase] Parse error (patch):', err)
    }
  })

  es.addEventListener('cancel', (e) => {
    console.error('[Firebase] Stream cancelled — check token/rules', e)
    if (onError) onError(e)
  })

  es.onerror = (e) => {
    console.error('[Firebase] SSE error', e)
    if (onError) onError(e)
  }

  return () => es.close()
}
