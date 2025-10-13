"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface AnimatedButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  loading?: boolean
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = "default", size = "default", loading = false, children, onClick, disabled, ...props }) => {
    return (
      <motion.button
        whileHover={{ 
          scale: 1.02,
          transition: { type: "spring", stiffness: 400, damping: 25 }
        }}
        whileTap={{ 
          scale: 0.98,
          transition: { type: "spring", stiffness: 400, damping: 25 }
        }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          "relative overflow-hidden group",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg": variant === "default",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "text-primary underline-offset-4 hover:underline": variant === "link",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        onClick={onClick}
        disabled={loading || disabled}
        {...props}
      >
        {/* Ripple effect */}
        <span className="absolute inset-0 overflow-hidden rounded-md">
          <span className="absolute inset-0 translate-x-[-100%] bg-white/10 group-hover:translate-x-[100%] transition-transform duration-500 ease-out" />
        </span>
        
        {/* Loading spinner */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
            />
          </motion.div>
        )}
        
        {/* Content */}
        <span className={cn("relative flex items-center gap-2", loading && "opacity-0")}>
          {children}
        </span>
      </motion.button>
    )
  }
)
AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton }