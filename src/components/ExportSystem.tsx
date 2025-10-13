"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson,
  FileImage,
  X,
  Check,
  Settings
} from "lucide-react"
import { AnimatedButton } from "@/components/ui/AnimatedButton"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardContent } from "@/components/ui/AnimatedCard"
import type { BenchmarkResult } from "@/types/benchmark"

interface ExportSystemProps {
  results: BenchmarkResult[]
  disabled?: boolean
}

interface ExportFormat {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  extension: string
  mimeType: string
}

const exportFormats: ExportFormat[] = [
  {
    id: 'json',
    name: 'JSON',
    description: 'Machine-readable format for programmatic use',
    icon: <FileJson className="h-5 w-5" />,
    extension: 'json',
    mimeType: 'application/json'
  },
  {
    id: 'csv',
    name: 'CSV',
    description: 'Spreadsheet format for analysis in Excel/Sheets',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    extension: 'csv',
    mimeType: 'text/csv'
  },
  {
    id: 'markdown',
    name: 'Markdown Report',
    description: 'Formatted report with charts and analysis',
    icon: <FileText className="h-5 w-5" />,
    extension: 'md',
    mimeType: 'text/markdown'
  },
  {
    id: 'html',
    name: 'HTML Report',
    description: 'Interactive web report with visualizations',
    icon: <FileImage className="h-5 w-5" />,
    extension: 'html',
    mimeType: 'text/html'
  }
]

export default function ExportSystem({ results, disabled = false }: ExportSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['json'])
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(true)

  const generateJSON = (): string => {
    const exportData = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        totalResults: results.length,
        version: '1.0.0',
        generator: 'Performance Benchmark Suite'
      },
      ...(includeMetadata && {
        metadata: {
          testTypes: [...new Set(results.map(r => r.benchmarkType))],
          dateRange: {
            start: new Date(Math.min(...results.map(r => r.timestamp))).toISOString(),
            end: new Date(Math.max(...results.map(r => r.timestamp))).toISOString()
          },
          totalRequests: results.reduce((sum, r) => sum + r.results.length, 0)
        }
      }),
      results: results.map(result => ({
        id: result.id,
        url: result.url,
        benchmarkType: result.benchmarkType,
        timestamp: new Date(result.timestamp).toISOString(),
        duration: result.duration,
        stats: result.stats,
        metadata: result.metadata,
        ...(includeCharts && { results: result.results })
      }))
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  const generateCSV = (): string => {
    const headers = [
      'Timestamp',
      'URL',
      'Test Type',
      'Duration (s)',
      'Average (ms)',
      'Min (ms)',
      'Max (ms)',
      'Median (ms)',
      'P95 (ms)',
      'P99 (ms)',
      'Failed Requests',
      'Total Requests',
      'Success Rate (%)'
    ]

    const rows = results.map(result => [
      new Date(result.timestamp).toISOString(),
      result.url,
      result.benchmarkType,
      result.duration.toFixed(2),
      result.stats?.avg.toFixed(2) || 'N/A',
      result.stats?.min.toFixed(2) || 'N/A',
      result.stats?.max.toFixed(2) || 'N/A',
      result.stats?.median.toFixed(2) || 'N/A',
      result.stats?.p95.toFixed(2) || 'N/A',
      result.stats?.p99.toFixed(2) || 'N/A',
      result.stats?.failed || 0,
      result.results.length,
      result.stats ? (((result.results.length - result.stats.failed) / result.results.length) * 100).toFixed(1) : 'N/A'
    ])

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  const generateMarkdown = (): string => {
    const now = new Date().toISOString()
    const totalRequests = results.reduce((sum, r) => sum + r.results.length, 0)
    const avgResponseTime = results.reduce((sum, r) => sum + (r.stats?.avg || 0), 0) / results.length

    return `# Performance Benchmark Report

Generated on: ${now}

## Summary

- **Total Tests**: ${results.length}
- **Total Requests**: ${totalRequests}
- **Average Response Time**: ${avgResponseTime.toFixed(2)}ms
- **Test Types**: ${[...new Set(results.map(r => r.benchmarkType))].join(', ')}

## Detailed Results

${results.map(result => `### ${result.url} (${result.benchmarkType})

- **Timestamp**: ${new Date(result.timestamp).toLocaleString()}
- **Duration**: ${result.duration.toFixed(2)}s
- **Total Requests**: ${result.results.length}

#### Performance Metrics

| Metric | Value |
|--------|-------|
| Average | ${result.stats?.avg.toFixed(2) || 'N/A'}ms |
| Minimum | ${result.stats?.min.toFixed(2) || 'N/A'}ms |
| Maximum | ${result.stats?.max.toFixed(2) || 'N/A'}ms |
| Median | ${result.stats?.median.toFixed(2) || 'N/A'}ms |
| 95th Percentile | ${result.stats?.p95.toFixed(2) || 'N/A'}ms |
| 99th Percentile | ${result.stats?.p99.toFixed(2) || 'N/A'}ms |
| Failed Requests | ${result.stats?.failed || 0} |
| Success Rate | ${result.stats ? (((result.results.length - result.stats.failed) / result.results.length) * 100).toFixed(1) : 'N/A'}% |

`).join('\n')}

---
*Generated by Performance Benchmark Suite v1.0.0*
`
  }

  const generateHTML = (): string => {
    const now = new Date().toISOString()
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Benchmark Report</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 2rem; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 2rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .stat-card { padding: 1rem; background: #f1f5f9; border-radius: 6px; text-align: center; }
        .stat-value { font-size: 1.5rem; font-weight: bold; color: #0f172a; }
        .stat-label { font-size: 0.875rem; color: #64748b; margin-top: 0.25rem; }
        table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
        th { background: #f8fafc; font-weight: 600; }
        .success { color: #059669; }
        .warning { color: #d97706; }
        .error { color: #dc2626; }
        .footer { text-align: center; margin-top: 2rem; color: #64748b; font-size: 0.875rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Performance Benchmark Report</h1>
            <p>Generated on ${now}</p>
        </div>

        <div class="card">
            <h2>Summary</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${results.length}</div>
                    <div class="stat-label">Total Tests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${results.reduce((sum, r) => sum + r.results.length, 0)}</div>
                    <div class="stat-label">Total Requests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${(results.reduce((sum, r) => sum + (r.stats?.avg || 0), 0) / results.length).toFixed(2)}ms</div>
                    <div class="stat-label">Avg Response Time</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${[...new Set(results.map(r => r.benchmarkType))].length}</div>
                    <div class="stat-label">Test Types</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>Detailed Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>URL</th>
                        <th>Test Type</th>
                        <th>Duration</th>
                        <th>Average</th>
                        <th>Min/Max</th>
                        <th>Success Rate</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(result => `
                    <tr>
                        <td><strong>${result.url}</strong><br><small>${new Date(result.timestamp).toLocaleString()}</small></td>
                        <td><span class="badge">${result.benchmarkType}</span></td>
                        <td>${result.duration.toFixed(2)}s</td>
                        <td><strong>${result.stats?.avg.toFixed(2) || 'N/A'}ms</strong></td>
                        <td>${result.stats?.min.toFixed(2) || 'N/A'} / ${result.stats?.max.toFixed(2) || 'N/A'}ms</td>
                        <td class="${result.stats ? (result.stats.failed === 0 ? 'success' : 'warning') : 'error'}">
                            ${result.stats ? (((result.results.length - result.stats.failed) / result.results.length) * 100).toFixed(1) : 'N/A'}%
                        </td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="footer">
            Generated by Performance Benchmark Suite v1.0.0
        </div>
    </div>
</body>
</html>`
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    const timestamp = new Date().toISOString().slice(0, 10)
    
    for (const formatId of selectedFormats) {
      const format = exportFormats.find(f => f.id === formatId)!
      let content = ''
      
      switch (formatId) {
        case 'json':
          content = generateJSON()
          break
        case 'csv':
          content = generateCSV()
          break
        case 'markdown':
          content = generateMarkdown()
          break
        case 'html':
          content = generateHTML()
          break
      }
      
      const filename = `benchmark-report-${timestamp}.${format.extension}`
      downloadFile(content, filename, format.mimeType)
      
      // Small delay between downloads to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    setIsExporting(false)
    setIsOpen(false)
  }

  return (
    <>
      <AnimatedButton
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        disabled={disabled || results.length === 0}
        className="relative"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
        {results.length > 0 && (
          <motion.span 
            className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            {results.length}
          </motion.span>
        )}
      </AnimatedButton>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-lg border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Export Options</h2>
                    <p className="text-sm text-muted-foreground">
                      Choose formats and settings for your export
                    </p>
                  </div>
                </div>
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </AnimatedButton>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-6">
                  {/* Format Selection */}
                  <div>
                    <h3 className="font-medium mb-3">Export Formats</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {exportFormats.map((format) => (
                        <motion.div
                          key={format.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`cursor-pointer rounded-lg border p-4 transition-all ${
                            selectedFormats.includes(format.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => {
                            setSelectedFormats(prev =>
                              prev.includes(format.id)
                                ? prev.filter(id => id !== format.id)
                                : [...prev, format.id]
                            )
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-md ${
                              selectedFormats.includes(format.id)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}>
                              {format.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{format.name}</h4>
                                {selectedFormats.includes(format.id) && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {format.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Options */}
                  <div>
                    <h3 className="font-medium mb-3">Export Options</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeCharts}
                          onChange={(e) => setIncludeCharts(e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="text-sm">Include raw measurement data</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeMetadata}
                          onChange={(e) => setIncludeMetadata(e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="text-sm">Include export metadata</span>
                      </label>
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <h3 className="font-medium mb-3">Export Summary</h3>
                    <div className="bg-muted rounded-lg p-4 text-sm space-y-2">
                      <div>Results: {results.length} benchmark tests</div>
                      <div>Formats: {selectedFormats.length} selected</div>
                      <div>Total requests: {results.reduce((sum, r) => sum + r.results.length, 0)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-muted/30">
                <AnimatedButton
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton
                  onClick={handleExport}
                  disabled={selectedFormats.length === 0 || isExporting}
                  loading={isExporting}
                >
                  {isExporting ? 'Exporting...' : `Export ${selectedFormats.length} Format${selectedFormats.length !== 1 ? 's' : ''}`}
                </AnimatedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}