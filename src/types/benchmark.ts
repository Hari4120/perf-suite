export interface BenchmarkResult {
  id: string
  url: string
  timestamp: number
  benchmarkType: BenchmarkType
  results: number[]
  stats: BenchmarkStats | null
  metadata: {
    userAgent: string
    runs: number
    timeout: number
    concurrent?: number
    duration?: number
  }
}

export interface BenchmarkStats {
  min: number
  max: number
  avg: number
  median: number
  p95: number
  p99: number
  count: number
  failed: number
}

export type BenchmarkType = 'latency' | 'throughput' | 'stress' | 'load'

export interface BenchmarkConfig {
  url: string
  type: BenchmarkType
  runs: number
  timeout: number
  concurrent?: number
  duration?: number
}

export interface BenchmarkProgress {
  current: number
  total: number
  phase: 'preparing' | 'running' | 'analyzing' | 'complete'
  message?: string
}

export interface ExportData {
  results: BenchmarkResult[]
  exportedAt: number
  version: string
}