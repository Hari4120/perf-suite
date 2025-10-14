"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { motion, useMotionValue, animate } from "framer-motion"
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardContent } from "@/components/ui/AnimatedCard"
import type { BenchmarkResult } from "@/types/benchmark"

interface Performance3DProps {
  results: BenchmarkResult[]
}

export default function Performance3D({ results }: Performance3DProps) {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const rotateX = useMotionValue(15)
  const rotateY = useMotionValue(-15)

  const validResults = results.filter(r => r.stats).slice(0, 20)

  const dataPoints = useMemo(() => {
    if (validResults.length === 0) return []

    return validResults.map((result, index) => ({
      id: result.id,
      x: (index / Math.max(validResults.length - 1, 1)) * 100,
      y: 50,
      z: Math.min((result.stats!.avg / 500) * 100, 100),
      value: result.stats!.avg,
      color: result.stats!.avg < 100 ? '#10b981' :
             result.stats!.avg < 300 ? '#f59e0b' : '#ef4444',
      timestamp: result.timestamp,
      type: result.benchmarkType,
      failed: result.stats!.failed,
      p95: result.stats!.p95
    }))
  }, [validResults])

  const connections = useMemo(() => {
    const lines = []
    for (let i = 0; i < dataPoints.length - 1; i++) {
      lines.push({
        from: dataPoints[i],
        to: dataPoints[i + 1],
        thickness: Math.abs(dataPoints[i + 1].z - dataPoints[i].z) / 10 + 1
      })
    }
    return lines
  }, [dataPoints])

  useEffect(() => {
    if (!isHovering && containerRef.current) {
      const interval = setInterval(() => {
        animate(rotateY, rotateY.get() + 0.5, { duration: 0.1 })
      }, 50)

      return () => clearInterval(interval)
    }
  }, [isHovering, rotateY])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    rotateY.set((x - 0.5) * 60)
    rotateX.set((y - 0.5) * -60 + 15)
  }

  if (dataPoints.length === 0) {
    return null
  }

  return (
    <AnimatedCard delay={0.4} className="overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <AnimatedCardHeader>
        <AnimatedCardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            <span>3D Performance Landscape</span>
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs text-muted-foreground"
          >
            Drag to rotate • Click points for details
          </motion.div>
        </AnimatedCardTitle>
      </AnimatedCardHeader>

      <AnimatedCardContent>
        <div
          ref={containerRef}
          className="relative w-full h-[500px] cursor-grab active:cursor-grabbing select-none"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{ perspective: '1200px' }}
        >
          {/* 3D Scene Container */}
          <motion.div
            className="w-full h-full relative"
            style={{
              transformStyle: 'preserve-3d',
              rotateX,
              rotateY
            }}
          >
            {/* Grid Floor */}
            <div
              className="absolute inset-0"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'translateZ(-100px) rotateX(90deg)'
              }}
            >
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={`grid-x-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  transition={{ delay: i * 0.05 }}
                  className="absolute h-full border-l border-primary/20"
                  style={{ left: `${i * 10}%` }}
                />
              ))}
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={`grid-y-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  transition={{ delay: i * 0.05 }}
                  className="absolute w-full border-t border-primary/20"
                  style={{ top: `${i * 10}%` }}
                />
              ))}
            </div>

            {/* Connection Lines */}
            {connections.map((conn, index) => {
              const dx = conn.to.x - conn.from.x
              const dz = conn.to.z - conn.from.z
              const length = Math.sqrt(dx * dx + dz * dz)
              const angle = Math.atan2(dz, dx) * (180 / Math.PI)

              return (
                <motion.div
                  key={`conn-${index}`}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 0.4 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  className="absolute origin-left"
                  style={{
                    left: `${conn.from.x}%`,
                    top: '50%',
                    width: `${length}%`,
                    height: `${conn.thickness}px`,
                    background: `linear-gradient(90deg, ${conn.from.color}, ${conn.to.color})`,
                    transformStyle: 'preserve-3d',
                    transform: `translateZ(-${conn.from.z}px) rotateZ(${angle}deg)`,
                    boxShadow: `0 0 10px ${conn.from.color}40`
                  }}
                />
              )
            })}

            {/* Data Points */}
            {dataPoints.map((point, index) => (
              <motion.div
                key={point.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{
                  scale: selectedPoint === index ? 1.8 : 1.5,
                  z: 20
                }}
                className="absolute cursor-pointer"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  transformStyle: 'preserve-3d',
                  transform: `translateZ(-${point.z}px)`,
                }}
                onClick={() => setSelectedPoint(selectedPoint === index ? null : index)}
              >
                {/* Vertical Line to Floor */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-primary/30 to-primary/10"
                  style={{
                    height: `${point.z}px`,
                    top: 0,
                    transformStyle: 'preserve-3d',
                    transform: 'translateZ(50px)'
                  }}
                />

                {/* Data Point Sphere */}
                <motion.div
                  className="relative rounded-full shadow-2xl"
                  style={{
                    width: '20px',
                    height: '20px',
                    background: `radial-gradient(circle at 30% 30%, ${point.color}ff, ${point.color}aa)`,
                    boxShadow: `0 0 20px ${point.color}80, 0 0 40px ${point.color}40`,
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 20px ${point.color}80, 0 0 40px ${point.color}40`,
                      `0 0 30px ${point.color}ff, 0 0 60px ${point.color}60`,
                      `0 0 20px ${point.color}80, 0 0 40px ${point.color}40`,
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {/* Pulse Ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: point.color }}
                    animate={{
                      scale: [1, 2, 2],
                      opacity: [0.8, 0, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  />
                </motion.div>

                {/* Tooltip */}
                {selectedPoint === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-4 bg-background/95 backdrop-blur-md border rounded-lg p-3 shadow-2xl min-w-[200px] z-50"
                    style={{ transform: 'translateZ(100px)' }}
                  >
                    <div className="text-xs space-y-1.5">
                      <div className="font-bold text-sm border-b pb-1.5 mb-1.5">
                        Performance Snapshot
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response Time:</span>
                        <span className="font-mono font-semibold" style={{ color: point.color }}>
                          {point.value.toFixed(2)}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">95th Percentile:</span>
                        <span className="font-mono">{point.p95.toFixed(2)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Test Type:</span>
                        <span className="capitalize">{point.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Failed:</span>
                        <span className={point.failed > 0 ? 'text-red-500' : 'text-green-500'}>
                          {point.failed}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-[10px] pt-1 border-t">
                        {new Date(point.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}

            {/* Floating Particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 rounded-full bg-primary/20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transformStyle: 'preserve-3d',
                }}
                animate={{
                  translateZ: [
                    -Math.random() * 200,
                    -Math.random() * 200 - 100,
                    -Math.random() * 200
                  ],
                  opacity: [0.2, 0.6, 0.2]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </motion.div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 text-xs space-y-2 border">
            <div className="font-semibold mb-2">Performance Scale</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">&lt; 100ms (Excellent)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">100-300ms (Good)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">&gt; 300ms (Slow)</span>
            </div>
          </div>

          {/* Stats Overlay */}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 text-xs space-y-1.5 border">
            <div className="font-semibold mb-1">3D Analytics</div>
            <div className="flex items-center justify-between space-x-3">
              <span className="text-muted-foreground">Data Points:</span>
              <span className="font-mono font-semibold">{dataPoints.length}</span>
            </div>
            <div className="flex items-center justify-between space-x-3">
              <span className="text-muted-foreground">Avg Latency:</span>
              <span className="font-mono">
                {(dataPoints.reduce((sum, p) => sum + p.value, 0) / dataPoints.length).toFixed(1)}ms
              </span>
            </div>
            <div className="flex items-center justify-between space-x-3">
              <span className="text-muted-foreground">Trend:</span>
              {dataPoints.length > 1 && dataPoints[dataPoints.length - 1].value < dataPoints[0].value ? (
                <TrendingDown className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  )
}