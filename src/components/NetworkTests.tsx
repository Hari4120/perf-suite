"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Wifi, 
  Zap, 
  Timer, 
  Globe, 
  Activity, 
  Download, 
  Upload, 
  Gauge,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server
} from "lucide-react"
import { AnimatedButton } from "@/components/ui/AnimatedButton"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardDescription, AnimatedCardContent } from "@/components/ui/AnimatedCard"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import type { BenchmarkResult, NetworkTestData } from "@/types/benchmark"
import { runSpeedTest, runBufferBloatTest, runDNSTest, runNetworkQualityTest, TestProgress } from "@/lib/networkTests"
import { cn } from "@/lib/utils"

interface NetworkTestsProps {
  onResult: (result: BenchmarkResult) => void
}

export default function NetworkTests({ onResult }: NetworkTestsProps) {
  const [activeTest, setActiveTest] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, BenchmarkResult>>({})
  const [testProgress, setTestProgress] = useState<TestProgress | null>(null)

  const runNetworkTest = async (testType: string) => {
    setActiveTest(testType)
    setTestProgress(null)
    
    try {
      let networkData: NetworkTestData = {}
      let testResults: number[] = []
      let testName = ''
      
      switch (testType) {
        case 'speed-test':
          const speedResult = await runSpeedTest((progress) => {
            setTestProgress(progress)
          })
          networkData = {
            downloadSpeed: speedResult.downloadSpeed,
            uploadSpeed: speedResult.uploadSpeed,
            latency: speedResult.latency,
            jitter: speedResult.jitter,
            dnsResolution: speedResult.dnsResolution,
            qualityScore: speedResult.qualityScore,
            connectionType: speedResult.connectionType
          }
          testResults = [speedResult.downloadSpeed, speedResult.uploadSpeed]
          testName = `Speed Test - ${speedResult.testEndpoint}`
          break
          
        case 'buffer-bloat':
          const bufferResult = await runBufferBloatTest()
          networkData = {
            bufferBloat: bufferResult.bufferBloat,
            latency: bufferResult.baseLatency,
            qualityScore: bufferResult.bufferBloat <= 10 ? 100 : Math.max(20, 100 - bufferResult.bufferBloat * 2)
          }
          testResults = [bufferResult.bufferBloat]
          testName = 'Buffer Bloat Test'
          break
          
        case 'dns-test':
          const dnsResult = await runDNSTest()
          networkData = {
            dnsResolution: dnsResult.dnsResolution,
            qualityScore: dnsResult.dnsResolution <= 50 ? 100 : Math.max(40, 100 - dnsResult.dnsResolution)
          }
          testResults = [dnsResult.dnsResolution]
          testName = 'DNS Resolution Test'
          break
          
        case 'network-quality':
          const qualityResult = await runNetworkQualityTest()
          networkData = {
            downloadSpeed: qualityResult.downloadSpeed,
            uploadSpeed: qualityResult.uploadSpeed,
            latency: qualityResult.latency,
            jitter: qualityResult.jitter,
            bufferBloat: qualityResult.bufferBloat,
            dnsResolution: qualityResult.dnsResolution,
            qualityScore: qualityResult.qualityScore,
            connectionType: qualityResult.connectionType
          }
          testResults = [qualityResult.qualityScore]
          testName = 'Network Quality Assessment'
          break
          
        default:
          throw new Error('Invalid test type')
      }
      
      // Create BenchmarkResult object
      const result: BenchmarkResult = {
        id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: testName,
        timestamp: Date.now(),
        benchmarkType: testType as BenchmarkResult['benchmarkType'],
        results: testResults,
        stats: {
          min: Math.min(...testResults),
          max: Math.max(...testResults),
          avg: testResults.reduce((a, b) => a + b, 0) / testResults.length,
          median: testResults.sort()[Math.floor(testResults.length / 2)],
          p95: testResults.sort()[Math.floor(testResults.length * 0.95)],
          p99: testResults.sort()[Math.floor(testResults.length * 0.99)],
          count: testResults.length,
          failed: 0
        },
        metadata: {
          userAgent: navigator.userAgent,
          runs: 1,
          timeout: 10000
        },
        networkData
      }
      
      setResults(prev => ({ ...prev, [testType]: result }))
      onResult(result)
      
    } catch (error) {
      console.error('Network test error:', error)
      alert(error instanceof Error ? error.message : 'Test failed')
    } finally {
      setActiveTest(null)
      setTestProgress(null)
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    if (score >= 50) return "text-orange-600"
    return "text-red-600"
  }

  const getQualityIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5" />
    if (score >= 50) return <AlertTriangle className="h-5 w-5" />
    return <AlertTriangle className="h-5 w-5" />
  }

  const networkTests = [
    {
      id: 'speed-test',
      title: 'Internet Speed Test',
      description: 'Measure download and upload speeds',
      icon: <Zap className="h-6 w-6" />,
      color: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
      metrics: ['Download', 'Upload', 'Latency']
    },
    {
      id: 'buffer-bloat',
      title: 'Buffer Bloat Test',
      description: 'Detect network buffering issues',
      icon: <Timer className="h-6 w-6" />,
      color: 'border-orange-500 bg-orange-50 dark:bg-orange-950',
      metrics: ['Buffer Bloat', 'Base Latency']
    },
    {
      id: 'dns-test',
      title: 'DNS Resolution Test',
      description: 'Test domain name resolution speed',
      icon: <Globe className="h-6 w-6" />,
      color: 'border-green-500 bg-green-50 dark:bg-green-950',
      metrics: ['DNS Speed']
    },
    {
      id: 'network-quality',
      title: 'Network Quality Assessment',
      description: 'Comprehensive network analysis',
      icon: <Activity className="h-6 w-6" />,
      color: 'border-purple-500 bg-purple-50 dark:bg-purple-950',
      metrics: ['Overall Score', 'Jitter', 'Stability']
    }
  ]

  return (
    <AnimatedCard delay={0.05}>
      <AnimatedCardHeader>
        <AnimatedCardTitle className="flex items-center space-x-2">
          <Wifi className="h-6 w-6 text-primary" />
          <span>Network & Internet Tests</span>
        </AnimatedCardTitle>
        <AnimatedCardDescription>
          Comprehensive network performance and quality testing
        </AnimatedCardDescription>
      </AnimatedCardHeader>
      
      <AnimatedCardContent className="space-y-6">
        {/* Live Progress Display */}
        <AnimatePresence>
          {testProgress && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: testProgress.phase !== 'complete' ? [0, 360] : 0 }}
                    transition={{ duration: 2, repeat: testProgress.phase !== 'complete' ? Infinity : 0 }}
                  >
                    <Activity className="h-6 w-6 text-blue-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {testProgress.phase === 'complete' ? 'Test Complete!' : 'Testing in Progress'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{testProgress.currentTest}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {testProgress.liveScore}/100
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Live Score
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(testProgress.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${testProgress.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              
              {/* Time and Phase Info */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium">Elapsed</div>
                  <div className="text-muted-foreground">
                    {Math.round(testProgress.elapsed)}s
                  </div>
                </div>
                <div>
                  <div className="font-medium">Estimated</div>
                  <div className="text-muted-foreground">
                    {Math.round(testProgress.estimated)}s
                  </div>
                </div>
                <div>
                  <div className="font-medium">Phase</div>
                  <div className="text-muted-foreground capitalize">
                    {testProgress.phase.replace('-', ' ')}
                  </div>
                </div>
              </div>
              
              {/* Recent Measurements */}
              {testProgress.measurements.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Recent Measurements</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {testProgress.measurements.slice(-4).map((measurement, index) => (
                      <motion.div
                        key={measurement.timestamp}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-2 bg-white dark:bg-gray-800 rounded border text-xs"
                      >
                        <div className="font-medium">{measurement.phase}</div>
                        <div className="text-muted-foreground">
                          {measurement.type === 'speed' ? `${measurement.value.toFixed(1)} Mbps` :
                           measurement.type === 'latency' ? `${Math.round(measurement.value)}ms` :
                           measurement.type === 'dns' ? `${Math.round(measurement.value)}ms` :
                           `${Math.round(measurement.value)}`}
                        </div>
                        <div className={cn(
                          "font-bold",
                          measurement.score >= 80 ? "text-green-600" :
                          measurement.score >= 60 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {Math.round(measurement.score)}/100
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Test Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {networkTests.map((test) => (
            <motion.div
              key={test.id}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.1 }}
              className={cn(
                "relative p-6 border rounded-lg cursor-pointer transition-all duration-150",
                test.color,
                "hover:shadow-md"
              )}
              onClick={() => runNetworkTest(test.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-primary">
                    {test.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{test.title}</h3>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                  </div>
                </div>
                
                {activeTest === test.id && (
                  <LoadingSpinner size="sm" />
                )}
              </div>
              
              {/* Test Metrics Preview */}
              <div className="flex flex-wrap gap-2 mb-4">
                {test.metrics.map((metric) => (
                  <span
                    key={metric}
                    className="px-2 py-1 bg-background/50 rounded text-xs font-medium"
                  >
                    {metric}
                  </span>
                ))}
              </div>
              
              {/* Results Preview */}
              {results[test.id] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm space-y-1"
                >
                  {test.id === 'speed-test' && results[test.id].networkData && (
                    <>
                      <div className="flex justify-between">
                        <span>Download:</span>
                        <span className="font-mono">{results[test.id].networkData?.downloadSpeed?.toFixed(1)} Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Upload:</span>
                        <span className="font-mono">{results[test.id].networkData?.uploadSpeed?.toFixed(1)} Mbps</span>
                      </div>
                    </>
                  )}
                  
                  {test.id === 'buffer-bloat' && results[test.id].networkData && (
                    <div className="flex justify-between">
                      <span>Buffer Bloat:</span>
                      <span className="font-mono">{results[test.id].networkData?.bufferBloat} ms</span>
                    </div>
                  )}
                  
                  {test.id === 'dns-test' && results[test.id].networkData && (
                    <div className="flex justify-between">
                      <span>DNS Resolution:</span>
                      <span className="font-mono">{results[test.id].networkData?.dnsResolution} ms</span>
                    </div>
                  )}
                  
                  {test.id === 'network-quality' && results[test.id].networkData && (
                    <div className="flex justify-between items-center">
                      <span>Quality Score:</span>
                      <div className="flex items-center space-x-1">
                        <span className={cn("font-mono font-bold", getQualityColor(results[test.id].networkData?.qualityScore || 0))}>
                          {results[test.id].networkData?.qualityScore}/100
                        </span>
                        <div className={getQualityColor(results[test.id].networkData?.qualityScore || 0)}>
                          {getQualityIcon(results[test.id].networkData?.qualityScore || 0)}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              
              <AnimatedButton
                variant="outline"
                size="sm"
                className="w-full mt-4"
                disabled={activeTest === test.id}
                loading={activeTest === test.id}
              >
                {activeTest === test.id ? 'Running...' : results[test.id] ? 'Retest' : 'Run Test'}
              </AnimatedButton>
            </motion.div>
          ))}
        </div>
        
        {/* Detailed Results */}
        <AnimatePresence>
          {Object.keys(results).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Gauge className="h-5 w-5" />
                <span>Detailed Network Analysis</span>
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Speed Metrics */}
                {results['speed-test'] && (
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Speed Test Results</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Download className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Download</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {results['speed-test'].networkData?.downloadSpeed?.toFixed(1) || '0'} Mbps
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Upload className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Upload</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {results['speed-test'].networkData?.uploadSpeed?.toFixed(1) || '0'} Mbps
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Quality Metrics */}
                {results['network-quality'] && (
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>Quality Metrics</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Latency</span>
                        </span>
                        <span className="font-mono">{results['network-quality'].networkData?.latency} ms</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="flex items-center space-x-2">
                          <Timer className="h-4 w-4" />
                          <span>Jitter</span>
                        </span>
                        <span className="font-mono">{results['network-quality'].networkData?.jitter} ms</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="flex items-center space-x-2">
                          <Server className="h-4 w-4" />
                          <span>DNS Resolution</span>
                        </span>
                        <span className="font-mono">{results['network-quality'].networkData?.dnsResolution} ms</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Run All Tests */}
        <div className="flex justify-center pt-4 border-t">
          <AnimatedButton
            onClick={async () => {
              for (const test of networkTests) {
                await runNetworkTest(test.id)
                // Small delay between tests
                await new Promise(resolve => setTimeout(resolve, 1000))
              }
            }}
            disabled={activeTest !== null}
            loading={activeTest !== null}
            className="min-w-[200px]"
          >
            {activeTest ? 'Running Tests...' : 'Run All Network Tests'}
          </AnimatedButton>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  )
}