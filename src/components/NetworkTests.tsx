"use client"

import { useState } from "react"
import { Wifi, Download, Upload, Activity, Zap } from "lucide-react"
import { AnimatedButton } from "@/components/ui/AnimatedButton"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import type { BenchmarkResult } from "@/types/benchmark"
import { runSpeedTest, type TestProgress } from "@/lib/networkTests"

interface NetworkTestsProps {
  onResult: (result: BenchmarkResult) => void
}

export default function NetworkTests({ onResult }: NetworkTestsProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<BenchmarkResult | null>(null)
  const [progress, setProgress] = useState<TestProgress | null>(null)

  const runTest = async () => {
    setIsRunning(true)
    setProgress(null)
    setResults(null)

    try {
      const networkData = await runSpeedTest((prog) => {
        setProgress(prog)
      })

      const result: BenchmarkResult = {
        id: `speed-test-${Date.now()}`,
        url: 'Internet Speed Test',
        timestamp: Date.now(),
        benchmarkType: 'speed-test',
        results: [networkData.downloadSpeed, networkData.uploadSpeed],
        stats: {
          min: Math.min(networkData.downloadSpeed, networkData.uploadSpeed),
          max: Math.max(networkData.downloadSpeed, networkData.uploadSpeed),
          avg: (networkData.downloadSpeed + networkData.uploadSpeed) / 2,
          median: (networkData.downloadSpeed + networkData.uploadSpeed) / 2,
          p95: networkData.downloadSpeed,
          p99: networkData.downloadSpeed,
          count: 2,
          failed: 0
        },
        metadata: {
          userAgent: navigator.userAgent,
          runs: 1,
          timeout: 30000
        },
        networkData
      }

      setResults(result)
      onResult(result)
    } catch (error) {
      console.error('Network test error:', error)
      alert(error instanceof Error ? error.message : 'Network test failed')
    } finally {
      setIsRunning(false)
      setProgress(null)
    }
  }

  const getPhaseIcon = (phase: TestProgress['phase']) => {
    switch (phase) {
      case 'latency': return <Activity className="h-5 w-5 animate-pulse" />
      case 'speed': return <Download className="h-5 w-5 animate-pulse" />
      case 'dns': return <Zap className="h-5 w-5 animate-pulse" />
      default: return <Wifi className="h-5 w-5 animate-pulse" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wifi className="h-5 w-5" />
          <span>Internet Speed Test</span>
        </CardTitle>
        <CardDescription>
          Test your internet connection speed and quality
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Live Progress Display */}
          {isRunning && progress && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getPhaseIcon(progress.phase)}
                  <span className="text-sm font-medium">{progress.currentTest}</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {progress.elapsed.toFixed(0)}s
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>

              {/* Live Speed Display */}
              {progress.phase === 'speed' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                    <Download className="h-6 w-6 mx-auto mb-2 text-blue-600 animate-bounce" />
                    <div className="text-2xl font-bold text-blue-600">
                      {progress.measurements
                        .filter(m => m.phase === 'Speed Test')
                        .slice(-1)[0]?.value.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Mbps</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-green-600 animate-bounce" />
                    <div className="text-2xl font-bold text-green-600">
                      {progress.measurements
                        .filter(m => m.phase === 'Upload Test')
                        .slice(-1)[0]?.value.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Mbps</div>
                  </div>
                </div>
              )}

              {/* Quality Score */}
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">
                  {progress.liveScore.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Quality Score</div>
              </div>
            </div>
          )}

          {/* Final Results */}
          {results?.networkData && !isRunning && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Download className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Download</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {results.networkData.downloadSpeed?.toFixed(1) || '0.0'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Mbps</div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Upload className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Upload</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {results.networkData.uploadSpeed?.toFixed(1) || '0.0'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Mbps</div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Latency</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {results.networkData.latency || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">ms</div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Wifi className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Quality</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {results.networkData.qualityScore || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">/ 100</div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <AnimatedButton
              onClick={runTest}
              disabled={isRunning}
              loading={isRunning}
              className="min-w-[200px]"
            >
              {isRunning ? (
                <><LoadingSpinner size="sm" /> Running Test...</>
              ) : (
                'Run Speed Test'
              )}
            </AnimatedButton>
          </div>

          {results?.networkData && (
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Connection Type: <strong>{results.networkData.connectionType}</strong>
              {results.networkData.testDuration && (
                <> • Test Duration: <strong>{results.networkData.testDuration}s</strong></>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
