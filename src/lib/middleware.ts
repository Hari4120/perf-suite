import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting store (in-memory, use Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
}

export function rateLimit(options: RateLimitOptions = { windowMs: 60000, maxRequests: 100 }) {
  return (req: NextRequest) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()

    const userLimit = rateLimitStore.get(ip)

    if (!userLimit || now > userLimit.resetTime) {
      rateLimitStore.set(ip, {
        count: 1,
        resetTime: now + options.windowMs,
      })
      return null // No rate limit hit
    }

    if (userLimit.count >= options.maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((userLimit.resetTime - now) / 1000)),
            'X-RateLimit-Limit': String(options.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(userLimit.resetTime),
          }
        }
      )
    }

    userLimit.count++
    rateLimitStore.set(ip, userLimit)
    return null
  }
}

// Security headers middleware
export function securityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  )
  return response
}

// CORS configuration
export function corsHeaders(response: NextResponse, origin?: string) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')
  }

  return response
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute
