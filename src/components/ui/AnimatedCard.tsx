"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  hover?: boolean
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, delay = 0, direction = "up", hover = true, ...props }, ref) => {
    const [inViewRef, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    })

    const directionOffset = {
      up: { y: 60, x: 0 },
      down: { y: -60, x: 0 },
      left: { y: 0, x: 60 },
      right: { y: 0, x: -60 },
    }

    const variants = {
      hidden: {
        opacity: 0,
        ...directionOffset[direction],
      },
      visible: {
        opacity: 1,
        y: 0,
        x: 0,
      },
    }

    const hoverVariants = hover
      ? {
          scale: 1.02,
          y: -8,
        }
      : {}

    return (
      <motion.div
        ref={(node) => {
          inViewRef(node)
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={variants}
        transition={{
          duration: 0.3, // Faster animations
          delay: delay,
          ease: "easeOut",
        }}
        whileHover={hoverVariants}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300",
          hover && "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
AnimatedCard.displayName = "AnimatedCard"

const AnimatedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
AnimatedCardHeader.displayName = "AnimatedCardHeader"

const AnimatedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
AnimatedCardTitle.displayName = "AnimatedCardTitle"

const AnimatedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AnimatedCardDescription.displayName = "AnimatedCardDescription"

const AnimatedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
AnimatedCardContent.displayName = "AnimatedCardContent"

export { 
  AnimatedCard, 
  AnimatedCardHeader, 
  AnimatedCardTitle, 
  AnimatedCardDescription, 
  AnimatedCardContent 
}