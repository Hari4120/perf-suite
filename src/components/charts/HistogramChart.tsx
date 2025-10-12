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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

interface HistogramChartProps {
  data: number[]
  bins?: number
  label?: string
}

export default function HistogramChart({ data, bins = 10, label = "Response Time Distribution" }: HistogramChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  const validData = data.filter(d => d > 0)
  
  if (validData.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-gray-500">
        No valid data to display
      </div>
    )
  }
  
  const min = Math.min(...validData)
  const max = Math.max(...validData)
  const binSize = (max - min) / bins
  
  const histogram = Array(bins).fill(0)
  const binLabels = Array(bins).fill(0).map((_, i) => {
    const start = min + i * binSize
    const end = min + (i + 1) * binSize
    return `${start.toFixed(0)}-${end.toFixed(0)}ms`
  })
  
  validData.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1)
    histogram[binIndex]++
  })
  
  const chartColor = isDark ? "rgb(59, 130, 246)" : "rgb(37, 99, 235)"
  const gridColor = isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(229, 231, 235, 0.5)"
  const textColor = isDark ? "rgba(229, 231, 235, 0.8)" : "rgba(55, 65, 81, 0.8)"
  
  const chartData = {
    labels: binLabels,
    datasets: [
      {
        label,
        data: histogram,
        backgroundColor: chartColor.replace('rgb', 'rgba').replace(')', ', 0.7)'),
        borderColor: chartColor,
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
          label: (context) => `Requests: ${context.parsed.y}`
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Response Time Range',
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
          text: 'Frequency',
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