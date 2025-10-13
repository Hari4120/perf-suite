"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  Shield,
  Flame,
  Snowflake,
  Zap,
  TrendingUp,
  Clock,
  XCircle,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardDescription, AnimatedCardContent } from "@/components/ui/AnimatedCard"
import { AnimatedButton } from "@/components/ui/AnimatedButton"
import { cn } from "@/lib/utils"
import type { BenchmarkResult } from "@/types/benchmark"

interface AnomalyDetectorProps {
  results: BenchmarkResult[]
}

interface Anomaly {
  id: string
  type: 'spike' | 'drop' | 'timeout' | 'pattern' | 'outlier'
  severity: 'critical' | 'warning' | 'info'
  timestamp: number
  value: number
  expectedValue: number
  deviation: number
  description: string
  impact: string
  recommendation: string
}

export default function AnomalyDetector({ results }: AnomalyDetectorProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [showHeatmap, setShowHeatmap] = useState(true)

  const anomalies = useMemo((): Anomaly[] => {
    const detected: Anomaly[] = []
    const validResults = results.filter(r => r.stats).slice(0, 50)

    if (validResults.length < 5) return detected

    // Calculate baseline statistics
    const values = validResults.map(r => r.stats!.avg)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    // Detect anomalies
    validResults.forEach((result, index) => {
      const value = result.stats!.avg
      const zScore = (value - mean) / stdDev

      // Spike Detection (z-score > 2)
      if (zScore > 2) {
        detected.push({
          id: `spike-${result.id}`,
          type: 'spike',
          severity: zScore > 3 ? 'critical' : 'warning',
          timestamp: result.timestamp,
          value,
          expectedValue: mean,
          deviation: ((value - mean) / mean) * 100,
          description: `Response time spike detected: ${value.toFixed(2)}ms (${zScore.toFixed(1)}σ above normal)`,
          impact: zScore > 3 ? 'Severe performance degradation affecting users' : 'Moderate performance impact',
          recommendation: 'Check server load, memory usage, and recent deployments'
        })
      }

      // Improvement Detection (z-score < -2)
      if (zScore < -2) {
        detected.push({
          id: `drop-${result.id}`,
          type: 'drop',
          severity: 'info',
          timestamp: result.timestamp,
          value,
          expectedValue: mean,
          deviation: ((value - mean) / mean) * 100,
          description: `Significant performance improvement: ${value.toFixed(2)}ms (${Math.abs(zScore).toFixed(1)}σ below normal)`,
          impact: 'Positive impact - system performing better than usual',
          recommendation: 'Document changes that led to improvement'
        })
      }

      // Timeout Detection
      if (result.stats!.failed > 0) {
        const failureRate = (result.stats!.failed / result.results.length) * 100
        detected.push({
          id: `timeout-${result.id}`,
          type: 'timeout',
          severity: failureRate > 10 ? 'critical' : 'warning',
          timestamp: result.timestamp,
          value: result.stats!.failed,
          expectedValue: 0,
          deviation: failureRate,
          description: `${result.stats!.failed} request(s) failed (${failureRate.toFixed(1)}% failure rate)`,
          impact: failureRate > 10 ? 'Critical service disruption' : 'Intermittent service issues',
          recommendation: 'Check network connectivity, server health, and error logs'
        })
      }

      // Pattern Detection - Consecutive high values
      if (index >= 2) {
        const recent3 = values.slice(Math.max(0, index - 2), index + 1)
        const allHigh = recent3.every(v => v > mean + stdDev)

        if (allHigh && detected.filter(a => a.type === 'pattern').length === 0) {
          detected.push({
            id: `pattern-${result.id}`,
            type: 'pattern',
            severity: 'warning',
            timestamp: result.timestamp,
            value: recent3[recent3.length - 1],
            expectedValue: mean,
            deviation: ((recent3[recent3.length - 1] - mean) / mean) * 100,
            description: 'Sustained performance degradation pattern detected',
            impact: 'System under consistent stress',
            recommendation: 'Investigate root cause: scaling issues, resource exhaustion, or increased load'
          })
        }
      }

      // Extreme Outlier Detection
      if (Math.abs(zScore) > 4) {
        detected.push({
          id: `outlier-${result.id}`,
          type: 'outlier',
          severity: 'critical',
          timestamp: result.timestamp,
          value,
          expectedValue: mean,
          deviation: ((value - mean) / mean) * 100,
          description: `Extreme outlier detected: ${value.toFixed(2)}ms (${Math.abs(zScore).toFixed(1)}σ deviation)`,
          impact: 'Abnormal behavior indicating serious issue',
          recommendation: 'Immediate investigation required - check for system failures or attacks'
        })
      }
    })

    return detected.sort((a, b) => b.timestamp - a.timestamp)
  }, [results])

  const filteredAnomalies = selectedSeverity === 'all'
    ? anomalies
    : anomalies.filter(a => a.severity === selectedSeverity)

  const severityCounts = {
    critical: anomalies.filter(a => a.severity === 'critical').length,
    warning: anomalies.filter(a => a.severity === 'warning').length,
    info: anomalies.filter(a => a.severity === 'info').length
  }

  const getAnomalyIcon = (type: Anomaly['type']) => {
    switch (type) {
      case 'spike': return <Flame className="h-4 w-4" />
      case 'drop': return <Snowflake className="h-4 w-4" />
      case 'timeout': return <XCircle className="h-4 w-4" />
      case 'pattern': return <TrendingUp className="h-4 w-4" />
      case 'outlier': return <Zap className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-950'
      case 'warning': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      case 'info': return 'border-blue-500 bg-blue-50 dark:bg-blue-950'
    }
  }

  const getSeverityIconColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'info': return 'text-blue-600 dark:text-blue-400'
    }
  }

  // Generate heatmap data
  const heatmapData = useMemo(() => {
    const validResults = results.filter(r => r.stats).slice(0, 50)
    if (validResults.length === 0) return []

    const values = validResults.map(r => r.stats!.avg)
    const max = Math.max(...values)
    const min = Math.min(...values)

    return validResults.map((result, index) => ({
      index,
      value: result.stats!.avg,
      normalized: ((result.stats!.avg - min) / (max - min)) * 100,
      timestamp: result.timestamp,
      label: new Date(result.timestamp).toLocaleTimeString()
    }))
  }, [results])

  if (anomalies.length === 0) {
    return (
      <AnimatedCard delay={0.5}>
        <AnimatedCardHeader>
          <AnimatedCardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Anomaly Detection</span>
          </AnimatedCardTitle>
        </AnimatedCardHeader>
        <AnimatedCardContent>
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="h-16 w-16 mx-auto mb-4 text-green-500" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">All Systems Normal</h3>
            <p className="text-muted-foreground">
              No anomalies detected in your performance data. System is operating within expected parameters.
            </p>
          </div>
        </AnimatedCardContent>
      </AnimatedCard>
    )
  }

  return (
    <AnimatedCard delay={0.5} className="overflow-hidden">
      <AnimatedCardHeader>
        <AnimatedCardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </motion.div>
            <span>Advanced Anomaly Detection</span>
          </div>
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className={cn(
                "px-2 py-1 rounded-full text-xs font-bold",
                severityCounts.critical > 0 ? "bg-red-500 text-white" :
                severityCounts.warning > 0 ? "bg-yellow-500 text-white" :
                "bg-green-500 text-white"
              )}
            >
              {anomalies.length} Detected
            </motion.div>
          </div>
        </AnimatedCardTitle>
        <AnimatedCardDescription>
          AI-powered anomaly detection with real-time pattern recognition
        </AnimatedCardDescription>
      </AnimatedCardHeader>

      <AnimatedCardContent>
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <AnimatedButton
              variant={selectedSeverity === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSeverity('all')}
            >
              All ({anomalies.length})
            </AnimatedButton>
            <AnimatedButton
              variant={selectedSeverity === 'critical' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSeverity('critical')}
              className={selectedSeverity === 'critical' ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <Flame className="h-3 w-3 mr-1" />
              Critical ({severityCounts.critical})
            </AnimatedButton>
            <AnimatedButton
              variant={selectedSeverity === 'warning' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSeverity('warning')}
              className={selectedSeverity === 'warning' ? "bg-yellow-500 hover:bg-yellow-600" : ""}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Warning ({severityCounts.warning})
            </AnimatedButton>
            <AnimatedButton
              variant={selectedSeverity === 'info' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSeverity('info')}
              className={selectedSeverity === 'info' ? "bg-blue-500 hover:bg-blue-600" : ""}
            >
              <Snowflake className="h-3 w-3 mr-1" />
              Info ({severityCounts.info})
            </AnimatedButton>
          </div>

          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={() => setShowHeatmap(!showHeatmap)}
          >
            {showHeatmap ? 'Hide' : 'Show'} Heatmap
          </AnimatedButton>
        </div>

        {/* Performance Heatmap */}
        <AnimatePresence>
          {showHeatmap && heatmapData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-muted/30 rounded-lg"
            >
              <div className="text-sm font-medium mb-3 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Performance Heatmap (Last {heatmapData.length} Tests)</span>
              </div>
              <div className="flex space-x-1 h-12">
                {heatmapData.map((data, index) => (
                  <motion.div
                    key={index}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex-1 rounded-sm cursor-pointer relative group origin-bottom"
                    style={{
                      background: `linear-gradient(to top,
                        ${data.normalized < 33 ? '#10b981' :
                          data.normalized < 66 ? '#f59e0b' : '#ef4444'}
                      )`,
                      opacity: 0.7 + (data.normalized / 100) * 0.3
                    }}
                    title={`${data.value.toFixed(2)}ms at ${data.label}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: -10 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-background border rounded text-xs whitespace-nowrap shadow-lg pointer-events-none"
                    >
                      {data.value.toFixed(1)}ms
                    </motion.div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Anomalies List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredAnomalies.map((anomaly, index) => (
              <motion.div
                key={anomaly.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "border-l-4 rounded-lg p-4 transition-all hover:shadow-md",
                  getSeverityColor(anomaly.severity)
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "p-2 rounded-md bg-background/50",
                    getSeverityIconColor(anomaly.severity)
                  )}>
                    {getAnomalyIcon(anomaly.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm">{anomaly.description}</h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(anomaly.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Measured Value:</div>
                        <div className="font-mono font-semibold">
                          {anomaly.value.toFixed(2)}{anomaly.type === 'timeout' ? ' failures' : 'ms'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Deviation:</div>
                        <div className={cn(
                          "font-mono font-semibold",
                          anomaly.deviation > 0 ? "text-red-600" : "text-green-600"
                        )}>
                          {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t space-y-1 text-xs">
                      <div>
                        <span className="text-muted-foreground">Impact:</span>{' '}
                        <span>{anomaly.impact}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Recommendation:</span>{' '}
                        <span className="text-primary">{anomaly.recommendation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredAnomalies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No anomalies in this category</p>
          </div>
        )}
      </AnimatedCardContent>
    </AnimatedCard>
  )
}