"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Bug, Mail } from 'lucide-react'
import { AnimatedButton } from '@/components/ui/AnimatedButton'
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardContent } from '@/components/ui/AnimatedCard'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
    
    // In production, you would send this to an error reporting service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props
      
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} resetError={this.handleReset} />
      }

      return (
        <DefaultErrorFallback 
          error={this.state.error} 
          resetError={this.handleReset}
          errorInfo={this.state.errorInfo}
        />
      )
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error?: Error
  resetError: () => void
  errorInfo?: React.ErrorInfo
}

function DefaultErrorFallback({ error, resetError, errorInfo }: DefaultErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)
  
  const reportError = () => {
    const errorDetails = {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    // Create mailto link with error details
    const subject = encodeURIComponent('Performance Suite Error Report')
    const body = encodeURIComponent(`Error Report:

Message: ${errorDetails.message}
Timestamp: ${errorDetails.timestamp}
URL: ${errorDetails.url}
User Agent: ${errorDetails.userAgent}

Stack Trace:
${errorDetails.stack || 'Not available'}

Component Stack:
${errorDetails.componentStack || 'Not available'}

Please describe what you were doing when this error occurred:
[Please fill in details here]
`)
    
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`)
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatedCard className="max-w-2xl mx-auto">
          <AnimatedCardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4"
            >
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </motion.div>
            
            <AnimatedCardTitle className="text-xl text-red-600 dark:text-red-400">
              Oops! Something went wrong
            </AnimatedCardTitle>
          </AnimatedCardHeader>
          
          <AnimatedCardContent className="space-y-6">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">
                We encountered an unexpected error while running the performance benchmark suite.
                This shouldn&apos;t happen, and we apologize for the inconvenience.
              </p>
            </div>

            {error && (
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Bug className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-sm">Error Details</span>
                </div>
                <code className="text-sm text-red-600 dark:text-red-400 font-mono">
                  {error.message}
                </code>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <AnimatedButton
                onClick={resetError}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </AnimatedButton>
              
              <AnimatedButton
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload Page</span>
              </AnimatedButton>
              
              <AnimatedButton
                variant="outline"
                onClick={reportError}
                className="flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Report Issue</span>
              </AnimatedButton>
            </div>

            {/* Technical Details Toggle */}
            {(error?.stack || errorInfo?.componentStack) && (
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showDetails ? 'Hide' : 'Show'} technical details
                </button>
                
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-4 bg-muted rounded-lg overflow-auto max-h-64"
                  >
                    <div className="space-y-4 text-xs font-mono">
                      {error?.stack && (
                        <div>
                          <div className="font-semibold mb-2">Stack Trace:</div>
                          <pre className="whitespace-pre-wrap text-red-600 dark:text-red-400">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      
                      {errorInfo?.componentStack && (
                        <div>
                          <div className="font-semibold mb-2">Component Stack:</div>
                          <pre className="whitespace-pre-wrap text-muted-foreground">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Helpful Tips */}
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Common Solutions:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Try refreshing the page</li>
                <li>• Clear your browser cache and cookies</li>
                <li>• Check your internet connection</li>
                <li>• Try a different browser</li>
                <li>• Contact support if the problem persists</li>
              </ul>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>
    </div>
  )
}

export { ErrorBoundaryClass as ErrorBoundary }

// Hook for handling async errors
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error)
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorReporting(error, context)
    }
  }, [])
  
  return handleError
}