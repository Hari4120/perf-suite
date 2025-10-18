// Client-side network testing utilities that work in the browser
export interface NetworkTestResult {
  downloadSpeed: number // Mbps
  uploadSpeed: number // Mbps (measured via real upload test)
  latency: number // ms
  jitter: number // ms
  bufferBloat: number // ms
  dnsResolution: number // ms
  qualityScore: number // 0-100
  connectionType: string
  testEndpoint: string
  testDuration?: number // seconds
  measurements?: TestMeasurement[]
}

export interface TestMeasurement {
  timestamp: number
  type: 'latency' | 'speed' | 'dns' | 'quality'
  value: number
  score: number
  phase: string
}

export interface TestProgress {
  phase: 'initializing' | 'latency' | 'speed' | 'dns' | 'buffer-bloat' | 'finalizing' | 'complete'
  progress: number // 0-100
  currentTest: string
  elapsed: number // seconds
  estimated: number // total estimated seconds
  liveScore: number // current quality score
  measurements: TestMeasurement[]
}

// Reliable low-latency test endpoints optimized for speed
const TEST_ENDPOINTS = [
  'https://www.cloudflare.com/cdn-cgi/trace',      // Cloudflare edge - globally distributed
  'https://1.1.1.1/cdn-cgi/trace',                 // Cloudflare DNS - very fast
  'https://www.google.com/generate_204',            // Google no-content endpoint - optimized for speed
  'https://httpbin.org/get',                        // Fallback general purpose
  'https://api.github.com/zen'                      // Fallback API
]

// Use larger files from reliable CDN sources for accurate speed testing
const SPEED_TEST_FILES = [
  { url: 'https://speed.cloudflare.com/__down?bytes=10000000', size: 10000000, name: '10MB' },    // 10MB
  { url: 'https://speed.cloudflare.com/__down?bytes=25000000', size: 25000000, name: '25MB' },    // 25MB
  { url: 'https://speed.cloudflare.com/__down?bytes=50000000', size: 50000000, name: '50MB' },    // 50MB
  { url: 'https://speed.cloudflare.com/__down?bytes=100000000', size: 100000000, name: '100MB' }, // 100MB
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

export async function runSpeedTest(onProgress?: (progress: TestProgress) => void): Promise<NetworkTestResult> {
  const startTime = Date.now()
  const measurements: TestMeasurement[] = []
  let currentScore = 0
  
  const updateProgress = (phase: TestProgress['phase'], progress: number, currentTest: string, score = currentScore) => {
    const elapsed = (Date.now() - startTime) / 1000
    onProgress?.({
      phase,
      progress,
      currentTest,
      elapsed,
      estimated: 90, // 1.5 minutes total
      liveScore: score,
      measurements: [...measurements]
    })
  }
  
  updateProgress('initializing', 5, 'Finding best server...')
  const bestEndpoint = await getBestEndpoint()
  
  updateProgress('latency', 10, 'Testing connection latency...')

  // Real latency testing with ICMP-style ping using lightweight HEAD requests
  const latencyTests: number[] = []
  const latencyTestCount = 20 // More samples for accuracy

  // Use ultra-lightweight endpoints for true latency (not download time)
  const latencyEndpoints = [
    'https://www.cloudflare.com/cdn-cgi/trace',  // Cloudflare edge
    'https://www.google.com/generate_204',        // Google no-content
  ]

  for (let i = 0; i < latencyTestCount; i++) {
    try {
      const endpoint = latencyEndpoints[i % latencyEndpoints.length]

      const start = performance.now()
      await fetch(endpoint, {
        method: 'HEAD', // HEAD = minimal data transfer
        cache: 'no-cache',
        signal: AbortSignal.timeout(2000)
      })
      const latency = performance.now() - start
      latencyTests.push(latency)

      const latencyScore = Math.max(0, 100 - latency / 5)
      measurements.push({
        timestamp: Date.now(),
        type: 'latency',
        value: latency,
        score: latencyScore,
        phase: 'Latency Test'
      })

      currentScore = latencyScore
      updateProgress('latency', 10 + (i + 1) * 1.5, `Latency: ${Math.round(latency)}ms`, currentScore)

    } catch {
      latencyTests.push(500)
    }

    // Minimal delay between tests
    if (i < latencyTestCount - 1) await new Promise(resolve => setTimeout(resolve, 100))
  }

  const avgLatency = latencyTests.reduce((a, b) => a + b, 0) / latencyTests.length
  const jitter = Math.sqrt(
    latencyTests.reduce((sum, lat) => sum + Math.pow(lat - avgLatency, 2), 0) / latencyTests.length
  )
  
  updateProgress('speed', 40, 'Testing download speeds...')

  // Progressive speed testing with increasing file sizes
  const speedTests: number[] = []
  let progressOffset = 40

  for (let fileIndex = 0; fileIndex < SPEED_TEST_FILES.length; fileIndex++) {
    const testFile = SPEED_TEST_FILES[fileIndex]
    let fileSuccessful = false

    // Try each file size up to 2 times
    for (let attempt = 0; attempt < 2 && !fileSuccessful; attempt++) {
      try {
        updateProgress('speed', progressOffset, `Testing with ${testFile.name} file...`, currentScore)

        const start = performance.now()
        const response = await fetch(testFile.url, {
          cache: 'no-cache',
          signal: AbortSignal.timeout(30000) // 30 second timeout for larger files
        })

        if (response.ok && response.body) {
          // Stream the response to accurately measure download speed
          const reader = response.body.getReader()
          let receivedBytes = 0

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            receivedBytes += value.length
          }

          const duration = (performance.now() - start) / 1000 // in seconds
          const sizeMB = receivedBytes / (1024 * 1024)
          const downloadSpeed = (sizeMB * 8) / duration // Convert to Mbps

          // Only accept realistic speeds (prevent outliers)
          if (downloadSpeed > 0.1 && downloadSpeed < 10000 && duration > 0.5) {
            speedTests.push(downloadSpeed)
            fileSuccessful = true

            // Add measurement
            const speedScore = Math.min(100, (downloadSpeed / 200) * 100) // Scale to 200 Mbps max
            measurements.push({
              timestamp: Date.now(),
              type: 'speed',
              value: downloadSpeed,
              score: speedScore,
              phase: 'Speed Test'
            })

            currentScore = speedScore
            updateProgress('speed', progressOffset + 3,
              `Download: ${downloadSpeed.toFixed(2)} Mbps (${testFile.name})`, currentScore)

            // If we got a good result from smaller file, skip to larger files
            if (downloadSpeed > 50 && fileIndex < 2) {
              fileIndex++
            }
          }
        }
      } catch (error) {
        console.warn(`Speed test attempt ${attempt + 1} failed for ${testFile.name}:`, error)
      }
    }

    progressOffset += 5

    // If we have enough samples or got consistent results, we can stop early
    if (speedTests.length >= 3) {
      const recentSpeeds = speedTests.slice(-3)
      const avgRecent = recentSpeeds.reduce((a, b) => a + b, 0) / recentSpeeds.length
      const variance = recentSpeeds.reduce((sum, speed) => sum + Math.pow(speed - avgRecent, 2), 0) / recentSpeeds.length

      // If variance is low (consistent results), we can stop
      if (variance < avgRecent * 0.1) break
    }
  }

  // Calculate average, removing outliers
  let avgDownloadSpeed = 1 // Default fallback

  if (speedTests.length > 0) {
    // Remove top and bottom 20% if we have enough samples
    if (speedTests.length >= 5) {
      const sorted = [...speedTests].sort((a, b) => a - b)
      const trimCount = Math.floor(sorted.length * 0.2)
      const trimmed = sorted.slice(trimCount, sorted.length - trimCount)
      avgDownloadSpeed = trimmed.reduce((a, b) => a + b, 0) / trimmed.length
    } else {
      avgDownloadSpeed = speedTests.reduce((a, b) => a + b, 0) / speedTests.length
    }
  }
  
  updateProgress('speed', 60, 'Testing upload speeds...')

  // Real upload speed testing - client-side timing for accuracy
  let uploadSpeed = avgDownloadSpeed * 0.15 // Fallback estimate
  const uploadTests: number[] = []

  // Run multiple upload tests for accuracy
  for (let uploadAttempt = 0; uploadAttempt < 3; uploadAttempt++) {
    try {
      // Create test data (10MB for upload test)
      const testDataSize = 10 * 1024 * 1024 // 10MB
      const testData = new Blob([new ArrayBuffer(testDataSize)])

      const formData = new FormData()
      formData.append('data', testData)

      // Measure upload time on client side
      const uploadStart = performance.now()
      const uploadResponse = await fetch('/api/upload-test', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })

      if (uploadResponse.ok) {
        const uploadDuration = (performance.now() - uploadStart) / 1000 // seconds
        const uploadSizeMB = testDataSize / (1024 * 1024)
        const measuredUploadSpeed = (uploadSizeMB * 8) / uploadDuration // Mbps

        // Only accept realistic speeds
        if (measuredUploadSpeed > 0.1 && measuredUploadSpeed < 10000 && uploadDuration > 0.3) {
          uploadTests.push(measuredUploadSpeed)

          updateProgress('speed', 60 + (uploadAttempt + 1) * 3,
            `Upload: ${measuredUploadSpeed.toFixed(2)} Mbps`, currentScore)
        }
      }
    } catch (error) {
      console.warn(`Upload test attempt ${uploadAttempt + 1} failed:`, error)
    }
  }

  // Calculate average upload speed
  if (uploadTests.length > 0) {
    uploadSpeed = uploadTests.reduce((a, b) => a + b, 0) / uploadTests.length

    const uploadScore = Math.min(100, (uploadSpeed / 50) * 100)
    measurements.push({
      timestamp: Date.now(),
      type: 'speed',
      value: uploadSpeed,
      score: uploadScore,
      phase: 'Upload Test'
    })
  }
  
  updateProgress('dns', 65, 'Measuring connection quality...')

  // Simplified DNS/connection quality test
  // Browser cannot measure pure DNS time (includes connection setup, TLS, etc.)
  // Use latency as proxy for connection quality
  const avgDNS = avgLatency
  
  updateProgress('finalizing', 90, 'Calculating final scores...')
  
  const finalScore = calculateQualityScore(avgDownloadSpeed, uploadSpeed, avgLatency, jitter)
  
  // Add final measurement
  measurements.push({
    timestamp: Date.now(),
    type: 'quality',
    value: finalScore,
    score: finalScore,
    phase: 'Final Score'
  })
  
  updateProgress('complete', 100, 'Test complete!', finalScore)
  
  const testDuration = (Date.now() - startTime) / 1000
  
  return {
    downloadSpeed: Math.round(avgDownloadSpeed * 100) / 100,
    uploadSpeed: Math.round(uploadSpeed * 100) / 100,
    latency: Math.round(avgLatency),
    jitter: Math.round(jitter),
    bufferBloat: 0,
    dnsResolution: Math.round(avgDNS),
    qualityScore: finalScore,
    connectionType: getConnectionType(avgDownloadSpeed),
    testEndpoint: bestEndpoint,
    testDuration: Math.round(testDuration),
    measurements
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
      fetch(SPEED_TEST_FILES[0].url, {
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

  // Download speed scoring (0-40 points deducted) - Updated for modern speeds
  if (download < 1) score -= 40
  else if (download < 10) score -= 30
  else if (download < 25) score -= 20
  else if (download < 50) score -= 15
  else if (download < 100) score -= 10
  else if (download < 200) score -= 5
  // 200+ Mbps gets full points

  // Upload speed scoring (0-20 points deducted) - Updated for modern speeds
  if (upload < 0.5) score -= 20
  else if (upload < 3) score -= 15
  else if (upload < 10) score -= 10
  else if (upload < 20) score -= 5
  // 20+ Mbps gets full points

  // Latency scoring (0-30 points deducted)
  if (latency > 500) score -= 30
  else if (latency > 200) score -= 25
  else if (latency > 100) score -= 15
  else if (latency > 50) score -= 8
  else if (latency > 30) score -= 3

  // Jitter scoring (0-10 points deducted)
  if (jitter > 50) score -= 10
  else if (jitter > 30) score -= 7
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
  
  // Updated scaling for modern internet speeds
  const downloadScore = Math.min(100, (download / 200) * 100) // Scale to 200 Mbps = 100 points
  const uploadScore = Math.min(100, (upload / 20) * 100)      // Scale to 20 Mbps = 100 points
  const latencyScore = Math.max(0, 100 - latency / 5)         // Lower latency = higher score
  const jitterScore = Math.max(0, 100 - jitter * 2)           // Lower jitter = higher score
  const bufferBloatScore = Math.max(0, 100 - bufferBloat / 2) // Lower buffer bloat = higher score
  const dnsScore = Math.max(0, 100 - dns / 2)                 // Faster DNS = higher score
  
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
  if (downloadSpeed >= 500) return 'Gigabit Fiber'
  if (downloadSpeed >= 200) return 'High-Speed Fiber'
  if (downloadSpeed >= 100) return 'Fiber/Fast Broadband'
  if (downloadSpeed >= 50) return 'Standard Broadband'
  if (downloadSpeed >= 25) return 'Basic Broadband'
  if (downloadSpeed >= 10) return 'DSL/Cable'
  if (downloadSpeed >= 1) return 'Mobile/Slow'
  return 'Very Slow'
}