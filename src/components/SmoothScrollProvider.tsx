"use client"

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    // Ultra-fast Lenis configuration for instant scroll response
    lenisRef.current = new Lenis({
      duration: 0.1, // Extremely fast for near-instant response
      easing: (t) => t, // Linear easing for natural feel
      smoothWheel: true,
      wheelMultiplier: 1.5, // Higher for faster wheel response
      touchMultiplier: 2.5, // Higher for faster touch response
      infinite: false,
      syncTouch: false, // Disable for faster response
    })

    // Maximum performance animation loop
    function raf(time: number) {
      lenisRef.current?.raf(time)
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