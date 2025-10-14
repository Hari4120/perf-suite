"use client"

import { motion } from "framer-motion"
import { Loader2, Activity, Zap, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'rounded' | 'circle'
}

export function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  return (
    <motion.div
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }}
      className={cn(
        "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]",
        variant === 'rounded' && "rounded-md",
        variant === 'circle' && "rounded-full",
        className
      )}
    />
  )
}

interface AdvancedSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse' | 'bounce'
  className?: string
  text?: string
}

export function AdvancedSpinner({ 
  size = 'md', 
  variant = 'default', 
  className,
  text 
}: AdvancedSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className={cn(
              "rounded-full bg-primary",
              size === 'sm' ? 'w-1 h-1' :
              size === 'md' ? 'w-2 h-2' :
              size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
            )}
          />
        ))}
        {text && <span className="ml-2 text-sm text-muted-foreground">{text}</span>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={cn("rounded-full bg-primary", sizeClasses[size])}
        />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    )
  }

  if (variant === 'bounce') {
    return (
      <div className={cn("flex items-center space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1
            }}
            className={cn(
              "rounded-full bg-primary",
              size === 'sm' ? 'w-1 h-1' :
              size === 'md' ? 'w-2 h-2' :
              size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
            )}
          />
        ))}
        {text && <span className="ml-2 text-sm text-muted-foreground">{text}</span>}
      </div>
    )
  }

  // Default spinner
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

interface ProcessingIndicatorProps {
  steps: Array<{
    id: string
    label: string
    status: 'pending' | 'running' | 'completed' | 'error'
    icon?: React.ReactNode
  }>
  currentStep?: string
  className?: string
}

export function ProcessingIndicator({ steps, className }: ProcessingIndicatorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-3"
        >
          {/* Status Icon */}
          <div className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full transition-all",
            step.status === 'pending' && "bg-muted text-muted-foreground",
            step.status === 'running' && "bg-primary text-primary-foreground",
            step.status === 'completed' && "bg-green-500 text-white",
            step.status === 'error' && "bg-red-500 text-white"
          )}>
            {step.status === 'running' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : step.status === 'completed' ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="h-2 w-2 bg-white rounded-full"
              />
            ) : step.status === 'error' ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="h-2 w-2"
              >
                ✕
              </motion.div>
            ) : (
              step.icon || <div className="h-2 w-2 bg-current rounded-full opacity-30" />
            )}
          </div>
          
          {/* Step Label */}
          <span className={cn(
            "text-sm transition-colors",
            step.status === 'running' && "text-foreground font-medium",
            step.status === 'completed' && "text-green-600 dark:text-green-400",
            step.status === 'error' && "text-red-600 dark:text-red-400",
            step.status === 'pending' && "text-muted-foreground"
          )}>
            {step.label}
          </span>
          
          {/* Progress Line */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-px bg-border">
              {(step.status === 'completed' || step.status === 'error') && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={cn(
                    "h-full",
                    step.status === 'completed' ? "bg-green-500" : "bg-red-500"
                  )}
                />
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  showPercentage?: boolean
  color?: string
}

export function ProgressRing({ 
  progress, 
  size = 40, 
  strokeWidth = 3, 
  className,
  showPercentage = false,
  color = "currentColor"
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-20"
        />
        
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            strokeDasharray: circumference
          }}
        />
      </svg>
      
      {showPercentage && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute text-xs font-medium"
        >
          {Math.round(progress)}%
        </motion.span>
      )}
    </div>
  )
}

interface MetricLoadingProps {
  label: string
  icon?: React.ReactNode
  className?: string
}

export function MetricLoading({ label, icon, className }: MetricLoadingProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center space-x-2">
        {icon && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-primary"
          >
            {icon}
          </motion.div>
        )}
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-8 w-24 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
      </div>
    </div>
  )
}

interface TestRunningProps {
  phase: string
  progress?: number
  currentTest?: string
  className?: string
}

export function TestRunning({ phase, progress, currentTest, className }: TestRunningProps) {
  const getPhaseIcon = () => {
    switch (phase.toLowerCase()) {
      case 'initializing':
      case 'preparing':
        return <Activity className="h-4 w-4" />
      case 'latency':
      case 'speed':
        return <Zap className="h-4 w-4" />
      case 'dns':
      case 'finalizing':
        return <Clock className="h-4 w-4" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />
    }
  }

  return (
    <div className={cn("flex items-center space-x-4 p-4 bg-muted/30 rounded-lg", className)}>
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-primary"
      >
        {getPhaseIcon()}
      </motion.div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-medium capitalize">{phase}</span>
          {progress !== undefined && (
            <ProgressRing progress={progress} size={24} showPercentage />
          )}
        </div>
        {currentTest && (
          <p className="text-sm text-muted-foreground truncate">{currentTest}</p>
        )}
      </div>
      
      <AdvancedSpinner variant="pulse" size="sm" />
    </div>
  )
}