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
  networkData?: NetworkTestData
}

export interface NetworkTestData {
  downloadSpeed?: number // Mbps
  uploadSpeed?: number // Mbps
  latency?: number // ms
  jitter?: number // ms
  packetLoss?: number // percentage
  bufferBloat?: number // ms
  dnsResolution?: number // ms
  connectionType?: string
  isp?: string
  location?: string
  qualityScore?: number // 0-100
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

export type BenchmarkType = 'latency' | 'throughput' | 'stress' | 'load' | 'speed-test' | 'buffer-bloat' | 'dns-test' | 'network-quality'

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