"use client"

import { useEffect, useRef, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js"
import { useTheme } from "next-themes"

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

interface RealTimeChartProps {
  data: number[]
  isActive: boolean
  maxPoints?: number
  label?: string
}

export default function RealTimeChart({ 
  data, 
  isActive, 
  maxPoints = 50, 
  label = "Live Response Time" 
}: RealTimeChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const chartRef = useRef<ChartJS<'line'> | null>(null)
  const [displayData, setDisplayData] = useState<number[]>([])
  
  useEffect(() => {
    // Keep only the last maxPoints data points
    const validData = data.filter(d => d > 0)
    const slicedData = validData.slice(-maxPoints)
    setDisplayData(slicedData)
    
    // Animate the chart update
    if (chartRef.current && isActive) {
      chartRef.current.update('none')
    }
  }, [data, maxPoints, isActive])
  
  const chartColor = isActive 
    ? (isDark ? "rgb(34, 197, 94)" : "rgb(22, 163, 74)")
    : (isDark ? "rgb(107, 114, 128)" : "rgb(156, 163, 175)")
    
  const gridColor = isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(229, 231, 235, 0.5)"
  const textColor = isDark ? "rgba(229, 231, 235, 0.8)" : "rgba(55, 65, 81, 0.8)"
  
  const chartData = {
    labels: displayData.map((_, i) => (i + 1).toString()),
    datasets: [
      {
        label,
        data: displayData,
        borderColor: chartColor,
        backgroundColor: chartColor.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0.4,
        fill: true,
        pointRadius: isActive ? 4 : 2,
        pointHoverRadius: 6,
        borderWidth: 2,
        animation: {
          duration: isActive ? 300 : 0,
        },
      },
    ],
  }
  
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: isActive ? 300 : 0,
    },
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
          label: (context) => `${label}: ${context.parsed.y.toFixed(2)}ms`,
          afterLabel: () => isActive ? 'Live update' : 'Completed'
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: isActive ? 'Live Requests' : 'Request #',
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
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
    <div className="relative h-64 w-full">
      {isActive && (
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-md">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700 dark:text-green-300 font-medium">
              LIVE
            </span>
          </div>
        </div>
      )}
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  )
}