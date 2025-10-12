import { NextResponse } from "next/server"
import type { BenchmarkConfig, BenchmarkResult, BenchmarkStats } from "@/types/benchmark"

function calculateStats(values: number[]): BenchmarkStats | null {
  const valid = values.filter(v => v > 0)
  if (valid.length === 0) return null
  
  const sorted = [...valid].sort((a, b) => a - b)
  const sum = valid.reduce((a, b) => a + b, 0)
  
  return {
    min: Math.min(...valid),
    max: Math.max(...valid),
    avg: sum / valid.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    count: valid.length,
    failed: values.length - valid.length
  }
}

async function runLatencyBenchmark(url: string, runs: number, timeout: number): Promise<number[]> {
  const results: number[] = []
  
  for (let i = 0; i < runs; i++) {
    const start = performance.now()
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      await fetch(url, { 
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'User-Agent': 'Performance-Benchmark-Suite/1.0'
        }
      })
      
      clearTimeout(timeoutId)
      const end = performance.now()
      results.push(end - start)
    } catch {
      results.push(-1) // Mark failed request
    }
  }
  
  return results
}

async function runThroughputBenchmark(url: string, concurrent: number, duration: number, timeout: number): Promise<number[]> {
  const results: number[] = []
  const endTime = Date.now() + duration * 1000
  
  const makeRequest = async (): Promise<number> => {
    const start = performance.now()
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      await fetch(url, { 
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'User-Agent': 'Performance-Benchmark-Suite/1.0'
        }
      })
      
      clearTimeout(timeoutId)
      const end = performance.now()
      return end - start
    } catch {
      return -1
    }
  }
  
  while (Date.now() < endTime) {
    const promises = Array(concurrent).fill(null).map(() => makeRequest())
    const batchResults = await Promise.all(promises)
    results.push(...batchResults)
  }
  
  return results
}

async function runStressBenchmark(url: string, maxConcurrent: number, duration: number, timeout: number): Promise<number[]> {
  const results: number[] = []
  const endTime = Date.now() + duration * 1000
  
  const makeRequest = async (): Promise<number> => {
    const start = performance.now()
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      await fetch(url, { 
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'User-Agent': 'Performance-Benchmark-Suite/1.0'
        }
      })
      
      clearTimeout(timeoutId)
      const end = performance.now()
      return end - start
    } catch {
      return -1
    }
  }
  
  let concurrent = 1
  
  while (Date.now() < endTime && concurrent <= maxConcurrent) {
    const promises = Array(concurrent).fill(null).map(() => makeRequest())
    const batchResults = await Promise.all(promises)
    results.push(...batchResults)
    
    // Gradually increase concurrency
    concurrent = Math.min(concurrent + 1, maxConcurrent)
  }
  
  return results
}

export async function POST(req: Request) {
  try {
    const config: BenchmarkConfig = await req.json()
    
    const { url, type, runs = 5, timeout = 10000, concurrent = 10, duration = 30 } = config
    
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }
    
    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }
    
    let results: number[] = []
    
    switch (type) {
      case 'latency':
        results = await runLatencyBenchmark(url, runs, timeout)
        break
      case 'throughput':
        results = await runThroughputBenchmark(url, concurrent || 10, duration || 30, timeout)
        break
      case 'stress':
        results = await runStressBenchmark(url, concurrent || 50, duration || 60, timeout)
        break
      case 'load':
        // Load test is similar to throughput but with higher concurrency
        results = await runThroughputBenchmark(url, concurrent || 20, duration || 60, timeout)
        break
      default:
        return NextResponse.json({ error: "Invalid benchmark type" }, { status: 400 })
    }
    
    const stats = calculateStats(results)
    
    const result: BenchmarkResult = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      timestamp: Date.now(),
      benchmarkType: type,
      results,
      stats,
      metadata: {
        userAgent: req.headers.get('user-agent') || 'Unknown',
        runs: type === 'latency' ? runs : results.length,
        timeout,
        ...(type !== 'latency' && { concurrent, duration })
      }
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Benchmark error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}