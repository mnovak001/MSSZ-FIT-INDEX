/**
 * CSRF Protection utilities for Server Actions
 */

// Simple CSRF token generation and validation
// Note: For production, consider using a dedicated library like csurf
import { randomBytes, timingSafeEqual } from 'crypto';

const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a secure CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Validate a CSRF token using constant-time comparison
 */
export function validateCsrfToken(token: string | null, expectedToken: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  if (token.length !== expectedToken.length) {
    return false;
  }
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    const buffer1 = Buffer.from(token);
    const buffer2 = Buffer.from(expectedToken);
    return timingSafeEqual(buffer1, buffer2);
  } catch {
    return false;
  }
}

/**
 * Check if the request origin is allowed (prevents cross-origin requests)
 */
export function checkOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) {
    // Requests without origin might be from browsers that don't send it
    // or from non-browser clients - handle based on your security needs
    return true;
  }
  
  return allowedOrigins.some(allowed => {
    try {
      const originUrl = new URL(origin);
      const allowedUrl = new URL(allowed);
      return originUrl.origin === allowedUrl.origin;
    } catch {
      return false;
    }
  });
}

/**
 * Sanitize and validate input data
 */
export function sanitizeInput(value: unknown, options: { 
  maxLength?: number; 
  allowHtml?: boolean;
  trim?: boolean;
} = {}): string {
  const { maxLength = 10000, allowHtml = false, trim = true } = options;
  
  if (typeof value !== 'string') {
    return '';
  }
  
  let result = value;
  
  if (trim) {
    result = result.trim();
  }
  
  if (!allowHtml) {
    // Remove HTML tags
    result = result.replace(/<[^>]*>/g, '');
  }
  
  if (result.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }
  
  return result;
}

/**
 * Rate limiting for API endpoints
 */
export class ApiRateLimiter {
  private store: Map<string, { count: number; resetTime: number }>;
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60 * 1000 // 1 minute
  ) {
    this.store = new Map();
  }
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.store.get(key);
    
    if (!record) {
      this.store.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (now > record.resetTime) {
      // Reset window
      this.store.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (record.count >= this.maxRequests) {
      return false;
    }
    
    record.count += 1;
    return true;
  }
  
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.store.entries());
    for (const [key, record] of entries) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Export singleton instance
export const apiRateLimiter = new ApiRateLimiter();

// Start cleanup interval
setInterval(() => apiRateLimiter.cleanup(), 5 * 60 * 1000); // Clean up every 5 minutes