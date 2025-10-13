import type { BenchmarkResult } from "@/types/benchmark"

interface PredictionResult {
  nextHourPrediction: {
    avg: number
    confidence: number
    trend: 'improving' | 'degrading' | 'stable'
  }
  nextDayPrediction: {
    avg: number
    confidence: number
    trend: 'improving' | 'degrading' | 'stable'
  }
  anomalyScore: number
  recommendations: string[]
  criticalThreshold: number
  healthScore: number
}

export class AIPerformancePredictor {
  private historicalData: number[] = []

  constructor(results: BenchmarkResult[]) {
    this.historicalData = results
      .filter(r => r.stats)
      .map(r => r.stats!.avg)
      .reverse() // Oldest to newest
  }

  private calculateMovingAverage(data: number[], window: number): number[] {
    const result: number[] = []
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1)
      const subset = data.slice(start, i + 1)
      const avg = subset.reduce((sum, val) => sum + val, 0) / subset.length
      result.push(avg)
    }
    return result
  }

  private calculateTrend(data: number[]): { slope: number; intercept: number } {
    if (data.length < 2) return { slope: 0, intercept: data[0] || 0 }

    const n = data.length
    const sumX = (n * (n - 1)) / 2
    const sumY = data.reduce((sum, val) => sum + val, 0)
    const sumXY = data.reduce((sum, val, i) => sum + i * val, 0)
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept }
  }

  private calculateSeasonality(data: number[]): number {
    if (data.length < 4) return 0

    const detrended = this.removeTrend(data)
    const fft = this.simpleDFT(detrended)
    const maxPower = Math.max(...fft.map(c => c.magnitude))

    return maxPower / data.length
  }

  private removeTrend(data: number[]): number[] {
    const trend = this.calculateTrend(data)
    return data.map((val, i) => val - (trend.slope * i + trend.intercept))
  }

  private simpleDFT(data: number[]): Array<{ magnitude: number; phase: number }> {
    const N = data.length
    const result: Array<{ magnitude: number; phase: number }> = []

    for (let k = 0; k < N / 2; k++) {
      let real = 0
      let imag = 0

      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N
        real += data[n] * Math.cos(angle)
        imag -= data[n] * Math.sin(angle)
      }

      const magnitude = Math.sqrt(real * real + imag * imag)
      const phase = Math.atan2(imag, real)

      result.push({ magnitude, phase })
    }

    return result
  }

  private detectAnomalies(data: number[]): number {
    if (data.length < 3) return 0

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    const stdDev = Math.sqrt(variance)

    const zScores = data.map(val => Math.abs((val - mean) / stdDev))
    const anomalies = zScores.filter(z => z > 2).length

    return (anomalies / data.length) * 100
  }

  private calculateHealthScore(data: number[], predictions: number[]): number {
    if (data.length === 0) return 100

    const currentAvg = data[data.length - 1]
    const historicalAvg = data.reduce((sum, val) => sum + val, 0) / data.length

    // Factor 1: Current vs Historical (40%)
    const performanceRatio = Math.min(historicalAvg / currentAvg, 2)
    const performanceScore = performanceRatio * 40

    // Factor 2: Stability (30%)
    const variance = data.reduce((sum, val) => sum + Math.pow(val - historicalAvg, 2), 0) / data.length
    const cv = Math.sqrt(variance) / historicalAvg
    const stabilityScore = Math.max(0, 30 - cv * 100)

    // Factor 3: Trend (30%)
    const trend = this.calculateTrend(data)
    const trendScore = trend.slope <= 0 ? 30 : Math.max(0, 30 - Math.abs(trend.slope) * 10)

    return Math.min(100, performanceScore + stabilityScore + trendScore)
  }

  predict(): PredictionResult {
    if (this.historicalData.length < 3) {
      return {
        nextHourPrediction: { avg: this.historicalData[0] || 100, confidence: 30, trend: 'stable' },
        nextDayPrediction: { avg: this.historicalData[0] || 100, confidence: 20, trend: 'stable' },
        anomalyScore: 0,
        recommendations: ['Collect more data for accurate predictions'],
        criticalThreshold: (this.historicalData[0] || 100) * 2,
        healthScore: 75
      }
    }

    // Calculate moving averages for smoothing
    const smoothed = this.calculateMovingAverage(this.historicalData, 3)

    // Calculate trend
    const trend = this.calculateTrend(smoothed)

    // Predict next values
    const nextIndex = this.historicalData.length
    const hourPrediction = trend.slope * nextIndex + trend.intercept
    const dayPrediction = trend.slope * (nextIndex + 24) + trend.intercept

    // Calculate confidence based on variance
    const variance = smoothed.reduce((sum, val, i) => {
      const predicted = trend.slope * i + trend.intercept
      return sum + Math.pow(val - predicted, 2)
    }, 0) / smoothed.length

    const stdDev = Math.sqrt(variance)
    const meanValue = smoothed.reduce((sum, val) => sum + val, 0) / smoothed.length
    const cv = stdDev / meanValue

    const hourConfidence = Math.max(50, Math.min(95, 95 - cv * 100))
    const dayConfidence = Math.max(40, Math.min(85, 85 - cv * 150))

    // Determine trends
    const getTrend = (current: number, predicted: number) => {
      const change = ((predicted - current) / current) * 100
      if (change < -5) return 'improving' as const
      if (change > 5) return 'degrading' as const
      return 'stable' as const
    }

    const currentAvg = smoothed[smoothed.length - 1]

    // Detect anomalies
    const anomalyScore = this.detectAnomalies(this.historicalData)

    // Generate recommendations
    const recommendations: string[] = []

    if (trend.slope > 1) {
      recommendations.push('⚠️ Performance is degrading. Consider scaling resources or optimizing code.')
    } else if (trend.slope < -1) {
      recommendations.push('✅ Performance is improving. Recent optimizations are working well.')
    }

    if (cv > 0.3) {
      recommendations.push('🎯 High variability detected. Investigate inconsistent response times.')
    }

    if (anomalyScore > 10) {
      recommendations.push('🔍 Multiple anomalies detected. Review error logs and traffic patterns.')
    }

    if (currentAvg > meanValue * 1.5) {
      recommendations.push('🚨 Current performance significantly worse than historical average.')
    }

    if (hourPrediction > currentAvg * 1.2) {
      recommendations.push('📈 Predicted degradation in next hour. Monitor closely.')
    }

    if (recommendations.length === 0) {
      recommendations.push('✨ System performing well. Continue monitoring.')
    }

    // Calculate critical threshold
    const criticalThreshold = meanValue + stdDev * 3

    // Calculate health score
    const healthScore = this.calculateHealthScore(smoothed, [hourPrediction, dayPrediction])

    return {
      nextHourPrediction: {
        avg: Math.max(0, hourPrediction),
        confidence: hourConfidence,
        trend: getTrend(currentAvg, hourPrediction)
      },
      nextDayPrediction: {
        avg: Math.max(0, dayPrediction),
        confidence: dayConfidence,
        trend: getTrend(currentAvg, dayPrediction)
      },
      anomalyScore,
      recommendations,
      criticalThreshold,
      healthScore
    }
  }
}

export function predictPerformance(results: BenchmarkResult[]): PredictionResult {
  const predictor = new AIPerformancePredictor(results)
  return predictor.predict()
}