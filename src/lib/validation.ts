import { z } from 'zod'

// Benchmark configuration validation schemas
export const benchmarkConfigSchema = z.object({
  url: z.string().url('Invalid URL format').optional(),
  type: z.enum(['latency', 'throughput', 'stress', 'load', 'speed-test', 'buffer-bloat', 'dns-test', 'network-quality']),
  runs: z.number().int().min(1).max(100).default(10),
  timeout: z.number().int().min(1000).max(60000).default(10000),
  concurrent: z.number().int().min(1).max(100).optional(),
  duration: z.number().int().min(5).max(300).optional(),
})

export type BenchmarkConfigInput = z.infer<typeof benchmarkConfigSchema>

// API response validation
export const benchmarkResultSchema = z.object({
  id: z.string(),
  url: z.string(),
  timestamp: z.number(),
  benchmarkType: z.enum(['latency', 'throughput', 'stress', 'load', 'speed-test', 'buffer-bloat', 'dns-test', 'network-quality']),
  results: z.array(z.number()),
  stats: z.object({
    min: z.number(),
    max: z.number(),
    avg: z.number(),
    median: z.number(),
    p95: z.number(),
    p99: z.number(),
    count: z.number(),
    failed: z.number(),
  }).nullable(),
  metadata: z.object({
    userAgent: z.string(),
    runs: z.number(),
    timeout: z.number(),
    concurrent: z.number().optional(),
    duration: z.number().optional(),
  }),
  networkData: z.object({
    downloadSpeed: z.number().optional(),
    uploadSpeed: z.number().optional(),
    latency: z.number().optional(),
    jitter: z.number().optional(),
    packetLoss: z.number().optional(),
    bufferBloat: z.number().optional(),
    dnsResolution: z.number().optional(),
    connectionType: z.string().optional(),
    isp: z.string().optional(),
    location: z.string().optional(),
    qualityScore: z.number().optional(),
  }).optional(),
})

export type ValidatedBenchmarkResult = z.infer<typeof benchmarkResultSchema>

// User authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
