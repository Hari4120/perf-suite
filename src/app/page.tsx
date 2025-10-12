"use client"

import { useState, useEffect } from "react"
import { Activity, BarChart3, Clock, Zap, Download, GitCompare, Settings, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { ThemeToggle } from "@/components/ThemeToggle"
import LatencyChart from "@/components/charts/LatencyChart"
import HistogramChart from "@/components/charts/HistogramChart"
import ComparisonChart from "@/components/charts/ComparisonChart"
import RealTimeChart from "@/components/charts/RealTimeChart"
import { formatDuration } from "@/lib/utils"
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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">
                  Performance Benchmark Suite
                </h1>
              </div>
              <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
                v1.0.0
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportResults}
                disabled={results.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearResults}
                disabled={results.length === 0}
              >
                Clear All
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Benchmark Configuration</span>
            </CardTitle>
            <CardDescription>
              Configure your performance benchmark settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <div className="flex items-center space-x-4">
                {progress && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="capitalize">{progress.phase}</span>
                    </div>
                    <span>({progress.current}/{progress.total})</span>
                  </div>
                )}
              </div>
              
              <Button
                onClick={runBenchmark}
                disabled={isRunning || !url.trim()}
                className="min-w-[120px]"
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
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Real-time Chart */}
        {(isRunning || realtimeData.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Real-time Performance</span>
              </CardTitle>
              <CardDescription>
                Live response time monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RealTimeChart
                data={realtimeData}
                isActive={isRunning}
                label="Response Time (ms)"
              />
            </CardContent>
          </Card>
        )}
        
        {/* Current Result Stats */}
        {currentResult?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {formatDuration(currentResult.stats.avg)}
                </div>
                <div className="text-sm text-muted-foreground">Average</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {formatDuration(currentResult.stats.min)}
                </div>
                <div className="text-sm text-muted-foreground">Minimum</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {formatDuration(currentResult.stats.max)}
                </div>
                <div className="text-sm text-muted-foreground">Maximum</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {formatDuration(currentResult.stats.median)}
                </div>
                <div className="text-sm text-muted-foreground">Median</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {formatDuration(currentResult.stats.p95)}
                </div>
                <div className="text-sm text-muted-foreground">95th %ile</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-600">
                  {currentResult.stats.failed}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Charts Grid */}
        {currentResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Response Time Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LatencyChart data={currentResult.results} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Response Time Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HistogramChart data={currentResult.results} />
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Comparison Chart */}
        {results.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitCompare className="h-5 w-5" />
                <span>Performance Comparison</span>
              </CardTitle>
              <CardDescription>
                Compare recent benchmark results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComparisonChart results={results.slice(0, 5)} metric="avg" />
            </CardContent>
          </Card>
        )}
        
        {/* Results History */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
              <CardDescription>
                Last {results.length} benchmark results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium truncate">{result.url}</div>
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Getting Started */}
        {results.length === 0 && !currentResult && (
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Welcome to the Performance Benchmark Suite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  This tool helps you analyze API performance with comprehensive benchmarking capabilities.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">🚀 Latency Testing</h3>
                    <p className="text-sm text-muted-foreground">
                      Measure response times with sequential requests to understand baseline performance.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">📊 Throughput Testing</h3>
                    <p className="text-sm text-muted-foreground">
                      Test concurrent request handling to measure maximum throughput capacity.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">🔧 Load Testing</h3>
                    <p className="text-sm text-muted-foreground">
                      Simulate realistic load patterns to understand performance under normal conditions.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">⚡ Stress Testing</h3>
                    <p className="text-sm text-muted-foreground">
                      Push your API to its limits to identify breaking points and failure modes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}