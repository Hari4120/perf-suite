import { z } from 'zod'

// Benchmark configuration validation schemas
export const benchmarkConfigSchema = z.object({
  url: z.string().url('Invalid URL format').optional(),
  type: z.enum(['latency', 'throughput', 'stress', 'load']),
  runs: z.number().int().min(1).max(100).default(10),
  timeout: z.number().int().min(1000).max(60000).default(10000),
})

export type BenchmarkConfigInput = z.infer<typeof benchmarkConfigSchema>
