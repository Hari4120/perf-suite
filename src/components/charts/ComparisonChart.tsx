"use client"

import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js"
import { useTheme } from "next-themes"
import type { BenchmarkResult } from "@/types/benchmark"

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

interface ComparisonChartProps {
  results: BenchmarkResult[]
  metric?: 'avg' | 'min' | 'max' | 'median' | 'p95' | 'p99'
}

export default function ComparisonChart({ results, metric = 'avg' }: ComparisonChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  const validResults = results.filter(r => r.stats)
  
  if (validResults.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-gray-500">
        No results to compare
      </div>
    )
  }
  
  const colors = [
    isDark ? "rgb(239, 68, 68)" : "rgb(220, 38, 38)",
    isDark ? "rgb(59, 130, 246)" : "rgb(37, 99, 235)",
    isDark ? "rgb(34, 197, 94)" : "rgb(22, 163, 74)",
    isDark ? "rgb(245, 158, 11)" : "rgb(217, 119, 6)",
    isDark ? "rgb(168, 85, 247)" : "rgb(147, 51, 234)",
    isDark ? "rgb(236, 72, 153)" : "rgb(219, 39, 119)",
  ]
  
  const gridColor = isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(229, 231, 235, 0.5)"
  const textColor = isDark ? "rgba(229, 231, 235, 0.8)" : "rgba(55, 65, 81, 0.8)"
  
  const labels = validResults.map((result) => {
    const url = new URL(result.url)
    const domain = url.hostname
    return `${domain} (${result.benchmarkType})`
  })
  
  const data = validResults.map(result => result.stats![metric])
  
  const chartData = {
    labels,
    datasets: [
      {
        label: `${metric.toUpperCase()} Response Time (ms)`,
        data,
        backgroundColor: data.map((_, i) => 
          colors[i % colors.length].replace('rgb', 'rgba').replace(')', ', 0.7)')
        ),
        borderColor: data.map((_, i) => colors[i % colors.length]),
        borderWidth: 1,
      },
    ],
  }
  
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: textColor,
          font: {
            size: 12,
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: gridColor,
        borderWidth: 1,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}ms`,
          afterLabel: (context) => {
            const result = validResults[context.dataIndex]
            return [
              `Timestamp: ${new Date(result.timestamp).toLocaleString()}`,
              `Runs: ${result.metadata.runs}`,
              `Failed: ${result.stats?.failed || 0}`
            ]
          }
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Endpoints',
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          maxRotation: 45,
        }
      },
      y: {
        title: {
          display: true,
          text: 'Response Time (ms)',
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        }
      },
    },
  }
  
  return (
    <div className="h-64 w-full">
      <Bar data={chartData} options={options} />
    </div>
  )
}