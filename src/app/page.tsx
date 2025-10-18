"use client"

import { useState } from "react"
import { Play, Download } from "lucide-react"
import { AnimatedButton } from "@/components/ui/AnimatedButton"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { ThemeToggle } from "@/components/ThemeToggle"
import NetworkTests from "@/components/NetworkTests"
import { LazyLatencyChart, LazyHistogramChart } from "@/components/LazyCharts"
import { formatDuration } from "@/lib/utils"
import type { BenchmarkResult, BenchmarkType } from "@/types/benchmark"

export default function Dashboard() {
  const [url, setUrl] = useState("")
  const [benchmarkType, setBenchmarkType] = useState<BenchmarkType>("latency")
  const [runs, setRuns] = useState(10)
  const [timeout, setTimeout] = useState(10000)
  const [currentResult, setCurrentResult] = useState<BenchmarkResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runBenchmark = async () => {
    if (!url.trim()) {
      alert("Please enter a URL")
      return
    }

    setIsRunning(true)

    try {
      const response = await fetch('/api/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          type: benchmarkType,
          runs,
          timeout
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Benchmark failed')
      }

      const result: BenchmarkResult = await response.json()
      setCurrentResult(result)
    } catch (error) {
      console.error('Benchmark error:', error)
      alert(error instanceof Error ? error.message : 'Benchmark failed')
    } finally {
      setIsRunning(false)
    }
  }

  const exportToCSV = () => {
    if (!currentResult) return

    const headers = ['Request #', 'Response Time (ms)', 'Status']
    const rows = currentResult.results.map((time, index) => [
      index + 1,
      time > 0 ? time.toFixed(2) : 'Failed',
      time > 0 ? 'Success' : 'Failed'
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `benchmark-${currentResult.benchmarkType}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Performance Suite
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              API & Network Testing
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Benchmark Test</CardTitle>
            <CardDescription>
              Test your API endpoint performance with sequential requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium mb-2">Test Type</label>
                  <select
                    className="w-full h-10 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Requests</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={runs}
                    onChange={(e) => setRuns(parseInt(e.target.value) || 10)}
                    disabled={isRunning}
                  />
                </div>
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

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentResult && (
                    <button
                      onClick={exportToCSV}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export CSV</span>
                    </button>
                  )}
                </div>
                <AnimatedButton
                  onClick={runBenchmark}
                  disabled={isRunning || !url.trim()}
                  loading={isRunning}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isRunning ? 'Running...' : 'Run Benchmark'}
                </AnimatedButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {currentResult?.stats && currentResult.benchmarkType !== 'speed-test' && (
          <>
            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Average", value: formatDuration(currentResult.stats.avg) },
                { label: "Min", value: formatDuration(currentResult.stats.min) },
                { label: "Max", value: formatDuration(currentResult.stats.max) }
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Network Tests */}
        <NetworkTests onResult={(result) => setCurrentResult(result)} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex-shrink-0">
        <div className="w-full px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Performance Benchmark Suite v2.0
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <a href="https://github.com/Hari4120/perf-suite" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white">
                GitHub
              </a>
              <a href="https://github.com/Hari4120/perf-suite/issues" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white">
                Report Issue
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
