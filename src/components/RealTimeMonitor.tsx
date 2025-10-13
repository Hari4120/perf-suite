"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Monitor, 
  Wifi, 
  WifiOff, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Pause,
  Play,
  RotateCcw
} from "lucide-react"
import { AnimatedButton } from "@/components/ui/AnimatedButton"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardDescription, AnimatedCardContent } from "@/components/ui/AnimatedCard"
import { cn } from "@/lib/utils"

interface NetworkMetrics {
  timestamp: number
  latency: number
  isOnline: boolean
  speed: number
  quality: 'excellent' | 'good' | 'fair' | 'poor'
}

export default function RealTimeMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [metrics, setMetrics] = useState<NetworkMetrics[]>([])
  const [currentMetrics, setCurrentMetrics] = useState<NetworkMetrics | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'slow'>('online')
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const maxDataPoints = 50

  useEffect(() => {
    // Initial connection status
    setConnectionStatus(navigator.onLine ? 'online' : 'offline')
    
    // Listen for connection changes
    const handleOnline = () => setConnectionStatus('online')
    const handleOffline = () => setConnectionStatus('offline')
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const measureNetworkMetrics = async (): Promise<NetworkMetrics> => {
    const timestamp = Date.now()
    
    try {
      // Test multiple endpoints for reliability
      const testEndpoints = [
        'https://httpbin.org/get',
        'https://www.google.com/favicon.ico',
        'https://www.cloudflare.com/favicon.ico'
      ]
      
      const startTime = performance.now()
      const promises = testEndpoints.map(endpoint => 
        fetch(endpoint, { 
          method: 'HEAD', 
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        }).catch(() => null)
      )
      
      const results = await Promise.allSettled(promises)
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length
      const latency = performance.now() - startTime
      
      // Calculate connection quality
      let quality: 'excellent' | 'good' | 'fair' | 'poor'
      if (successCount === 0) {
        quality = 'poor'
        setConnectionStatus('offline')
      } else if (latency < 50) {
        quality = 'excellent'
        setConnectionStatus('online')
      } else if (latency < 150) {
        quality = 'good'
        setConnectionStatus('online')
      } else if (latency < 300) {
        quality = 'fair'
        setConnectionStatus('slow')
      } else {
        quality = 'poor'
        setConnectionStatus('slow')
      }
      
      // Estimate speed based on latency and success rate
      const speed = successCount > 0 ? Math.max(1, 100 - latency / 5) : 0
      
      return {
        timestamp,
        latency: Math.round(latency),
        isOnline: successCount > 0,
        speed: Math.round(speed),
        quality
      }
      
    } catch (error) {
      console.error('Network measurement error:', error)
      return {
        timestamp,
        latency: 999,
        isOnline: false,
        speed: 0,
        quality: 'poor'
      }
    }
  }

  const startMonitoring = () => {
    setIsMonitoring(true)
    
    const monitor = async () => {
      const newMetrics = await measureNetworkMetrics()
      setCurrentMetrics(newMetrics)
      
      setMetrics(prev => {
        const updated = [...prev, newMetrics]
        return updated.slice(-maxDataPoints) // Keep only last N points
      })
    }
    
    // Initial measurement
    monitor()
    
    // Set up interval for continuous monitoring
    intervalRef.current = setInterval(monitor, 2000) // Every 2 seconds
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const clearData = () => {
    setMetrics([])
    setCurrentMetrics(null)
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-50 dark:bg-green-950'
      case 'good': return 'text-blue-600 bg-blue-50 dark:bg-blue-950'
      case 'fair': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950'
      case 'poor': return 'text-red-600 bg-red-50 dark:bg-red-950'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950'
    }
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'online': return <Wifi className="h-5 w-5 text-green-600" />
      case 'offline': return <WifiOff className="h-5 w-5 text-red-600" />
      case 'slow': return <Wifi className="h-5 w-5 text-yellow-600" />
    }
  }

  const getLatencyTrend = () => {
    if (metrics.length < 2) return null
    const recent = metrics.slice(-5)
    const avg = recent.reduce((sum, m) => sum + m.latency, 0) / recent.length
    const previous = metrics.slice(-10, -5)
    if (previous.length === 0) return null
    const prevAvg = previous.reduce((sum, m) => sum + m.latency, 0) / previous.length
    
    if (avg < prevAvg * 0.9) return <TrendingDown className="h-4 w-4 text-green-600" />
    if (avg > prevAvg * 1.1) return <TrendingUp className="h-4 w-4 text-red-600" />
    return null
  }

  return (
    <AnimatedCard delay={0.05}>
      <AnimatedCardHeader>
        <AnimatedCardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Monitor className="h-6 w-6 text-primary" />
            <span>Real-Time Network Monitor</span>
            {getConnectionIcon()}
          </div>
          <div className="flex items-center space-x-2">
            {isMonitoring && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
            )}
          </div>
        </AnimatedCardTitle>
        <AnimatedCardDescription>
          Continuous monitoring of network performance and connectivity
        </AnimatedCardDescription>
      </AnimatedCardHeader>
      
      <AnimatedCardContent className="space-y-6">
        {/* Control Buttons */}
        <div className="flex items-center space-x-3">
          <AnimatedButton
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            variant={isMonitoring ? "destructive" : "default"}
            className="min-w-[120px]"
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Monitor
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Monitor
              </>
            )}
          </AnimatedButton>
          
          <AnimatedButton
            onClick={clearData}
            variant="outline"
            disabled={metrics.length === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Data
          </AnimatedButton>
        </div>
        
        {/* Current Metrics */}
        <AnimatePresence>
          {currentMetrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Latency</span>
                  {getLatencyTrend()}
                </div>
                <div className="text-2xl font-bold">
                  {currentMetrics.latency} ms
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Connection Quality</div>
                <div className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize",
                  getQualityColor(currentMetrics.quality)
                )}>
                  {currentMetrics.quality}
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Network Score</div>
                <div className="text-2xl font-bold">
                  {currentMetrics.speed}/100
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Live Chart */}
        {metrics.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h4 className="font-medium flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Latency Trend (Last {metrics.length} measurements)</span>
            </h4>
            
            <div className="relative h-32 bg-muted rounded-lg p-4">
              <div className="absolute inset-4 flex items-end justify-between">
                {metrics.map((metric) => (
                  <motion.div
                    key={metric.timestamp}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.min(100, (metric.latency / 500) * 100)}%` }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "w-1 rounded-t",
                      metric.quality === 'excellent' ? 'bg-green-500' :
                      metric.quality === 'good' ? 'bg-blue-500' :
                      metric.quality === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    title={`${metric.latency}ms - ${metric.quality}`}
                  />
                ))}
              </div>
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
                <span>500ms</span>
                <span>250ms</span>
                <span>0ms</span>
              </div>
            </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium">Average</div>
                <div className="text-lg font-bold">
                  {Math.round(metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length)}ms
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">Min</div>
                <div className="text-lg font-bold text-green-600">
                  {Math.min(...metrics.map(m => m.latency))}ms
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">Max</div>
                <div className="text-lg font-bold text-red-600">
                  {Math.max(...metrics.map(m => m.latency))}ms
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">Uptime</div>
                <div className="text-lg font-bold text-blue-600">
                  {Math.round((metrics.filter(m => m.isOnline).length / metrics.length) * 100)}%
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Status Messages */}
        {!isMonitoring && metrics.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click &quot;Start Monitor&quot; to begin real-time network monitoring</p>
          </div>
        )}
      </AnimatedCardContent>
    </AnimatedCard>
  )
}