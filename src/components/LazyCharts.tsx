"use client"

import { lazy, Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import type { BenchmarkResult } from "@/types/benchmark"

// Lazy load chart components to improve initial bundle size
const LatencyChart = lazy(() => import("@/components/charts/LatencyChart"))
const HistogramChart = lazy(() => import("@/components/charts/HistogramChart"))
const ComparisonChart = lazy(() => import("@/components/charts/ComparisonChart"))
const RealTimeChart = lazy(() => import("@/components/charts/RealTimeChart"))

// Chart wrapper with loading fallback
function ChartWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="h-64 w-full flex items-center justify-center">
        <LoadingSpinner size="md" text="Loading chart..." />
      </div>
    }>
      {children}
    </Suspense>
  )
}

// Optimized chart components
export function LazyLatencyChart(props: { data: number[] }) {
  return (
    <ChartWrapper>
      <LatencyChart {...props} />
    </ChartWrapper>
  )
}

export function LazyHistogramChart(props: { data: number[] }) {
  return (
    <ChartWrapper>
      <HistogramChart {...props} />
    </ChartWrapper>
  )
}

export function LazyComparisonChart(props: { results: BenchmarkResult[], metric?: 'avg' | 'min' | 'max' | 'median' | 'p95' | 'p99' }) {
  return (
    <ChartWrapper>
      <ComparisonChart {...props} />
    </ChartWrapper>
  )
}

export function LazyRealTimeChart(props: { data: number[], isActive: boolean, label: string }) {
  return (
    <ChartWrapper>
      <RealTimeChart {...props} />
    </ChartWrapper>
  )
}