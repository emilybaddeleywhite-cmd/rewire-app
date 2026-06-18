// lib/rateLimit.js
// Serverless-safe rate limiting backed by Supabase — no Redis or extra accounts.
// All Vercel function instances share the same table, so limits hold across cold starts.
// Requires the rate_limits table from migration.sql.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

/**
 * @param {string} key            Unique bucket, e.g. `audio:${userId}` or `contact:${ip}`
 * @param {number} limit          Max actions allowed within the window
 * @param {number} windowSeconds  Rolling window length in seconds
 * @returns {Promise<{ allowed: boolean }>}
 */
export async function checkRateLimit(key, limit, windowSeconds) {
  try {
    const since = new Date(Date.now() - windowSeconds * 1000).toISOString()

    const { count, error } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('key', key)
      .gt('created_at', since)

    if (error) {
      // Fail OPEN on infrastructure errors — never block a real user because the
      // limiter itself is down. Credits remain the hard cap on paid endpoints.
      console.error('Rate limit check failed:', error.message)
      return { allowed: true }
    }

    if ((count ?? 0) >= limit) return { allowed: false }

    await supabase.from('rate_limits').insert({ key })

    // Opportunistic housekeeping (~5% of calls): drop rows older than 24h so the
    // table never grows unbounded, without adding latency to every request.
    if (Math.random() < 0.05) {
      const cutoff = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      supabase.from('rate_limits').delete().lt('created_at', cutoff).then(() => {}, () => {})
    }

    return { allowed: true }
  } catch (err) {
    console.error('Rate limit error:', err?.message)
    return { allowed: true }
  }
}

/** Best-effort client IP from a Next.js API request (for un-authenticated routes). */
export function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}
