/**
 * Security utilities for XSS protection and input sanitization
 */

/**
 * Sanitizes HTML to prevent XSS attacks by escaping dangerous characters
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates that a string contains only safe characters
 * Useful for usernames, codes, and other identifiers
 */
export function validateSafeString(
  input: string,
  options: { maxLength?: number; allowSpaces?: boolean } = {}
): boolean {
  const { maxLength = 100, allowSpaces = false } = options;
  
  if (!input || typeof input !== 'string') return false;
  if (input.length > maxLength) return false;
  
  const pattern = allowSpaces
    ? /^[a-zA-Z0-9\s\-_]+$/
    : /^[a-zA-Z0-9\-_]+$/;
  
  return pattern.test(input);
}

/**
 * Strips all HTML tags from a string
 */
export function stripHtml(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Validates URL to prevent protocol injection attacks
 */
export function validateUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

/**
 * Rate limiting helper - tracks request counts in memory
 * Note: For production, use Redis or database-based rate limiting
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private windowMs: number = 60000, private maxRequests: number = 100) {
    this.cleanupInterval = setInterval(() => this.cleanup(), this.windowMs);
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter((t: number) => now - t < this.windowMs);
    
    if (validTimestamps.length >= this.maxRequests) {
      this.requests.set(key, validTimestamps);
      return false;
    }
    
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.requests.entries());
    for (const [key, timestamps] of entries) {
      const validTimestamps = timestamps.filter((t: number) => now - t < this.windowMs);
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

// Export singleton rate limiter instance
export const rateLimiter = new RateLimiter();