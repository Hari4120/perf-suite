"use client"

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    // Initialize Lenis with optimized settings
    lenisRef.current = new Lenis({
      duration: 0.8, // Reduced for snappier feel
      easing: (t) => t * (2 - t), // Simpler easing function
      smoothWheel: true,
      wheelMultiplier: 0.8, // Reduced for better control
      touchMultiplier: 1.5,
      infinite: false,
      syncTouch: true,
      syncTouchLerp: 0.1,
    })

    // Optimized animation loop with throttling
    let lastTime = 0
    function raf(time: number) {
      if (time - lastTime > 16) { // ~60fps throttling
        lenisRef.current?.raf(time)
        lastTime = time
      }
      rafRef.current = requestAnimationFrame(raf)
    }

    rafRef.current = requestAnimationFrame(raf)

    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      lenisRef.current?.destroy()
    }
  }, [])

  return <>{children}</>
}