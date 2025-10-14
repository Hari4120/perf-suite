"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, BarChart3, Clock, Zap, GitCompare, Settings, Play, Pause } from "lucide-react"
import { AnimatedButton } from "@/components/ui/AnimatedButton"
import { Input } from "@/components/ui/Input"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardDescription, AnimatedCardContent } from "@/components/ui/AnimatedCard"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import FAQ from "@/components/FAQ"
import NetworkTests from "@/components/NetworkTests"
import RealTimeMonitor from "@/components/RealTimeMonitor"
import KnowledgeBase from "@/components/KnowledgeBase"
import HelpSystem from "@/components/HelpSystem"
import ExportSystem from "@/components/ExportSystem"
import Footer from "@/components/Footer"
import PerformanceInsights from "@/components/PerformanceInsights"
import { useNotify } from "@/components/NotificationSystem"
import { Tooltip } from "@/components/ui/Tooltip"
import PerformanceTimeline from "@/components/PerformanceTimeline"
import AnomalyDetector from "@/components/AnomalyDetector"
import AIRecommendations from "@/components/AIRecommendations"
import IntelligentComparator from "@/components/IntelligentComparator"
import { LazyLatencyChart, LazyHistogramChart, LazyComparisonChart, LazyRealTimeChart } from "@/components/LazyCharts"
import { formatDuration, cn } from "@/lib/utils"
import type { BenchmarkResult, BenchmarkType, BenchmarkProgress } from "@/types/benchmark"

export default function Dashboard() {
  const notify = useNotify()
  const [url, setUrl] = useState("")
  const [benchmarkType, setBenchmarkType] = useState<BenchmarkType>("latency")
  const [runs, setRuns] = useState(10)
  const [concurrent, setConcurrent] = useState(10)
  const [duration, setDuration] = useState(30)
  const [timeout, setTimeout] = useState(10000)
  
  const [currentResult, setCurrentResult] = useState<BenchmarkResult | null>(null)
  const [results, setResults] = useState<BenchmarkResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<BenchmarkProgress | null>(null)
  const [realtimeData, setRealtimeData] = useState<number[]>([])
  
  // Load saved results from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('benchmark-results')
    if (saved) {
      try {
        setResults(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load saved results:', e)
      }
    }
  }, [])
  
  // Save results to localStorage
  useEffect(() => {
    if (results.length > 0) {
      localStorage.setItem('benchmark-results', JSON.stringify(results))
    }
  }, [results])
  
  const runBenchmark = async () => {
    // Network tests don't require URL
    const networkTests = ['speed-test', 'buffer-bloat', 'dns-test', 'network-quality']
    
    if (!networkTests.includes(benchmarkType) && !url.trim()) {
      notify.warning('URL Required', 'Please enter a valid URL to run the benchmark')
      return
    }
    
    setIsRunning(true)
    setProgress({ current: 0, total: runs, phase: 'preparing' })
    setRealtimeData([])
    
    try {
      let apiEndpoint = '/api/benchmark'
      let config: Record<string, unknown> = {
        url: url.trim(),
        type: benchmarkType,
        runs,
        timeout,
        ...(benchmarkType !== 'latency' && !networkTests.includes(benchmarkType) && { concurrent, duration })
      }
      
      // Use network-test API for network tests
      if (networkTests.includes(benchmarkType)) {
        apiEndpoint = '/api/network-test'
        config = { type: benchmarkType }
      }
      
      setProgress({ current: 0, total: runs, phase: 'running' })
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Benchmark failed')
      }
      
      const result: BenchmarkResult = await response.json()
      
      setProgress({ current: result.results.length, total: result.results.length, phase: 'complete' })
      setCurrentResult(result)
      setResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
      setRealtimeData(result.results.filter(r => r > 0))
      
      // Show success notification
      const avgTime = result.stats?.avg || 0
      const successRate = result.stats ? (((result.results.length - result.stats.failed) / result.results.length) * 100) : 0
      notify.success(
        'Benchmark Complete!',
        `Average response time: ${avgTime.toFixed(2)}ms • Success rate: ${successRate.toFixed(1)}%`
      )
      
    } catch (error) {
      console.error('Benchmark error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Benchmark failed'
      notify.error('Benchmark Failed', errorMessage)
    } finally {
      setIsRunning(false)
      setProgress(null)
    }
  }
  
  
  const clearResults = () => {
    if (confirm('Are you sure you want to clear all results?')) {
      const resultCount = results.length
      setResults([])
      setCurrentResult(null)
      localStorage.removeItem('benchmark-results')
      notify.info('Results Cleared', `Removed ${resultCount} benchmark results`)
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <Activity className="h-9 w-9 text-primary" />
                  <motion.div 
                    className="absolute -inset-1 rounded-full bg-primary/20"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground leading-none">
                    Performance Benchmark Suite
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium mt-1">
                    Professional Network Diagnostics & API Testing Platform
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.span 
                  className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full font-mono"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  v1.0.0
                </motion.span>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="flex items-center space-x-1 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium"
                >
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span>Live</span>
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Real-time monitoring</span>
                <div className="w-px h-4 bg-border mx-2" />
                <BarChart3 className="h-4 w-4" />
                <span>Advanced analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExportSystem 
                  results={results}
                  disabled={results.length === 0}
                />
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={clearResults}
                  disabled={results.length === 0}
                >
                  Clear All
                </AnimatedButton>
                <ThemeToggle />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Configuration Panel */}
        <AnimatedCard delay={0.1}>
          <AnimatedCardHeader>
            <AnimatedCardTitle className="flex items-center space-x-2">
              <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                <Settings className="h-5 w-5" />
              </motion.div>
              <span>Benchmark Configuration</span>
            </AnimatedCardTitle>
            <AnimatedCardDescription>
              Configure your performance benchmark settings
            </AnimatedCardDescription>
          </AnimatedCardHeader>
          <AnimatedCardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Tooltip content="Enter the API endpoint URL you want to test. For network tests, this field is optional.">
                    <label className="block text-sm font-medium mb-2 cursor-help">Target URL</label>
                  </Tooltip>
                  <Input
                    type="url"
                    placeholder="https://api.example.com/endpoint"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isRunning}
                  />
                </div>
                
                <div>
                  <Tooltip content="Choose the type of test to perform. Latency tests response time, throughput tests concurrent capacity, load tests realistic traffic, stress tests breaking points, and network tests measure internet connection quality.">
                    <label className="block text-sm font-medium mb-2 cursor-help">Benchmark Type</label>
                  </Tooltip>
                  <select
                    className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={benchmarkType}
                    onChange={(e) => setBenchmarkType(e.target.value as BenchmarkType)}
                    disabled={isRunning}
                  >
                    <option value="latency">Latency Test</option>
                    <option value="throughput">Throughput Test</option>
                    <option value="load">Load Test</option>
                    <option value="stress">Stress Test</option>
                    <option value="speed-test">Speed Test</option>
                    <option value="buffer-bloat">Buffer Bloat Test</option>
                    <option value="dns-test">DNS Test</option>
                    <option value="network-quality">Network Quality</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                {benchmarkType === 'latency' ? (
                  <div>
                    <Tooltip content="Number of sequential requests to make. More runs provide better statistical accuracy but take longer.">
                      <label className="block text-sm font-medium mb-2 cursor-help">Number of Runs</label>
                    </Tooltip>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={runs}
                      onChange={(e) => setRuns(parseInt(e.target.value) || 10)}
                      disabled={isRunning}
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <Tooltip content="Number of requests to send simultaneously. Higher values test server capacity under load but may impact your local performance.">
                        <label className="block text-sm font-medium mb-2 cursor-help">Concurrent Requests</label>
                      </Tooltip>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={concurrent}
                        onChange={(e) => setConcurrent(parseInt(e.target.value) || 10)}
                        disabled={isRunning}
                      />
                    </div>
                    <div>
                      <Tooltip content="How long to sustain the test load. Longer durations provide more comprehensive results and help identify performance patterns.">
                        <label className="block text-sm font-medium mb-2 cursor-help">Duration (seconds)</label>
                      </Tooltip>
                      <Input
                        type="number"
                        min="5"
                        max="300"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                        disabled={isRunning}
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <Tooltip content="Maximum time to wait for each request response. Higher values allow slow endpoints to complete, lower values identify unresponsive services faster.">
                    <label className="block text-sm font-medium mb-2 cursor-help">Timeout (ms)</label>
                  </Tooltip>
                  <Input
                    type="number"
                    min="1000"
                    max="60000"
                    value={timeout}
                    onChange={(e) => setTimeout(parseInt(e.target.value) || 10000)}
                    disabled={isRunning}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <AnimatePresence>
                {progress && (
                  <motion.div 
                    className="flex items-center space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoadingSpinner 
                      size="sm" 
                      text={`${progress.phase}...`}
                      progress={(progress.current / progress.total) * 100}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatedButton
                onClick={runBenchmark}
                disabled={isRunning || !url.trim()}
                loading={isRunning}
                className="min-w-[140px]"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Benchmark
                  </>
                )}
              </AnimatedButton>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
        
        {/* Real-time Chart */}
        <AnimatePresence>
          {(isRunning || realtimeData.length > 0) && (
            <AnimatedCard delay={0.2}>
              <AnimatedCardHeader>
                <AnimatedCardTitle className="flex items-center space-x-2">
                  <motion.div
                    animate={{ 
                      scale: isRunning ? [1, 1.2, 1] : 1,
                      rotate: isRunning ? [0, 360] : 0 
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: isRunning ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </motion.div>
                  <span>Real-time Performance</span>
                </AnimatedCardTitle>
                <AnimatedCardDescription>
                  Live response time monitoring
                </AnimatedCardDescription>
              </AnimatedCardHeader>
              <AnimatedCardContent>
                <LazyRealTimeChart
                  data={realtimeData}
                  isActive={isRunning}
                  label="Response Time (ms)"
                />
              </AnimatedCardContent>
            </AnimatedCard>
          )}
        </AnimatePresence>
        
        {/* Current Result Stats */}
        <AnimatePresence>
          {currentResult?.stats && (
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {[
                { 
                  value: formatDuration(currentResult.stats.avg), 
                  label: "Average", 
                  color: "text-green-600", 
                  bgColor: "bg-green-50 dark:bg-green-950",
                  borderColor: "border-green-200 dark:border-green-800",
                  description: "Mean response time across all requests",
                  icon: "📊",
                  delay: 0
                },
                { 
                  value: formatDuration(currentResult.stats.min), 
                  label: "Minimum", 
                  color: "text-blue-600", 
                  bgColor: "bg-blue-50 dark:bg-blue-950",
                  borderColor: "border-blue-200 dark:border-blue-800",
                  description: "Fastest response time achieved",
                  icon: "⚡",
                  delay: 0.1
                },
                { 
                  value: formatDuration(currentResult.stats.max), 
                  label: "Maximum", 
                  color: "text-orange-600", 
                  bgColor: "bg-orange-50 dark:bg-orange-950",
                  borderColor: "border-orange-200 dark:border-orange-800",
                  description: "Slowest response time encountered",
                  icon: "🐌",
                  delay: 0.2
                },
                { 
                  value: formatDuration(currentResult.stats.median), 
                  label: "Median", 
                  color: "text-purple-600", 
                  bgColor: "bg-purple-50 dark:bg-purple-950",
                  borderColor: "border-purple-200 dark:border-purple-800",
                  description: "Middle value - 50% of requests were faster",
                  icon: "🎯",
                  delay: 0.3
                },
                { 
                  value: formatDuration(currentResult.stats.p95), 
                  label: "95th %ile", 
                  color: "text-red-600", 
                  bgColor: "bg-red-50 dark:bg-red-950",
                  borderColor: "border-red-200 dark:border-red-800",
                  description: "95% of requests were faster than this",
                  icon: "📈",
                  delay: 0.4
                },
                { 
                  value: currentResult.stats.failed.toString(), 
                  label: "Failed", 
                  color: "text-gray-600", 
                  bgColor: "bg-gray-50 dark:bg-gray-950",
                  borderColor: "border-gray-200 dark:border-gray-800",
                  description: "Number of failed requests",
                  icon: "❌",
                  delay: 0.5
                }
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    duration: 0.2,
                    delay: stat.delay * 0.03,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  whileHover={{
                    scale: 1.01,
                    y: -1,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  className={cn(
                    "relative overflow-hidden rounded-lg border p-4 transition-all duration-150 group",
                    stat.bgColor,
                    stat.borderColor,
                    "hover:shadow-md"
                  )}
                >
                  {/* Icon */}
                  <div className="absolute top-2 right-2 text-lg opacity-30">
                    {stat.icon}
                  </div>
                  
                  {/* Value */}
                  <div className={cn("text-2xl font-bold mb-1", stat.color)}>
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Charts Grid */}
        <AnimatePresence>
          {currentResult && (
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3, staggerChildren: 0.05 }}
            >
              <AnimatedCard delay={0.05}>
                <AnimatedCardHeader>
                  <AnimatedCardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Response Time Trend</span>
                  </AnimatedCardTitle>
                </AnimatedCardHeader>
                <AnimatedCardContent>
                  <LazyLatencyChart data={currentResult.results} />
                </AnimatedCardContent>
              </AnimatedCard>
              
              <AnimatedCard delay={0.1}>
                <AnimatedCardHeader>
                  <AnimatedCardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Response Time Distribution</span>
                  </AnimatedCardTitle>
                </AnimatedCardHeader>
                <AnimatedCardContent>
                  <LazyHistogramChart data={currentResult.results} />
                </AnimatedCardContent>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Performance Timeline */}
        <AnimatePresence>
          {results.length >= 3 && (
            <PerformanceTimeline results={results} />
          )}
        </AnimatePresence>

        {/* Performance Insights */}
        <AnimatePresence>
          {results.length > 0 && (
            <PerformanceInsights results={results} />
          )}
        </AnimatePresence>

        {/* AI-Powered Recommendations */}
        <AnimatePresence>
          {results.length >= 3 && (
            <AIRecommendations results={results} />
          )}
        </AnimatePresence>

        {/* Anomaly Detection */}
        <AnimatePresence>
          {results.length >= 5 && (
            <AnomalyDetector results={results} />
          )}
        </AnimatePresence>

        {/* Intelligent Comparator */}
        <AnimatePresence>
          {results.length >= 2 && (
            <IntelligentComparator results={results} />
          )}
        </AnimatePresence>

        {/* Comparison Chart */}
        <AnimatePresence>
          {results.length > 1 && (
            <AnimatedCard delay={0.05}>
              <AnimatedCardHeader>
                <AnimatedCardTitle className="flex items-center space-x-2">
                  <GitCompare className="h-5 w-5" />
                  <span>Performance Comparison</span>
                </AnimatedCardTitle>
                <AnimatedCardDescription>
                  Compare recent benchmark results
                </AnimatedCardDescription>
              </AnimatedCardHeader>
              <AnimatedCardContent>
                <LazyComparisonChart results={results.slice(0, 5)} metric="avg" />
              </AnimatedCardContent>
            </AnimatedCard>
          )}
        </AnimatePresence>
        
        {/* Results History */}
        <AnimatePresence>
          {results.length > 0 && (
            <AnimatedCard delay={0.05}>
              <AnimatedCardHeader>
                <AnimatedCardTitle>Recent Results</AnimatedCardTitle>
                <AnimatedCardDescription>
                  Last {results.length} benchmark results
                </AnimatedCardDescription>
              </AnimatedCardHeader>
              <AnimatedCardContent>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.01, x: 2 }}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex-1">
                        <div className="font-medium truncate group-hover:text-primary transition-colors">
                          {result.url}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(result.timestamp).toLocaleString()} • {result.benchmarkType}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm">
                          {result.stats ? formatDuration(result.stats.avg) : 'Failed'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {result.metadata.runs} runs
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatedCardContent>
            </AnimatedCard>
          )}
        </AnimatePresence>
        
        {/* Getting Started */}
        <AnimatePresence>
          {results.length === 0 && !currentResult && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <AnimatedCard delay={0.05}>
                <AnimatedCardHeader>
                  <AnimatedCardTitle className="flex items-center space-x-2">
                    <span>👋</span>
                    <span>Getting Started</span>
                  </AnimatedCardTitle>
                  <AnimatedCardDescription>
                    Welcome to the Performance Benchmark Suite - Your complete API testing companion
                  </AnimatedCardDescription>
                </AnimatedCardHeader>
                <AnimatedCardContent>
                  <div className="space-y-6">
                    <p className="text-muted-foreground text-center">
                      This professional-grade tool helps you analyze API performance with comprehensive benchmarking capabilities.
                      <br />
                      <span className="text-primary font-medium">Hover over each test type to learn more!</span>
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          icon: "🚀",
                          title: "Latency Testing",
                          description: "Measure response times with sequential requests to understand baseline performance.",
                          color: "border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950",
                          iconColor: "text-blue-600",
                          delay: 0.05,
                          details: "Perfect for SLA validation and performance regression testing"
                        },
                        {
                          icon: "📊",
                          title: "Throughput Testing",
                          description: "Test concurrent request handling to measure maximum throughput capacity.",
                          color: "border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950",
                          iconColor: "text-green-600",
                          delay: 0.1,
                          details: "Ideal for scalability assessment and resource utilization analysis"
                        },
                        {
                          icon: "🔧",
                          title: "Load Testing",
                          description: "Simulate realistic load patterns to understand performance under normal conditions.",
                          color: "border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950",
                          iconColor: "text-orange-600",
                          delay: 0.15,
                          details: "Great for production readiness validation and capacity planning"
                        },
                        {
                          icon: "⚡",
                          title: "Stress Testing",
                          description: "Push your API to its limits to identify breaking points and failure modes.",
                          color: "border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950",
                          iconColor: "text-red-600",
                          delay: 0.2,
                          details: "Essential for failure mode analysis and system resilience testing"
                        }
                      ].map((item) => (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: item.delay,
                            ease: [0.25, 0.1, 0.25, 1]
                          }}
                          whileHover={{
                            scale: 1.01,
                            y: -1,
                            transition: { duration: 0.15, ease: "easeOut" }
                          }}
                          className={cn(
                            "relative p-6 border rounded-lg cursor-pointer transition-all duration-300 group overflow-hidden",
                            item.color
                          )}
                        >
                          {/* Icon */}
                          <div className="text-3xl mb-3 inline-block">
                            {item.icon}
                          </div>
                          
                          <h3 className={cn("font-semibold mb-2 text-lg", item.iconColor)}>
                            {item.title}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {item.description}
                          </p>
                          
                          {/* Details on hover */}
                          <div className="text-xs text-muted-foreground italic border-t pt-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            💡 {item.details}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Call to action */}
                    <div className="text-center mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
                      <div className="text-2xl mb-2">🎯</div>
                      <h3 className="font-semibold text-lg mb-2">Ready to start testing?</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enter an API URL above and select your preferred test type to begin benchmarking!
                      </p>
                      <div className="inline-flex items-center text-primary text-sm font-medium">
                        Try: https://httpbin.org/delay/1 for a quick demo →
                      </div>
                    </div>
                  </div>
                </AnimatedCardContent>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Network Testing Suite */}
        <NetworkTests onResult={(result) => {
          setCurrentResult(result)
          setResults(prev => [result, ...prev.slice(0, 9)])
        }} />
        
        {/* Real-Time Network Monitor */}
        <RealTimeMonitor />
        
        {/* Knowledge Base */}
        <KnowledgeBase />
        
        {/* FAQ Section */}
        <FAQ />
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Help System */}
      <HelpSystem context="benchmark" />
    </div>
  )
}