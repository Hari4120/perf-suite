"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
  progress?: number
}

export function LoadingSpinner({ 
  size = "md", 
  className, 
  text,
  progress 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.div
        className={cn(
          "border-2 border-current border-t-transparent rounded-full",
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {text && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm text-muted-foreground"
        >
          {text}
        </motion.span>
      )}
      
      {progress !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {Math.round(progress)}%
          </span>
        </motion.div>
      )}
    </div>
  )
}

export function PulsingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}

export function LiveIndicator({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-2 bg-green-100 dark:bg-green-900 px-3 py-1.5 rounded-full"
    >
      <motion.div
        className="w-2 h-2 bg-green-500 rounded-full"
        animate={isActive ? {
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />
      <span className="text-xs text-green-700 dark:text-green-300 font-medium">
        {isActive ? 'LIVE' : 'READY'}
      </span>
    </motion.div>
  )
}