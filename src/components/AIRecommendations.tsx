"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Target,
  Lightbulb,
  CheckCircle,
  ChevronRight,
  Activity,
  Server,
  Database,
  Network,
  Code,
  Settings
} from "lucide-react"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardDescription, AnimatedCardContent } from "@/components/ui/AnimatedCard"
import { AnimatedButton } from "@/components/ui/AnimatedButton"
import { predictPerformance } from "@/lib/aiPredictor"
import { cn } from "@/lib/utils"
import type { BenchmarkResult } from "@/types/benchmark"

interface AIRecommendationsProps {
  results: BenchmarkResult[]
}

interface Recommendation {
  id: string
  category: 'infrastructure' | 'code' | 'database' | 'network' | 'caching' | 'monitoring'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  expectedImprovement: string
  effort: 'low' | 'medium' | 'high'
  timeToImplement: string
  steps: string[]
  metrics: Array<{ label: string; value: string }>
  icon: React.ReactNode
}

export default function AIRecommendations({ results }: AIRecommendationsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedRec, setExpandedRec] = useState<string | null>(null)

  const { predictions, recommendations } = useMemo(() => {
    const predictions = predictPerformance(results)
    const recs: Recommendation[] = []

    if (results.length === 0) return { predictions, recommendations: recs }

    const validResults = results.filter(r => r.stats)
    if (validResults.length === 0) return { predictions, recommendations: recs }

    // Calculate statistics
    const avgLatency = validResults.reduce((sum, r) => sum + r.stats!.avg, 0) / validResults.length
    const avgP95 = validResults.reduce((sum, r) => sum + r.stats!.p95, 0) / validResults.length
    const failureRate = validResults.reduce((sum, r) => sum + r.stats!.failed, 0) /
                       validResults.reduce((sum, r) => sum + r.results.length, 0)

    // Infrastructure Recommendations
    if (avgLatency > 500) {
      recs.push({
        id: 'infra-scaling',
        category: 'infrastructure',
        priority: 'critical',
        title: 'Scale Infrastructure Resources',
        description: 'Average response time exceeds 500ms, indicating insufficient resources',
        expectedImprovement: '40-60% latency reduction',
        effort: 'medium',
        timeToImplement: '1-3 days',
        steps: [
          'Analyze CPU and memory usage during peak loads',
          'Consider horizontal scaling with load balancing',
          'Implement auto-scaling based on traffic patterns',
          'Monitor resource utilization post-scaling'
        ],
        metrics: [
          { label: 'Current Avg', value: `${avgLatency.toFixed(0)}ms` },
          { label: 'Target Avg', value: `${(avgLatency * 0.5).toFixed(0)}ms` },
          { label: 'Expected ROI', value: '3-6 months' }
        ],
        icon: <Server className="h-4 w-4" />
      })
    }

    // Caching Recommendations
    if (avgLatency > 200 && avgLatency < 500) {
      recs.push({
        id: 'cache-implementation',
        category: 'caching',
        priority: 'high',
        title: 'Implement Strategic Caching',
        description: 'Moderate latency detected. Caching can significantly improve response times',
        expectedImprovement: '30-50% faster responses',
        effort: 'medium',
        timeToImplement: '2-5 days',
        steps: [
          'Identify frequently accessed, rarely changing data',
          'Implement Redis or Memcached for in-memory caching',
          'Set appropriate TTL (Time To Live) for cached data',
          'Implement cache invalidation strategies',
          'Add cache hit/miss monitoring'
        ],
        metrics: [
          { label: 'Cache Hit Target', value: '80-90%' },
          { label: 'Expected Latency', value: `${(avgLatency * 0.6).toFixed(0)}ms` },
          { label: 'Cost Impact', value: 'Low' }
        ],
        icon: <Database className="h-4 w-4" />
      })
    }

    // Database Optimization
    if (avgP95 > avgLatency * 2) {
      recs.push({
        id: 'database-optimization',
        category: 'database',
        priority: 'high',
        title: 'Optimize Database Queries',
        description: 'High P95 latency suggests database query optimization opportunities',
        expectedImprovement: '25-40% tail latency reduction',
        effort: 'medium',
        timeToImplement: '3-7 days',
        steps: [
          'Enable slow query logging',
          'Add missing database indexes',
          'Optimize N+1 query patterns',
          'Consider database connection pooling',
          'Implement query result pagination'
        ],
        metrics: [
          { label: 'Current P95', value: `${avgP95.toFixed(0)}ms` },
          { label: 'Target P95', value: `${(avgP95 * 0.7).toFixed(0)}ms` },
          { label: 'Complexity', value: 'Medium' }
        ],
        icon: <Database className="h-4 w-4" />
      })
    }

    // Code Optimization
    if (predictions.healthScore < 70) {
      recs.push({
        id: 'code-optimization',
        category: 'code',
        priority: 'medium',
        title: 'Application Code Optimization',
        description: 'Performance health score indicates optimization opportunities in application code',
        expectedImprovement: '15-25% overall improvement',
        effort: 'high',
        timeToImplement: '1-2 weeks',
        steps: [
          'Profile application to identify bottlenecks',
          'Optimize hot code paths and expensive operations',
          'Reduce synchronous blocking operations',
          'Implement efficient data structures and algorithms',
          'Consider async/parallel processing where applicable'
        ],
        metrics: [
          { label: 'Health Score', value: `${predictions.healthScore.toFixed(0)}/100` },
          { label: 'Target Score', value: '85+/100' },
          { label: 'Technical Debt', value: 'High' }
        ],
        icon: <Code className="h-4 w-4" />
      })
    }

    // Network Optimization
    if (failureRate > 0.05) {
      recs.push({
        id: 'network-reliability',
        category: 'network',
        priority: 'critical',
        title: 'Improve Network Reliability',
        description: `High failure rate (${(failureRate * 100).toFixed(1)}%) indicates network or timeout issues`,
        expectedImprovement: '90%+ success rate',
        effort: 'medium',
        timeToImplement: '3-5 days',
        steps: [
          'Implement exponential backoff retry logic',
          'Add circuit breaker pattern for failing services',
          'Increase timeout thresholds appropriately',
          'Monitor network latency and packet loss',
          'Consider CDN for static content delivery'
        ],
        metrics: [
          { label: 'Current Success', value: `${((1 - failureRate) * 100).toFixed(1)}%` },
          { label: 'Target Success', value: '99.9%' },
          { label: 'Priority', value: 'Critical' }
        ],
        icon: <Network className="h-4 w-4" />
      })
    }

    // Monitoring & Observability
    if (predictions.anomalyScore > 10) {
      recs.push({
        id: 'monitoring-enhancement',
        category: 'monitoring',
        priority: 'high',
        title: 'Enhance Monitoring & Alerting',
        description: 'Frequent anomalies detected. Better observability needed',
        expectedImprovement: 'Faster incident detection',
        effort: 'medium',
        timeToImplement: '2-4 days',
        steps: [
          'Implement comprehensive logging (structured logs)',
          'Set up distributed tracing (e.g., OpenTelemetry)',
          'Configure intelligent alerting thresholds',
          'Create performance dashboards for key metrics',
          'Implement automated anomaly detection'
        ],
        metrics: [
          { label: 'Anomaly Score', value: `${predictions.anomalyScore.toFixed(0)}%` },
          { label: 'MTTR Target', value: '<15 min' },
          { label: 'Alert Accuracy', value: '95%+' }
        ],
        icon: <Activity className="h-4 w-4" />
      })
    }

    // Quick Wins
    if (avgLatency < 200 && predictions.healthScore > 80) {
      recs.push({
        id: 'quick-optimization',
        category: 'code',
        priority: 'low',
        title: 'Performance Fine-Tuning',
        description: 'System performing well. Focus on incremental improvements',
        expectedImprovement: '5-10% optimization',
        effort: 'low',
        timeToImplement: '1-2 days',
        steps: [
          'Enable HTTP/2 or HTTP/3',
          'Implement response compression (gzip/brotli)',
          'Optimize image and asset delivery',
          'Review and clean up unused dependencies',
          'Enable browser caching headers'
        ],
        metrics: [
          { label: 'Current Performance', value: 'Excellent' },
          { label: 'Optimization Goal', value: 'World-class' },
          { label: 'Effort Required', value: 'Minimal' }
        ],
        icon: <Sparkles className="h-4 w-4" />
      })
    }

    return { predictions, recommendations: recs.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })}
  }, [results])

  const categories = [
    { id: 'all', name: 'All', count: recommendations.length },
    { id: 'infrastructure', name: 'Infrastructure', count: recommendations.filter(r => r.category === 'infrastructure').length },
    { id: 'code', name: 'Code', count: recommendations.filter(r => r.category === 'code').length },
    { id: 'database', name: 'Database', count: recommendations.filter(r => r.category === 'database').length },
    { id: 'network', name: 'Network', count: recommendations.filter(r => r.category === 'network').length },
    { id: 'caching', name: 'Caching', count: recommendations.filter(r => r.category === 'caching').length },
    { id: 'monitoring', name: 'Monitoring', count: recommendations.filter(r => r.category === 'monitoring').length }
  ].filter(c => c.count > 0)

  const filteredRecs = selectedCategory === 'all'
    ? recommendations
    : recommendations.filter(r => r.category === selectedCategory)

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-950'
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-950'
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      case 'low': return 'border-blue-500 bg-blue-50 dark:bg-blue-950'
    }
  }

  const getEffortBadge = (effort: Recommendation['effort']) => {
    const colors = {
      low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    }
    return colors[effort]
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <AnimatedCard delay={0.6} className="overflow-hidden bg-gradient-to-br from-background via-background to-purple/5">
      <AnimatedCardHeader>
        <AnimatedCardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Brain className="h-5 w-5 text-purple-500" />
            </motion.div>
            <span>AI-Powered Recommendations</span>
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center space-x-1 text-xs text-purple-500 font-medium"
          >
            <Sparkles className="h-3 w-3" />
            <span>ML-Enhanced</span>
          </motion.div>
        </AnimatedCardTitle>
        <AnimatedCardDescription>
          Intelligent optimization suggestions powered by machine learning analysis
        </AnimatedCardDescription>
      </AnimatedCardHeader>

      <AnimatedCardContent>
        {/* AI Predictions Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Health Score</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {predictions.healthScore.toFixed(0)}
              <span className="text-sm font-normal">/100</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-2 mb-2">
              {predictions.nextHourPrediction.trend === 'improving' ? (
                <TrendingDown className="h-4 w-4 text-purple-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-purple-600" />
              )}
              <span className="text-xs font-medium text-purple-600">Next Hour</span>
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {predictions.nextHourPrediction.avg.toFixed(0)}
              <span className="text-sm font-normal">ms</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-600">Confidence</span>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {predictions.nextHourPrediction.confidence.toFixed(0)}
              <span className="text-sm font-normal">%</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-600">Actions</span>
            </div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {recommendations.length}
              <span className="text-sm font-normal"> items</span>
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <AnimatedButton
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-xs"
            >
              {category.name}
              <span className="ml-1 bg-background/50 px-1.5 py-0.5 rounded-full">
                {category.count}
              </span>
            </AnimatedButton>
          ))}
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredRecs.map((rec, index) => (
              <motion.div
                key={rec.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "border-l-4 rounded-lg p-4 transition-all hover:shadow-lg cursor-pointer",
                  getPriorityColor(rec.priority)
                )}
                onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 rounded-lg bg-background/70">
                      {rec.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          getEffortBadge(rec.effort)
                        )}>
                          {rec.effort} effort
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {rec.timeToImplement}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {rec.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                          <TrendingUp className="h-3 w-3" />
                          <span>{rec.expectedImprovement}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: expandedRec === rec.id ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {expandedRec === rec.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pt-4 border-t space-y-4"
                    >
                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-3">
                        {rec.metrics.map((metric, i) => (
                          <div key={i} className="bg-background/50 rounded-lg p-2">
                            <div className="text-xs text-muted-foreground">{metric.label}</div>
                            <div className="font-mono font-semibold text-sm mt-0.5">{metric.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Implementation Steps */}
                      <div>
                        <h5 className="font-medium text-sm mb-2 flex items-center space-x-2">
                          <Settings className="h-4 w-4" />
                          <span>Implementation Steps</span>
                        </h5>
                        <ol className="space-y-2">
                          {rec.steps.map((step, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-start space-x-2 text-sm"
                            >
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium mt-0.5">
                                {i + 1}
                              </span>
                              <span className="flex-1">{step}</span>
                            </motion.li>
                          ))}
                        </ol>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  )
}