"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  Zap,
  ArrowRight,
  Check,
  X,
  BarChart3,
  Target,
  Flame,
  Trophy,
  Sparkles
} from "lucide-react"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardDescription, AnimatedCardContent } from "@/components/ui/AnimatedCard"
import { AnimatedButton } from "@/components/ui/AnimatedButton"
import { cn } from "@/lib/utils"
import type { BenchmarkResult } from "@/types/benchmark"

interface IntelligentComparatorProps {
  results: BenchmarkResult[]
}

export default function IntelligentComparator({ results }: IntelligentComparatorProps) {
  const validResults = useMemo(() => results.filter(r => r.stats), [results])
  const [selectedLeft, setSelectedLeft] = useState<string>(validResults[0]?.id || '')
  const [selectedRight, setSelectedRight] = useState<string>(validResults[1]?.id || '')

  const leftResult = validResults.find(r => r.id === selectedLeft)
  const rightResult = validResults.find(r => r.id === selectedRight)

  const comparison = useMemo(() => {
    if (!leftResult?.stats || !rightResult?.stats) return null

    const avgDiff = ((rightResult.stats.avg - leftResult.stats.avg) / leftResult.stats.avg) * 100
    const p95Diff = ((rightResult.stats.p95 - leftResult.stats.p95) / leftResult.stats.p95) * 100
    const failureDiff = rightResult.stats.failed - leftResult.stats.failed

    const winner = leftResult.stats.avg < rightResult.stats.avg ? 'left' : 'right'
    const metrics = [
      {
        name: 'Average Latency',
        left: leftResult.stats.avg.toFixed(2),
        right: rightResult.stats.avg.toFixed(2),
        unit: 'ms',
        diff: avgDiff,
        winner: avgDiff < 0 ? 'right' : 'left'
      },
      {
        name: '95th Percentile',
        left: leftResult.stats.p95.toFixed(2),
        right: rightResult.stats.p95.toFixed(2),
        unit: 'ms',
        diff: p95Diff,
        winner: p95Diff < 0 ? 'right' : 'left'
      },
      {
        name: 'Min Latency',
        left: leftResult.stats.min.toFixed(2),
        right: rightResult.stats.min.toFixed(2),
        unit: 'ms',
        diff: ((rightResult.stats.min - leftResult.stats.min) / leftResult.stats.min) * 100,
        winner: leftResult.stats.min < rightResult.stats.min ? 'left' : 'right'
      },
      {
        name: 'Max Latency',
        left: leftResult.stats.max.toFixed(2),
        right: rightResult.stats.max.toFixed(2),
        unit: 'ms',
        diff: ((rightResult.stats.max - leftResult.stats.max) / leftResult.stats.max) * 100,
        winner: leftResult.stats.max < rightResult.stats.max ? 'left' : 'right'
      },
      {
        name: 'Median',
        left: leftResult.stats.median.toFixed(2),
        right: rightResult.stats.median.toFixed(2),
        unit: 'ms',
        diff: ((rightResult.stats.median - leftResult.stats.median) / leftResult.stats.median) * 100,
        winner: leftResult.stats.median < rightResult.stats.median ? 'left' : 'right'
      },
      {
        name: 'Failed Requests',
        left: leftResult.stats.failed.toString(),
        right: rightResult.stats.failed.toString(),
        unit: '',
        diff: failureDiff,
        winner: leftResult.stats.failed < rightResult.stats.failed ? 'left' : 'right'
      }
    ]

    const leftScore = metrics.filter(m => m.winner === 'left').length
    const rightScore = metrics.filter(m => m.winner === 'right').length

    return {
      metrics,
      winner,
      avgDiff,
      leftScore,
      rightScore
    }
  }, [leftResult, rightResult])

  if (validResults.length < 2) return null

  return (
    <AnimatedCard delay={0.7} className="overflow-hidden bg-gradient-to-br from-background via-background to-indigo-500/5">
      <AnimatedCardHeader>
        <AnimatedCardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{
                rotateY: [0, 180, 360]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <GitCompare className="h-5 w-5 text-indigo-500" />
            </motion.div>
            <span>Intelligent Performance Comparator</span>
          </div>
          {comparison && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-2"
            >
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                Winner: {comparison.winner === 'left' ? 'Left' : 'Right'}
              </span>
            </motion.div>
          )}
        </AnimatedCardTitle>
        <AnimatedCardDescription>
          Side-by-side comparison with AI-powered insights
        </AnimatedCardDescription>
      </AnimatedCardHeader>

      <AnimatedCardContent>
        {/* Test Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2">Test A</label>
            <select
              className="w-full p-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary text-sm"
              value={selectedLeft}
              onChange={(e) => setSelectedLeft(e.target.value)}
            >
              {validResults.map((result) => (
                <option key={result.id} value={result.id}>
                  {result.url} - {new Date(result.timestamp).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Test B</label>
            <select
              className="w-full p-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary text-sm"
              value={selectedRight}
              onChange={(e) => setSelectedRight(e.target.value)}
            >
              {validResults.map((result) => (
                <option key={result.id} value={result.id}>
                  {result.url} - {new Date(result.timestamp).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {comparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "relative overflow-hidden rounded-lg border-2 p-6 transition-all",
                  comparison.winner === 'left'
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-gray-300 dark:border-gray-700"
                )}
              >
                {comparison.winner === 'left' && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-4 right-4"
                  >
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </motion.div>
                )}
                <div className="text-3xl font-bold mb-2">{comparison.leftScore}</div>
                <div className="text-sm text-muted-foreground">Metrics Won</div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Test A Performance
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "relative overflow-hidden rounded-lg border-2 p-6 transition-all",
                  comparison.winner === 'right'
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-gray-300 dark:border-gray-700"
                )}
              >
                {comparison.winner === 'right' && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-4 right-4"
                  >
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </motion.div>
                )}
                <div className="text-3xl font-bold mb-2">{comparison.rightScore}</div>
                <div className="text-sm text-muted-foreground">Metrics Won</div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Test B Performance
                </div>
              </motion.div>
            </div>

            {/* Detailed Metrics Comparison */}
            <div className="space-y-2">
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Detailed Metrics</span>
              </h3>

              {comparison.metrics.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <div className="grid grid-cols-7 gap-2 items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    {/* Left Value */}
                    <div className={cn(
                      "col-span-2 text-right",
                      metric.winner === 'left' ? "font-bold text-green-600" : "text-muted-foreground"
                    )}>
                      {metric.winner === 'left' && <Check className="h-4 w-4 inline mr-1" />}
                      <span className="font-mono">{metric.left}{metric.unit}</span>
                    </div>

                    {/* Metric Name */}
                    <div className="col-span-3 text-center">
                      <div className="font-medium text-sm">{metric.name}</div>
                      <div className={cn(
                        "text-xs flex items-center justify-center space-x-1 mt-1",
                        metric.diff > 0 ? "text-red-500" : "text-green-500"
                      )}>
                        {metric.diff > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{Math.abs(metric.diff).toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Right Value */}
                    <div className={cn(
                      "col-span-2 text-left",
                      metric.winner === 'right' ? "font-bold text-green-600" : "text-muted-foreground"
                    )}>
                      <span className="font-mono">{metric.right}{metric.unit}</span>
                      {metric.winner === 'right' && <Check className="h-4 w-4 inline ml-1" />}
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-1 mt-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.winner === 'left' ? 100 - Math.abs(metric.diff) : 100}%` }}
                      transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                      className={cn(
                        "h-full",
                        metric.winner === 'left' ? "bg-gradient-to-r from-green-500 to-green-300" : "bg-gradient-to-r from-blue-500 to-blue-300"
                      )}
                      style={{
                        marginLeft: metric.winner === 'left' ? '0' : `${Math.abs(metric.diff)}%`
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800"
            >
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">
                    AI Analysis
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Math.abs(comparison.avgDiff) > 20 && (
                      <p className="flex items-start space-x-2">
                        <Flame className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Significant difference detected:</strong> Test{' '}
                          {comparison.winner === 'left' ? 'A' : 'B'} is{' '}
                          {Math.abs(comparison.avgDiff).toFixed(1)}% faster on average
                        </span>
                      </p>
                    )}

                    {comparison.metrics[5].diff !== 0 && (
                      <p className="flex items-start space-x-2">
                        <Target className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Reliability concern:</strong> Test{' '}
                          {comparison.metrics[5].left > comparison.metrics[5].right ? 'A' : 'B'}{' '}
                          has more failures
                        </span>
                      </p>
                    )}

                    {Math.abs(comparison.avgDiff) < 10 && (
                      <p className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Consistent performance:</strong> Both tests show similar results
                          within acceptable variance
                        </span>
                      </p>
                    )}

                    <p className="flex items-start space-x-2">
                      <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Recommendation:</strong>{' '}
                        {comparison.winner === 'left'
                          ? 'Continue with configuration from Test A for optimal performance'
                          : 'Adopt configuration from Test B for better results'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3 pt-4">
              <AnimatedButton variant="outline" size="sm">
                <GitCompare className="h-4 w-4 mr-2" />
                Compare More
              </AnimatedButton>
              <AnimatedButton size="sm">
                <Trophy className="h-4 w-4 mr-2" />
                Save Comparison
              </AnimatedButton>
            </div>
          </motion.div>
        )}
      </AnimatedCardContent>
    </AnimatedCard>
  )
}