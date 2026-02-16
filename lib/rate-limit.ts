/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or Upstash
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  Array.from(rateLimitMap.entries()).forEach(([key, entry]) => {
    if (entry.resetAt < now) {
      rateLimitMap.delete(key);
    }
  });
}, 10 * 60 * 1000);

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
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param options - Rate limit configuration
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 5, window: 60000 } // Default: 5 requests per minute
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // If no entry exists or it's expired, create a new one
  if (!entry || entry.resetAt < now) {
    const resetAt = now + options.window;
    rateLimitMap.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: resetAt,
    };
  }

  // If limit is exceeded, deny the request
  if (entry.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: entry.resetAt,
    };
  }

  // Increment the counter
  entry.count++;
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - entry.count,
    reset: entry.resetAt,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}
