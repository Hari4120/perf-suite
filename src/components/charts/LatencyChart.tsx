"use client"

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

interface LatencyChartProps {
  data: number[]
  label?: string
  color?: string
}

export default function LatencyChart({ data, label = "Latency (ms)", color }: LatencyChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  const validData = data.filter(d => d > 0)
  
  const chartColor = color || (isDark ? "rgb(34, 197, 94)" : "rgb(22, 163, 74)")
  const gridColor = isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(229, 231, 235, 0.5)"
  const textColor = isDark ? "rgba(229, 231, 235, 0.8)" : "rgba(55, 65, 81, 0.8)"
  
  const chartData = {
    labels: validData.map((_, i) => `${i + 1}`),
    datasets: [
      {
        label,
        data: validData,
        borderColor: chartColor,
        backgroundColor: chartColor.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  }
  
  const options: ChartOptions<'line'> = {
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
          label: (context) => `${label}: ${context.parsed.y?.toFixed(2) || 0}ms`
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Request #',
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
    <div className="h-64 w-full">
      <Line data={chartData} options={options} />
    </div>
  )
}