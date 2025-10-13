"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, BarChart3, Clock, Zap, Download, GitCompare, Settings, Play, Pause } from "lucide-react"
import { AnimatedButton } from "@/components/ui/AnimatedButton"
import { Input } from "@/components/ui/Input"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardDescription, AnimatedCardContent } from "@/components/ui/AnimatedCard"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import LatencyChart from "@/components/charts/LatencyChart"
import HistogramChart from "@/components/charts/HistogramChart"
import ComparisonChart from "@/components/charts/ComparisonChart"
import RealTimeChart from "@/components/charts/RealTimeChart"
import { formatDuration, cn } from "@/lib/utils"
import type { BenchmarkResult, BenchmarkConfig, BenchmarkType, BenchmarkProgress } from "@/types/benchmark"

export default function Dashboard() {
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
    if (!url.trim()) {
      alert('Please enter a valid URL')
      return
    }
    
    setIsRunning(true)
    setProgress({ current: 0, total: runs, phase: 'preparing' })
    setRealtimeData([])
    
    try {
      const config: BenchmarkConfig = {
        url: url.trim(),
        type: benchmarkType,
        runs,
        timeout,
        ...(benchmarkType !== 'latency' && { concurrent, duration })
      }
      
      setProgress({ current: 0, total: runs, phase: 'running' })
      
      const response = await fetch('/api/benchmark', {
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
      
    } catch (error) {
      console.error('Benchmark error:', error)
      alert(error instanceof Error ? error.message : 'Benchmark failed')
    } finally {
      setIsRunning(false)
      setProgress(null)
    }
  }
  
  const exportResults = () => {
    const exportData = {
      results,
      exportedAt: Date.now(),
      version: '1.0.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `benchmark-results-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  const clearResults = () => {
    if (confirm('Are you sure you want to clear all results?')) {
      setResults([])
      setCurrentResult(null)
      localStorage.removeItem('benchmark-results')
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50"
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
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Activity className="h-8 w-8 text-primary" />
                </motion.div>
                <h1 className="text-2xl font-bold text-foreground">
                  Performance Benchmark Suite
                </h1>
              </div>
              <motion.span 
                className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                v1.0.0
              </motion.span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={exportResults}
                disabled={results.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </AnimatedButton>
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={clearResults}
                disabled={results.length === 0}
              >
                Clear All
              </AnimatedButton>
              <ThemeToggle />
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
                  <label className="block text-sm font-medium mb-2">Target URL</label>
                  <Input
                    type="url"
                    placeholder="https://api.example.com/endpoint"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isRunning}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Benchmark Type</label>
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
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                {benchmarkType === 'latency' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Runs</label>
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
                      <label className="block text-sm font-medium mb-2">Concurrent Requests</label>
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
                      <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
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
                  <label className="block text-sm font-medium mb-2">Timeout (ms)</label>
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
                <RealTimeChart
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
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: stat.delay,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className={cn(
                    "relative overflow-hidden rounded-lg border p-4 transition-all duration-300 cursor-help group",
                    stat.bgColor,
                    stat.borderColor,
                    "hover:shadow-lg hover:shadow-primary/5"
                  )}
                  title={stat.description}
                >
                  {/* Background animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Icon */}
                  <motion.div
                    className="absolute top-2 right-2 text-lg opacity-20 group-hover:opacity-60"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: stat.delay }}
                  >
                    {stat.icon}
                  </motion.div>
                  
                  {/* Value with counting animation */}
                  <motion.div 
                    className={cn("text-2xl font-bold mb-1", stat.color)}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      delay: stat.delay + 0.2 
                    }}
                  >
                    {stat.value}
                  </motion.div>
                  
                  {/* Label */}
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                  
                  {/* Tooltip on hover */}
                  <motion.div
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10"
                    initial={{ y: 10, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1 }}
                  >
                    {stat.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
                  </motion.div>
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
              transition={{ duration: 0.6, staggerChildren: 0.2 }}
            >
              <AnimatedCard delay={0.3}>
                <AnimatedCardHeader>
                  <AnimatedCardTitle className="flex items-center space-x-2">
                    <motion.div whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.3 }}>
                      <Clock className="h-5 w-5" />
                    </motion.div>
                    <span>Response Time Trend</span>
                  </AnimatedCardTitle>
                </AnimatedCardHeader>
                <AnimatedCardContent>
                  <LatencyChart data={currentResult.results} />
                </AnimatedCardContent>
              </AnimatedCard>
              
              <AnimatedCard delay={0.4}>
                <AnimatedCardHeader>
                  <AnimatedCardTitle className="flex items-center space-x-2">
                    <motion.div whileHover={{ scale: 1.2, rotate: -360 }} transition={{ duration: 0.3 }}>
                      <BarChart3 className="h-5 w-5" />
                    </motion.div>
                    <span>Response Time Distribution</span>
                  </AnimatedCardTitle>
                </AnimatedCardHeader>
                <AnimatedCardContent>
                  <HistogramChart data={currentResult.results} />
                </AnimatedCardContent>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Comparison Chart */}
        <AnimatePresence>
          {results.length > 1 && (
            <AnimatedCard delay={0.5}>
              <AnimatedCardHeader>
                <AnimatedCardTitle className="flex items-center space-x-2">
                  <motion.div whileHover={{ scale: 1.2, rotateY: 180 }} transition={{ duration: 0.3 }}>
                    <GitCompare className="h-5 w-5" />
                  </motion.div>
                  <span>Performance Comparison</span>
                </AnimatedCardTitle>
                <AnimatedCardDescription>
                  Compare recent benchmark results
                </AnimatedCardDescription>
              </AnimatedCardHeader>
              <AnimatedCardContent>
                <ComparisonChart results={results.slice(0, 5)} metric="avg" />
              </AnimatedCardContent>
            </AnimatedCard>
          )}
        </AnimatePresence>
        
        {/* Results History */}
        <AnimatePresence>
          {results.length > 0 && (
            <AnimatedCard delay={0.6}>
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
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
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
                        <motion.div 
                          className="font-mono text-sm"
                          whileHover={{ scale: 1.1 }}
                        >
                          {result.stats ? formatDuration(result.stats.avg) : 'Failed'}
                        </motion.div>
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
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <AnimatedCard delay={0.3}>
                <AnimatedCardHeader>
                  <AnimatedCardTitle className="flex items-center space-x-2">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      👋
                    </motion.div>
                    <span>Getting Started</span>
                  </AnimatedCardTitle>
                  <AnimatedCardDescription>
                    Welcome to the Performance Benchmark Suite - Your complete API testing companion
                  </AnimatedCardDescription>
                </AnimatedCardHeader>
                <AnimatedCardContent>
                  <div className="space-y-6">
                    <motion.p 
                      className="text-muted-foreground text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      This professional-grade tool helps you analyze API performance with comprehensive benchmarking capabilities.
                      <br />
                      <span className="text-primary font-medium">Hover over each test type to learn more!</span>
                    </motion.p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          icon: "🚀",
                          title: "Latency Testing",
                          description: "Measure response times with sequential requests to understand baseline performance.",
                          color: "border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950",
                          iconColor: "text-blue-600",
                          delay: 1,
                          details: "Perfect for SLA validation and performance regression testing"
                        },
                        {
                          icon: "📊",
                          title: "Throughput Testing",
                          description: "Test concurrent request handling to measure maximum throughput capacity.",
                          color: "border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950",
                          iconColor: "text-green-600",
                          delay: 1.2,
                          details: "Ideal for scalability assessment and resource utilization analysis"
                        },
                        {
                          icon: "🔧",
                          title: "Load Testing",
                          description: "Simulate realistic load patterns to understand performance under normal conditions.",
                          color: "border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950",
                          iconColor: "text-orange-600",
                          delay: 1.4,
                          details: "Great for production readiness validation and capacity planning"
                        },
                        {
                          icon: "⚡",
                          title: "Stress Testing",
                          description: "Push your API to its limits to identify breaking points and failure modes.",
                          color: "border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950",
                          iconColor: "text-red-600",
                          delay: 1.6,
                          details: "Essential for failure mode analysis and system resilience testing"
                        }
                      ].map((item, index) => (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, y: 30, rotateX: -15 }}
                          animate={{ opacity: 1, y: 0, rotateX: 0 }}
                          transition={{ 
                            duration: 0.6, 
                            delay: item.delay,
                            ease: "easeOut"
                          }}
                          whileHover={{ 
                            scale: 1.05, 
                            y: -5,
                            transition: { duration: 0.2 }
                          }}
                          className={cn(
                            "relative p-6 border rounded-lg cursor-pointer transition-all duration-300 group overflow-hidden",
                            item.color
                          )}
                        >
                          {/* Background animation */}
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Floating icon */}
                          <motion.div
                            className="text-3xl mb-3 inline-block"
                            animate={{ 
                              y: [0, -5, 0],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ 
                              duration: 3,
                              repeat: Infinity,
                              delay: index * 0.5
                            }}
                          >
                            {item.icon}
                          </motion.div>
                          
                          <h3 className={cn("font-semibold mb-2 text-lg", item.iconColor)}>
                            {item.title}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {item.description}
                          </p>
                          
                          {/* Hidden details that appear on hover */}
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            whileHover={{ opacity: 1, height: "auto" }}
                            className="text-xs text-muted-foreground italic border-t pt-2 mt-2"
                          >
                            💡 {item.details}
                          </motion.div>
                          
                          {/* Animated border */}
                          <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-lg transition-colors duration-300" />
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Call to action */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 2, duration: 0.5 }}
                      className="text-center mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-2xl mb-2"
                      >
                        🎯
                      </motion.div>
                      <h3 className="font-semibold text-lg mb-2">Ready to start testing?</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enter an API URL above and select your preferred test type to begin benchmarking!
                      </p>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="inline-flex items-center text-primary text-sm font-medium"
                      >
                        Try: https://httpbin.org/delay/1 for a quick demo →
                      </motion.div>
                    </motion.div>
                  </div>
                </AnimatedCardContent>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}