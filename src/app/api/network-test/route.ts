import { NextRequest, NextResponse } from 'next/server'
import type { BenchmarkResult, NetworkTestData } from '@/types/benchmark'

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()
    
    const id = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const timestamp = Date.now()
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    
    let result: BenchmarkResult
    let networkData: NetworkTestData = {}
    
    switch (type) {
      case 'speed-test':
        networkData = await performSpeedTest()
        result = {
          id,
          url: 'Speed Test',
          timestamp,
          benchmarkType: 'speed-test',
          results: [networkData.downloadSpeed || 0, networkData.uploadSpeed || 0],
          stats: {
            min: Math.min(networkData.downloadSpeed || 0, networkData.uploadSpeed || 0),
            max: Math.max(networkData.downloadSpeed || 0, networkData.uploadSpeed || 0),
            avg: ((networkData.downloadSpeed || 0) + (networkData.uploadSpeed || 0)) / 2,
            median: ((networkData.downloadSpeed || 0) + (networkData.uploadSpeed || 0)) / 2,
            p95: Math.max(networkData.downloadSpeed || 0, networkData.uploadSpeed || 0),
            p99: Math.max(networkData.downloadSpeed || 0, networkData.uploadSpeed || 0),
            count: 2,
            failed: 0
          },
          metadata: {
            userAgent,
            runs: 1,
            timeout: 30000
          },
          networkData
        }
        break
        
      case 'buffer-bloat':
        networkData = await performBufferBloatTest()
        result = {
          id,
          url: 'Buffer Bloat Test',
          timestamp,
          benchmarkType: 'buffer-bloat',
          results: [networkData.bufferBloat || 0],
          stats: {
            min: networkData.bufferBloat || 0,
            max: networkData.bufferBloat || 0,
            avg: networkData.bufferBloat || 0,
            median: networkData.bufferBloat || 0,
            p95: networkData.bufferBloat || 0,
            p99: networkData.bufferBloat || 0,
            count: 1,
            failed: 0
          },
          metadata: {
            userAgent,
            runs: 1,
            timeout: 15000
          },
          networkData
        }
        break
        
      case 'dns-test':
        networkData = await performDNSTest()
        result = {
          id,
          url: 'DNS Resolution Test',
          timestamp,
          benchmarkType: 'dns-test',
          results: [networkData.dnsResolution || 0],
          stats: {
            min: networkData.dnsResolution || 0,
            max: networkData.dnsResolution || 0,
            avg: networkData.dnsResolution || 0,
            median: networkData.dnsResolution || 0,
            p95: networkData.dnsResolution || 0,
            p99: networkData.dnsResolution || 0,
            count: 1,
            failed: 0
          },
          metadata: {
            userAgent,
            runs: 1,
            timeout: 5000
          },
          networkData
        }
        break
        
      case 'network-quality':
        networkData = await performNetworkQualityTest()
        result = {
          id,
          url: 'Network Quality Assessment',
          timestamp,
          benchmarkType: 'network-quality',
          results: [networkData.qualityScore || 0],
          stats: {
            min: networkData.qualityScore || 0,
            max: networkData.qualityScore || 0,
            avg: networkData.qualityScore || 0,
            median: networkData.qualityScore || 0,
            p95: networkData.qualityScore || 0,
            p99: networkData.qualityScore || 0,
            count: 1,
            failed: 0
          },
          metadata: {
            userAgent,
            runs: 1,
            timeout: 20000
          },
          networkData
        }
        break
        
      default:
        return NextResponse.json({ error: 'Invalid test type' }, { status: 400 })
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Network test error:', error)
    return NextResponse.json(
      { error: 'Network test failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

async function performSpeedTest(): Promise<NetworkTestData> {
  // Simulate speed test using multiple test endpoints
  const testEndpoints = [
    'https://httpbin.org/bytes/1048576', // 1MB download
    'https://httpbin.org/bytes/5242880', // 5MB download
  ]
  
  const downloadTests: number[] = []
  
  for (const endpoint of testEndpoints) {
    const startTime = performance.now()
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-cache'
      })
      
      if (response.ok) {
        const data = await response.arrayBuffer()
        const endTime = performance.now()
        const duration = (endTime - startTime) / 1000 // seconds
        const sizeBytes = data.byteLength
        const sizeMB = sizeBytes / (1024 * 1024)
        const speedMbps = (sizeMB * 8) / duration // Convert to Mbps
        
        downloadTests.push(speedMbps)
      }
    } catch {
      // Ignore speed test errors and continue
    }
  }
  
  const avgDownload = downloadTests.length > 0 
    ? downloadTests.reduce((a, b) => a + b, 0) / downloadTests.length 
    : 0
  
  // Simulate upload test (limited in browser environment)
  const uploadSpeed = avgDownload * 0.1 // Typically 10% of download
  
  // Simulate latency test
  const latencyStart = performance.now()
  try {
    await fetch('https://httpbin.org/get', { method: 'HEAD', cache: 'no-cache' })
    const latency = performance.now() - latencyStart
    
    return {
      downloadSpeed: Math.round(avgDownload * 100) / 100,
      uploadSpeed: Math.round(uploadSpeed * 100) / 100,
      latency: Math.round(latency),
      connectionType: 'Unknown',
      qualityScore: calculateQualityScore(avgDownload, uploadSpeed, latency)
    }
  } catch {
    return {
      downloadSpeed: Math.round(avgDownload * 100) / 100,
      uploadSpeed: Math.round(uploadSpeed * 100) / 100,
      latency: 0,
      connectionType: 'Unknown',
      qualityScore: 0
    }
  }
}

async function performBufferBloatTest(): Promise<NetworkTestData> {
  // Test buffer bloat by measuring latency under load
  const baselineLatencies: number[] = []
  const loadedLatencies: number[] = []
  
  // Baseline latency (3 tests)
  for (let i = 0; i < 3; i++) {
    const start = performance.now()
    try {
      await fetch('https://httpbin.org/get', { method: 'HEAD', cache: 'no-cache' })
      baselineLatencies.push(performance.now() - start)
    } catch {
      // Ignore baseline test errors
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // Load test - simultaneous requests with latency measurement
  const loadPromises = []
  const latencyPromise = async () => {
    await new Promise(resolve => setTimeout(resolve, 200)) // Wait for load to build
    const start = performance.now()
    try {
      await fetch('https://httpbin.org/get', { method: 'HEAD', cache: 'no-cache' })
      return performance.now() - start
    } catch {
      return 0
    }
  }
  
  // Create load
  for (let i = 0; i < 4; i++) {
    loadPromises.push(fetch('https://httpbin.org/bytes/1048576', { cache: 'no-cache' }))
  }
  loadPromises.push(latencyPromise().then(lat => loadedLatencies.push(lat)))
  
  await Promise.allSettled(loadPromises)
  
  const avgBaseline = baselineLatencies.length > 0 
    ? baselineLatencies.reduce((a, b) => a + b, 0) / baselineLatencies.length 
    : 0
  const avgLoaded = loadedLatencies.length > 0 
    ? loadedLatencies.reduce((a, b) => a + b, 0) / loadedLatencies.length 
    : 0
  
  const bufferBloat = Math.max(0, avgLoaded - avgBaseline)
  
  return {
    bufferBloat: Math.round(bufferBloat),
    latency: Math.round(avgBaseline),
    qualityScore: calculateBufferBloatScore(bufferBloat)
  }
}

async function performDNSTest(): Promise<NetworkTestData> {
  // Test DNS resolution time using various endpoints
  const dnsTests: number[] = []
  const testDomains = [
    'https://www.google.com/favicon.ico',
    'https://www.cloudflare.com/favicon.ico',
    'https://httpbin.org/get'
  ]
  
  for (const domain of testDomains) {
    const start = performance.now()
    try {
      await fetch(domain, { method: 'HEAD', cache: 'no-cache' })
      dnsTests.push(performance.now() - start)
    } catch {
      // Ignore DNS test errors
    }
  }
  
  const avgDNS = dnsTests.length > 0 
    ? dnsTests.reduce((a, b) => a + b, 0) / dnsTests.length 
    : 0
  
  return {
    dnsResolution: Math.round(avgDNS),
    qualityScore: calculateDNSScore(avgDNS)
  }
}

async function performNetworkQualityTest(): Promise<NetworkTestData> {
  // Comprehensive network quality assessment
  const speedData = await performSpeedTest()
  const bufferData = await performBufferBloatTest()
  const dnsData = await performDNSTest()
  
  // Calculate jitter (latency variation)
  const latencyTests: number[] = []
  for (let i = 0; i < 5; i++) {
    const start = performance.now()
    try {
      await fetch('https://httpbin.org/get', { method: 'HEAD', cache: 'no-cache' })
      latencyTests.push(performance.now() - start)
    } catch {
      latencyTests.push(0)
    }
  }
  
  const avgLatency = latencyTests.reduce((a, b) => a + b, 0) / latencyTests.length
  const jitter = Math.sqrt(
    latencyTests.reduce((sum, lat) => sum + Math.pow(lat - avgLatency, 2), 0) / latencyTests.length
  )
  
  const overallScore = calculateOverallQuality(
    speedData.downloadSpeed || 0,
    speedData.uploadSpeed || 0,
    avgLatency,
    jitter,
    bufferData.bufferBloat || 0,
    dnsData.dnsResolution || 0
  )
  
  return {
    downloadSpeed: speedData.downloadSpeed,
    uploadSpeed: speedData.uploadSpeed,
    latency: Math.round(avgLatency),
    jitter: Math.round(jitter),
    bufferBloat: bufferData.bufferBloat,
    dnsResolution: dnsData.dnsResolution,
    qualityScore: overallScore,
    connectionType: 'Broadband' // Simplified
  }
}

function calculateQualityScore(download: number, upload: number, latency: number): number {
  let score = 100
  
  // Download speed scoring (0-40 points)
  if (download >= 100) score -= 0
  else if (download >= 50) score -= 5
  else if (download >= 25) score -= 15
  else if (download >= 10) score -= 25
  else score -= 40
  
  // Upload speed scoring (0-20 points)
  if (upload >= 25) score -= 0
  else if (upload >= 10) score -= 5
  else if (upload >= 5) score -= 10
  else score -= 20
  
  // Latency scoring (0-40 points)
  if (latency <= 20) score -= 0
  else if (latency <= 50) score -= 10
  else if (latency <= 100) score -= 20
  else if (latency <= 200) score -= 30
  else score -= 40
  
  return Math.max(0, score)
}

function calculateBufferBloatScore(bufferBloat: number): number {
  if (bufferBloat <= 10) return 100
  if (bufferBloat <= 25) return 90
  if (bufferBloat <= 50) return 80
  if (bufferBloat <= 100) return 60
  if (bufferBloat <= 200) return 40
  return 20
}

function calculateDNSScore(dnsTime: number): number {
  if (dnsTime <= 10) return 100
  if (dnsTime <= 25) return 90
  if (dnsTime <= 50) return 80
  if (dnsTime <= 100) return 60
  return 40
}

function calculateOverallQuality(
  download: number, 
  upload: number, 
  latency: number, 
  jitter: number, 
  bufferBloat: number, 
  dns: number
): number {
  const weights = {
    download: 0.3,
    upload: 0.15,
    latency: 0.25,
    jitter: 0.1,
    bufferBloat: 0.15,
    dns: 0.05
  }
  
  const scores = {
    download: calculateQualityScore(download, 0, 0) * weights.download / 100,
    upload: (upload >= 10 ? 100 : upload * 10) * weights.upload / 100,
    latency: (latency <= 50 ? 100 : Math.max(0, 100 - latency)) * weights.latency / 100,
    jitter: (jitter <= 5 ? 100 : Math.max(0, 100 - jitter * 5)) * weights.jitter / 100,
    bufferBloat: calculateBufferBloatScore(bufferBloat) * weights.bufferBloat / 100,
    dns: calculateDNSScore(dns) * weights.dns / 100
  }
  
  return Math.round((Object.values(scores).reduce((a, b) => a + b, 0)) * 100)
}