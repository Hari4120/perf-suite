"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardDescription, AnimatedCardContent } from "@/components/ui/AnimatedCard"
import type { BenchmarkResult } from "@/types/benchmark"

interface PerformanceTimelineProps {
  results: BenchmarkResult[]
}

export default function PerformanceTimeline({ results }: PerformanceTimelineProps) {
  const validResults = useMemo(() =>
    results.filter(r => r.stats).slice(-20),
  [results])

  const chartData = useMemo(() => {
    if (validResults.length === 0) return null

    const values = validResults.map(r => r.stats!.avg)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1

    return {
      points: validResults.map((result, index) => ({
        x: index,
        y: ((result.stats!.avg - min) / range) * 100,
        value: result.stats!.avg,
        timestamp: result.timestamp,
        type: result.benchmarkType
      })),
      min,
      max,
      avg: values.reduce((sum, v) => sum + v, 0) / values.length,
      trend: values[values.length - 1] < values[0] ? 'improving' : 'degrading'
    }
  }, [validResults])

  if (!chartData || chartData.points.length === 0) return null

  const width = 800
  const height = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  return (
    <AnimatedCard delay={0.4}>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-700 dark:text-green-400 mb-1">Best</div>
            <div className="text-2xl font-bold text-green-600">{chartData.min.toFixed(0)}<span className="text-sm ml-1">ms</span></div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">Average</div>
            <div className="text-2xl font-bold text-blue-600">{chartData.avg.toFixed(0)}<span className="text-sm ml-1">ms</span></div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-sm text-red-700 dark:text-red-400 mb-1">Worst</div>
            <div className="text-2xl font-bold text-red-600">{chartData.max.toFixed(0)}<span className="text-sm ml-1">ms</span></div>
          </div>
        </div>

        {/* Simple Line Chart */}
        <div className="bg-muted/30 rounded-lg border p-4">
          <svg width="100%" height="200" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((percent) => {
              const y = padding.top + (chartHeight * percent) / 100
              return (
                <g key={percent}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-muted-foreground/10"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] fill-muted-foreground"
                  >
                    {(chartData.max - (chartData.max - chartData.min) * (percent / 100)).toFixed(0)}ms
                  </text>
                </g>
              )
            })}

            {/* Line path */}
            <motion.path
              d={chartData.points.map((point, i) => {
                const x = padding.left + (chartWidth / (chartData.points.length - 1 || 1)) * point.x
                const y = padding.top + chartHeight - (chartHeight * point.y) / 100
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
              }).join(' ')}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />

            {/* Area fill */}
            <motion.path
              d={`
                ${chartData.points.map((point, i) => {
                  const x = padding.left + (chartWidth / (chartData.points.length - 1 || 1)) * point.x
                  const y = padding.top + chartHeight - (chartHeight * point.y) / 100
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                }).join(' ')}
                L ${width - padding.right} ${height - padding.bottom}
                L ${padding.left} ${height - padding.bottom}
                Z
              `}
              fill="hsl(var(--primary))"
              opacity="0.1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ duration: 0.8 }}
            />

            {/* Data points */}
            {chartData.points.map((point, index) => {
              const x = padding.left + (chartWidth / (chartData.points.length - 1 || 1)) * point.x
              const y = padding.top + chartHeight - (chartHeight * point.y) / 100

              return (
                <motion.g key={index}>
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="hsl(var(--primary))"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.03, type: "spring", stiffness: 300 }}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="transparent"
                    className="cursor-pointer hover:fill-primary/10"
                  >
                    <title>{`${point.value.toFixed(2)}ms - ${new Date(point.timestamp).toLocaleTimeString()}`}</title>
                  </circle>
                </motion.g>
              )
            })}

            {/* X-axis label */}
            <text
              x={width / 2}
              y={height - 5}
              textAnchor="middle"
              className="text-[10px] fill-muted-foreground"
            >
              Time Progress (Recent → Latest)
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Excellent (&lt;100ms)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Good (100-300ms)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Slow (&gt;300ms)</span>
          </div>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  )
}
