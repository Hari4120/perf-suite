"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  BarChart3,
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardDescription, AnimatedCardContent } from "@/components/ui/AnimatedCard"
import { AnimatedButton } from "@/components/ui/AnimatedButton"
import { cn } from "@/lib/utils"
import type { BenchmarkResult } from "@/types/benchmark"

interface PerformanceInsightsProps {
  results: BenchmarkResult[]
}

interface Insight {
  id: string
  type: 'positive' | 'negative' | 'warning' | 'neutral'
  icon: React.ReactNode
  title: string
  description: string
  value?: string
  trend?: 'up' | 'down' | 'stable'
  confidence: number // 0-100
  actionable: boolean
  category: 'performance' | 'reliability' | 'trends' | 'recommendations'
}

export default function PerformanceInsights({ results }: PerformanceInsightsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const insights = useMemo(() => {
    if (results.length === 0) return []
    
    const validResults = results.filter(r => r.stats)
    if (validResults.length === 0) return []
    
    const insights: Insight[] = []
    
    // Calculate overall statistics
    const avgLatencies = validResults.map(r => r.stats!.avg)
    const overallAvg = avgLatencies.reduce((sum, avg) => sum + avg, 0) / avgLatencies.length
    const totalRequests = validResults.reduce((sum, r) => sum + r.results.length, 0)
    const totalFailed = validResults.reduce((sum, r) => sum + (r.stats?.failed || 0), 0)
    const successRate = ((totalRequests - totalFailed) / totalRequests) * 100
    
    // Performance insights
    if (overallAvg < 100) {
      insights.push({
        id: 'fast-performance',
        type: 'positive',
        icon: <Zap className="h-4 w-4" />,
        title: 'Excellent Performance',
        description: 'Average response time is under 100ms, indicating excellent performance.',
        value: `${overallAvg.toFixed(1)}ms avg`,
        confidence: 95,
        actionable: false,
        category: 'performance'
      })
    } else if (overallAvg > 500) {
      insights.push({
        id: 'slow-performance',
        type: 'negative',
        icon: <Clock className="h-4 w-4" />,
        title: 'Slow Response Times',
        description: 'Average response time exceeds 500ms. Consider optimization.',
        value: `${overallAvg.toFixed(1)}ms avg`,
        confidence: 90,
        actionable: true,
        category: 'performance'
      })
    } else if (overallAvg > 200) {
      insights.push({
        id: 'moderate-performance',
        type: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Moderate Performance',
        description: 'Response times are acceptable but could be improved.',
        value: `${overallAvg.toFixed(1)}ms avg`,
        confidence: 80,
        actionable: true,
        category: 'performance'
      })
    }
    
    // Reliability insights
    if (successRate >= 99.5) {
      insights.push({
        id: 'high-reliability',
        type: 'positive',
        icon: <CheckCircle className="h-4 w-4" />,
        title: 'High Reliability',
        description: 'Excellent success rate indicates stable service.',
        value: `${successRate.toFixed(1)}%`,
        confidence: 95,
        actionable: false,
        category: 'reliability'
      })
    } else if (successRate < 95) {
      insights.push({
        id: 'reliability-issues',
        type: 'negative',
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Reliability Concerns',
        description: 'High failure rate detected. Investigate error patterns.',
        value: `${successRate.toFixed(1)}%`,
        confidence: 90,
        actionable: true,
        category: 'reliability'
      })
    }
    
    // Trend analysis (if we have multiple results)
    if (validResults.length >= 3) {
      const recentResults = validResults.slice(0, Math.ceil(validResults.length / 2))
      const olderResults = validResults.slice(Math.ceil(validResults.length / 2))
      
      const recentAvg = recentResults.reduce((sum, r) => sum + r.stats!.avg, 0) / recentResults.length
      const olderAvg = olderResults.reduce((sum, r) => sum + r.stats!.avg, 0) / olderResults.length
      
      const improvement = ((olderAvg - recentAvg) / olderAvg) * 100
      
      if (improvement > 10) {
        insights.push({
          id: 'improving-trend',
          type: 'positive',
          icon: <TrendingDown className="h-4 w-4" />,
          title: 'Performance Improving',
          description: 'Recent tests show significant performance improvement.',
          value: `${improvement.toFixed(1)}% faster`,
          trend: 'up',
          confidence: 85,
          actionable: false,
          category: 'trends'
        })
      } else if (improvement < -10) {
        insights.push({
          id: 'degrading-trend',
          type: 'negative',
          icon: <TrendingUp className="h-4 w-4" />,
          title: 'Performance Degrading',
          description: 'Recent tests indicate performance regression.',
          value: `${Math.abs(improvement).toFixed(1)}% slower`,
          trend: 'down',
          confidence: 85,
          actionable: true,
          category: 'trends'
        })
      }
    }
    
    // Variability insights
    const latencyStdDev = Math.sqrt(
      avgLatencies.reduce((sum, avg) => sum + Math.pow(avg - overallAvg, 2), 0) / avgLatencies.length
    )
    
    const coefficientOfVariation = (latencyStdDev / overallAvg) * 100
    
    if (coefficientOfVariation > 30) {
      insights.push({
        id: 'high-variability',
        type: 'warning',
        icon: <Activity className="h-4 w-4" />,
        title: 'High Performance Variability',
        description: 'Response times vary significantly between tests.',
        value: `${coefficientOfVariation.toFixed(1)}% CV`,
        confidence: 80,
        actionable: true,
        category: 'performance'
      })
    } else if (coefficientOfVariation < 10) {
      insights.push({
        id: 'low-variability',
        type: 'positive',
        icon: <Target className="h-4 w-4" />,
        title: 'Consistent Performance',
        description: 'Response times are very consistent across tests.',
        value: `${coefficientOfVariation.toFixed(1)}% CV`,
        confidence: 90,
        actionable: false,
        category: 'performance'
      })
    }
    
    // Recommendations based on test types
    const testTypes = [...new Set(validResults.map(r => r.benchmarkType))]
    
    if (testTypes.includes('latency') && !testTypes.includes('load')) {
      insights.push({
        id: 'recommend-load-test',
        type: 'neutral',
        icon: <BarChart3 className="h-4 w-4" />,
        title: 'Consider Load Testing',
        description: 'Add load testing to understand performance under concurrent requests.',
        confidence: 70,
        actionable: true,
        category: 'recommendations'
      })
    }
    
    if (validResults.some(r => r.stats!.p95 > r.stats!.avg * 2)) {
      insights.push({
        id: 'tail-latency',
        type: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'High Tail Latency',
        description: '95th percentile is significantly higher than average. Check for outliers.',
        confidence: 85,
        actionable: true,
        category: 'performance'
      })
    }
    
    return insights
  }, [results])
  
  const categories = [
    { id: 'all', name: 'All Insights', count: insights.length },
    { id: 'performance', name: 'Performance', count: insights.filter(i => i.category === 'performance').length },
    { id: 'reliability', name: 'Reliability', count: insights.filter(i => i.category === 'reliability').length },
    { id: 'trends', name: 'Trends', count: insights.filter(i => i.category === 'trends').length },
    { id: 'recommendations', name: 'Recommendations', count: insights.filter(i => i.category === 'recommendations').length }
  ].filter(c => c.count > 0)
  
  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(i => i.category === selectedCategory)
    
  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive': return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950'
      case 'negative': return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950'
      case 'warning': return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950'
      case 'neutral': return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950'
    }
  }
  
  const getInsightIconColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive': return 'text-green-600 dark:text-green-400'
      case 'negative': return 'text-red-600 dark:text-red-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'neutral': return 'text-blue-600 dark:text-blue-400'
    }
  }
  
  const getTrendIcon = (trend?: Insight['trend']) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-3 w-3 text-green-500" />
      case 'down': return <ArrowDown className="h-3 w-3 text-red-500" />
      case 'stable': return <Minus className="h-3 w-3 text-gray-500" />
      default: return null
    }
  }

  if (insights.length === 0) {
    return null
  }

  return (
    <AnimatedCard delay={0.3}>
      <AnimatedCardHeader>
        <AnimatedCardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Performance Insights</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {insights.length} insight{insights.length !== 1 ? 's' : ''}
          </div>
        </AnimatedCardTitle>
        <AnimatedCardDescription>
          AI-powered analysis of your performance data
        </AnimatedCardDescription>
      </AnimatedCardHeader>
      
      <AnimatedCardContent>
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
              <span className="ml-1 bg-background/50 px-1.5 py-0.5 rounded-full text-xs">
                {category.count}
              </span>
            </AnimatedButton>
          ))}
        </div>
        
        {/* Insights Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {filteredInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "border rounded-lg p-4 transition-all duration-200 hover:shadow-sm",
                  getInsightColor(insight.type)
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "p-2 rounded-md bg-background/50",
                    getInsightIconColor(insight.type)
                  )}>
                    {insight.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      {insight.trend && getTrendIcon(insight.trend)}
                      {insight.value && (
                        <span className="text-sm font-mono bg-background/50 px-2 py-1 rounded">
                          {insight.value}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Confidence: {insight.confidence}%</span>
                        {insight.actionable && (
                          <span className="flex items-center space-x-1">
                            <Target className="h-3 w-3" />
                            <span>Actionable</span>
                          </span>
                        )}
                      </div>
                      
                      {/* Confidence Bar */}
                      <div className="w-16 h-1.5 bg-background/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${insight.confidence}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={cn(
                            "h-full rounded-full",
                            insight.confidence >= 80 ? "bg-green-500" :
                            insight.confidence >= 60 ? "bg-yellow-500" : "bg-red-500"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        
        {filteredInsights.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No insights available for this category</p>
          </div>
        )}
      </AnimatedCardContent>
    </AnimatedCard>
  )
}