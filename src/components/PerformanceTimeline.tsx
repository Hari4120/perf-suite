"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardDescription, AnimatedCardContent } from "@/components/ui/AnimatedCard"
import type { BenchmarkResult } from "@/types/benchmark"

interface PerformanceTimelineProps {
  results: BenchmarkResult[]
}

export default function PerformanceTimeline({ results }: PerformanceTimelineProps) {
  const validResults = useMemo(() =>
    results.filter(r => r.stats).slice(-20), // Last 20 results
  [results])

  const chartData = useMemo(() => {
    if (validResults.length === 0) return null

    const values = validResults.map(r => r.stats!.avg)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1

    return {
      points: validResults.map((result, index) => ({
        x: (index / Math.max(validResults.length - 1, 1)) * 100,
        y: 100 - ((result.stats!.avg - min) / range) * 80, // 80% of height
        value: result.stats!.avg,
        p95: result.stats!.p95,
        timestamp: result.timestamp,
        type: result.benchmarkType,
        color: result.stats!.avg < 100 ? '#10b981' :
               result.stats!.avg < 300 ? '#f59e0b' : '#ef4444'
      })),
      min,
      max,
      avg: values.reduce((sum, v) => sum + v, 0) / values.length,
      trend: values[values.length - 1] < values[0] ? 'improving' : 'degrading'
    }
  }, [validResults])

  if (!chartData || chartData.points.length === 0) return null

  // Create SVG path for smooth line
  const linePath = useMemo(() => {
    if (chartData.points.length < 2) return ''

    let path = `M ${chartData.points[0].x} ${chartData.points[0].y}`

    for (let i = 1; i < chartData.points.length; i++) {
      const curr = chartData.points[i]
      const prev = chartData.points[i - 1]

      // Smooth curve using quadratic bezier
      const cpX = (prev.x + curr.x) / 2
      path += ` Q ${cpX} ${prev.y}, ${curr.x} ${curr.y}`
    }

    return path
  }, [chartData.points])

  // Create area fill path
  const areaPath = useMemo(() => {
    if (!linePath) return ''
    return `${linePath} L 100 100 L 0 100 Z`
  }, [linePath])

  return (
    <AnimatedCard delay={0.4} className="overflow-hidden">
      <AnimatedCardHeader>
        <AnimatedCardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Performance Timeline</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            {chartData.trend === 'improving' ? (
              <TrendingDown className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-red-500" />
            )}
            <span className="text-muted-foreground capitalize">{chartData.trend}</span>
          </div>
        </AnimatedCardTitle>
        <AnimatedCardDescription>
          Response time trends across {chartData.points.length} recent tests
        </AnimatedCardDescription>
      </AnimatedCardHeader>

      <AnimatedCardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-green-50 dark:bg-green-950 rounded-lg p-3 border border-green-200 dark:border-green-800"
          >
            <div className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">Best</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-300">
              {chartData.min.toFixed(0)}
              <span className="text-sm ml-1">ms</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border border-blue-200 dark:border-blue-800"
          >
            <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1">Average</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
              {chartData.avg.toFixed(0)}
              <span className="text-sm ml-1">ms</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-red-50 dark:bg-red-950 rounded-lg p-3 border border-red-200 dark:border-red-800"
          >
            <div className="text-xs text-red-700 dark:text-red-400 font-medium mb-1">Worst</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-300">
              {chartData.max.toFixed(0)}
              <span className="text-sm ml-1">ms</span>
            </div>
          </motion.div>
        </div>

        {/* Chart */}
        <div className="relative w-full h-[300px] bg-muted/30 rounded-lg border p-4">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <motion.line
                key={`grid-${y}`}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="currentColor"
                strokeWidth="0.2"
                className="text-muted-foreground/20"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            ))}

            {/* Area fill */}
            <motion.path
              d={areaPath}
              fill="url(#gradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            />

            {/* Main line */}
            <motion.path
              d={linePath}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
            />

            {/* Data points */}
            {chartData.points.map((point, index) => (
              <g key={index}>
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r="1.2"
                  fill={point.color}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.5 + index * 0.05,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="cursor-pointer"
                />
                {/* Pulse effect */}
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r="1.2"
                  fill="none"
                  stroke={point.color}
                  strokeWidth="0.3"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{
                    scale: 2.5,
                    opacity: 0
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.15
                  }}
                />
              </g>
            ))}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-muted-foreground -ml-10 py-4">
            <span>{chartData.max.toFixed(0)}ms</span>
            <span>{((chartData.max + chartData.min) / 2).toFixed(0)}ms</span>
            <span>{chartData.min.toFixed(0)}ms</span>
          </div>

          {/* X-axis label */}
          <div className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-muted-foreground -mb-6">
            <BarChart3 className="h-3 w-3 inline mr-1" />
            Time Progress (Recent → Latest)
          </div>
        </div>

        {/* Performance Thresholds */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Excellent (&lt;100ms)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Good (100-300ms)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Slow (&gt;300ms)</span>
          </div>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  )
}
