// Client-side network testing utilities that work in the browser
export interface NetworkTestResult {
  downloadSpeed: number // Mbps
  uploadSpeed: number // Mbps (estimated)
  latency: number // ms
  jitter: number // ms
  bufferBloat: number // ms
  dnsResolution: number // ms
  qualityScore: number // 0-100
  connectionType: string
  testEndpoint: string
}

// Reliable test endpoints that support CORS
const TEST_ENDPOINTS = [
  'https://httpbin.org/get',
  'https://httpbin.org/json',
  'https://api.github.com/zen',
  'https://httpbin.org/uuid',
  'https://httpbin.org/ip'
]

const SPEED_TEST_FILES = [
  'https://httpbin.org/bytes/100000',   // 100KB
  'https://httpbin.org/bytes/500000',   // 500KB  
  'https://httpbin.org/bytes/1048576',  // 1MB
]

// Get the best available endpoint based on connectivity
async function getBestEndpoint(): Promise<string> {
  const promises = TEST_ENDPOINTS.map(async (endpoint) => {
    try {
      const start = Date.now()
      const response = await fetch(endpoint, { 
        method: 'HEAD', 
        cache: 'no-cache',
        signal: AbortSignal.timeout(3000)
      })
      const latency = Date.now() - start
      return { endpoint, latency, ok: response.ok }
    } catch {
      return { endpoint, latency: 9999, ok: false }
    }
  })
  
  const results = await Promise.all(promises)
  const working = results.filter(r => r.ok).sort((a, b) => a.latency - b.latency)
  
  return working.length > 0 ? working[0].endpoint : TEST_ENDPOINTS[0]
}

export async function runSpeedTest(): Promise<NetworkTestResult> {
  const bestEndpoint = await getBestEndpoint()
  
  // Test latency with multiple measurements
  const latencyTests: number[] = []
  for (let i = 0; i < 5; i++) {
    try {
      const start = performance.now()
      await fetch(bestEndpoint, { 
        method: 'HEAD', 
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      })
      latencyTests.push(performance.now() - start)
    } catch {
      latencyTests.push(1000) // Fallback high latency
    }
  }
  
  const avgLatency = latencyTests.reduce((a, b) => a + b, 0) / latencyTests.length
  const jitter = Math.sqrt(
    latencyTests.reduce((sum, lat) => sum + Math.pow(lat - avgLatency, 2), 0) / latencyTests.length
  )
  
  // Speed test using available endpoints
  let downloadSpeed = 0
  try {
    const testFile = SPEED_TEST_FILES[0] // Use smallest reliable file
    const start = performance.now()
    
    const response = await fetch(testFile, { 
      cache: 'no-cache',
      signal: AbortSignal.timeout(10000)
    })
    
    if (response.ok) {
      const data = await response.arrayBuffer()
      const duration = (performance.now() - start) / 1000 // seconds
      const sizeBytes = data.byteLength
      const sizeMB = sizeBytes / (1024 * 1024)
      downloadSpeed = (sizeMB * 8) / duration // Mbps
    }
  } catch {
    // Estimate speed based on latency if download test fails
    downloadSpeed = Math.max(0.1, 50 - avgLatency / 10)
  }
  
  // Estimate upload speed (typically 10-20% of download for most connections)
  const uploadSpeed = downloadSpeed * 0.15
  
  const qualityScore = calculateQualityScore(downloadSpeed, uploadSpeed, avgLatency, jitter)
  
  return {
    downloadSpeed: Math.round(downloadSpeed * 100) / 100,
    uploadSpeed: Math.round(uploadSpeed * 100) / 100,
    latency: Math.round(avgLatency),
    jitter: Math.round(jitter),
    bufferBloat: 0, // Will be set by buffer bloat test
    dnsResolution: 0, // Will be set by DNS test
    qualityScore,
    connectionType: getConnectionType(downloadSpeed),
    testEndpoint: bestEndpoint
  }
}

export async function runBufferBloatTest(): Promise<{ bufferBloat: number; baseLatency: number }> {
  const bestEndpoint = await getBestEndpoint()
  
  // Baseline latency measurements
  const baselineLatencies: number[] = []
  for (let i = 0; i < 3; i++) {
    try {
      const start = performance.now()
      await fetch(bestEndpoint, { 
        method: 'HEAD', 
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      })
      baselineLatencies.push(performance.now() - start)
    } catch {
      baselineLatencies.push(500)
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  const baseLatency = baselineLatencies.reduce((a, b) => a + b, 0) / baselineLatencies.length
  
  // Simulate load and measure latency under load
  const loadedLatencies: number[] = []
  const loadPromises: Promise<Response | null>[] = []
  
  // Create network load with concurrent requests
  for (let i = 0; i < 3; i++) {
    loadPromises.push(
      fetch(SPEED_TEST_FILES[0], { 
        cache: 'no-cache',
        signal: AbortSignal.timeout(8000)
      }).catch(() => null)
    )
  }
  
  // Measure latency during load
  setTimeout(async () => {
    try {
      const start = performance.now()
      await fetch(bestEndpoint, { 
        method: 'HEAD', 
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      })
      loadedLatencies.push(performance.now() - start)
    } catch {
      loadedLatencies.push(baseLatency * 2) // Estimate increased latency
    }
  }, 200)
  
  await Promise.allSettled([...loadPromises, new Promise(resolve => setTimeout(resolve, 1000))])
  
  const loadedLatency = loadedLatencies.length > 0 
    ? loadedLatencies[0] 
    : baseLatency * 1.5 // Fallback estimate
  
  const bufferBloat = Math.max(0, loadedLatency - baseLatency)
  
  return {
    bufferBloat: Math.round(bufferBloat),
    baseLatency: Math.round(baseLatency)
  }
}

export async function runDNSTest(): Promise<{ dnsResolution: number }> {
  // Test DNS resolution by measuring first connection time
  const dnsTests: number[] = []
  
  // Different domains to test DNS resolution
  const testDomains = [
    'https://www.google.com/favicon.ico',
    'https://httpbin.org/get',
    'https://api.github.com/zen'
  ]
  
  for (const domain of testDomains) {
    try {
      const start = performance.now()
      // First request includes DNS resolution time
      await fetch(domain, { 
        method: 'HEAD', 
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      })
      dnsTests.push(performance.now() - start)
      break // Use first successful test
    } catch {
      continue
    }
  }
  
  // If all DNS tests fail, estimate based on typical DNS resolution
  const dnsTime = dnsTests.length > 0 ? dnsTests[0] : 50
  
  return {
    dnsResolution: Math.round(dnsTime)
  }
}

export async function runNetworkQualityTest(): Promise<NetworkTestResult> {
  // Run comprehensive network quality assessment
  const [speedResult, bufferResult, dnsResult] = await Promise.all([
    runSpeedTest(),
    runBufferBloatTest(),
    runDNSTest()
  ])
  
  const overallScore = calculateOverallQuality(
    speedResult.downloadSpeed,
    speedResult.uploadSpeed,
    speedResult.latency,
    speedResult.jitter,
    bufferResult.bufferBloat,
    dnsResult.dnsResolution
  )
  
  return {
    ...speedResult,
    bufferBloat: bufferResult.bufferBloat,
    dnsResolution: dnsResult.dnsResolution,
    qualityScore: overallScore
  }
}

function calculateQualityScore(download: number, upload: number, latency: number, jitter: number): number {
  let score = 100
  
  // Download speed scoring (0-40 points deducted)
  if (download < 1) score -= 40
  else if (download < 5) score -= 30
  else if (download < 10) score -= 20
  else if (download < 25) score -= 10
  else if (download < 50) score -= 5
  
  // Upload speed scoring (0-20 points deducted)
  if (upload < 0.5) score -= 20
  else if (upload < 2) score -= 15
  else if (upload < 5) score -= 10
  else if (upload < 10) score -= 5
  
  // Latency scoring (0-30 points deducted)
  if (latency > 500) score -= 30
  else if (latency > 200) score -= 25
  else if (latency > 100) score -= 15
  else if (latency > 50) score -= 8
  
  // Jitter scoring (0-10 points deducted)
  if (jitter > 50) score -= 10
  else if (jitter > 20) score -= 5
  else if (jitter > 10) score -= 2
  
  return Math.max(0, Math.min(100, score))
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
  
  const downloadScore = Math.min(100, download * 2) // Scale download speed to 0-100
  const uploadScore = Math.min(100, upload * 10)    // Scale upload speed to 0-100
  const latencyScore = Math.max(0, 100 - latency / 5)  // Lower latency = higher score
  const jitterScore = Math.max(0, 100 - jitter * 2)    // Lower jitter = higher score
  const bufferBloatScore = Math.max(0, 100 - bufferBloat / 2) // Lower buffer bloat = higher score
  const dnsScore = Math.max(0, 100 - dns / 2)         // Faster DNS = higher score
  
  const weightedScore = 
    (downloadScore * weights.download) +
    (uploadScore * weights.upload) +
    (latencyScore * weights.latency) +
    (jitterScore * weights.jitter) +
    (bufferBloatScore * weights.bufferBloat) +
    (dnsScore * weights.dns)
  
  return Math.round(weightedScore)
}

function getConnectionType(downloadSpeed: number): string {
  if (downloadSpeed >= 100) return 'Fiber/High-speed'
  if (downloadSpeed >= 50) return 'Broadband'
  if (downloadSpeed >= 10) return 'DSL/Cable'
  if (downloadSpeed >= 1) return 'Mobile/Slow'
  return 'Very Slow'
}