/**
 * Simple in-memory rate limiter for API routes
 * For production with multiple servers, consider using Redis with Upstash
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number;
  /**
   * Time window in milliseconds
   */
  window: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limit based on IP address or user ID
 *
 * @param identifier - IP address or user ID to rate limit
 * @param options - Rate limit configuration
 * @returns Result indicating if request is allowed
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 10, window: 60000 } // 10 requests per minute default
): RateLimitResult {
  const now = Date.now();
  const key = `rate_limit:${identifier}`;

  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + options.window,
    };

    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: store[key].resetTime,
    };
  }

  store[key].count++;

  const remaining = Math.max(0, options.limit - store[key].count);
  const success = store[key].count <= options.limit;

  return {
    success,
    limit: options.limit,
    remaining,
    reset: store[key].resetTime,
  };
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  // Check common headers for IP (Vercel, Cloudflare, etc.)
  const headers = request.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}

/**
 * Common rate limit presets
 */
export const RATE_LIMITS = {
  // Very strict - for expensive operations
  STRICT: { limit: 5, window: 60000 }, // 5 per minute

  // Standard - for most API routes
  STANDARD: { limit: 30, window: 60000 }, // 30 per minute

  // Lenient - for read-only operations
  LENIENT: { limit: 100, window: 60000 }, // 100 per minute

  // Auth - for login/signup
  AUTH: { limit: 5, window: 300000 }, // 5 per 5 minutes
} as const;
