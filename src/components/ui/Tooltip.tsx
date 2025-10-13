"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"

interface TooltipProps {
  children: React.ReactNode
  content: string | React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  delay?: number
  className?: string
  contentClassName?: string
}

export function Tooltip({ 
  children, 
  content, 
  position = 'auto', 
  delay = 500,
  className = "",
  contentClassName = ""
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [actualPosition, setActualPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top')
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const calculatePosition = () => {
    if (!triggerRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current?.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    let finalPosition = position
    let x = 0
    let y = 0

    // Auto positioning logic
    if (position === 'auto') {
      const spaceTop = triggerRect.top
      const spaceBottom = viewport.height - triggerRect.bottom
      const spaceLeft = triggerRect.left
      const spaceRight = viewport.width - triggerRect.right

      // Choose position with most space
      if (spaceBottom >= 50) finalPosition = 'bottom'
      else if (spaceTop >= 50) finalPosition = 'top'
      else if (spaceRight >= 200) finalPosition = 'right'
      else finalPosition = 'left'
    }

    // Calculate coordinates based on final position
    switch (finalPosition) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2
        y = triggerRect.top - 8
        break
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2
        y = triggerRect.bottom + 8
        break
      case 'left':
        x = triggerRect.left - 8
        y = triggerRect.top + triggerRect.height / 2
        break
      case 'right':
        x = triggerRect.right + 8
        y = triggerRect.top + triggerRect.height / 2
        break
    }

    setTooltipPosition({ x, y })
    setActualPosition(finalPosition)
  }

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      calculatePosition()
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const getTransformOrigin = () => {
    switch (actualPosition) {
      case 'top': return 'bottom center'
      case 'bottom': return 'top center'
      case 'left': return 'right center'
      case 'right': return 'left center'
      default: return 'center'
    }
  }

  const getTransform = () => {
    switch (actualPosition) {
      case 'top': return 'translate(-50%, -100%)'
      case 'bottom': return 'translate(-50%, 0)'
      case 'left': return 'translate(-100%, -50%)'
      case 'right': return 'translate(0, -50%)'
      default: return 'translate(-50%, -100%)'
    }
  }

  const tooltip = isVisible && (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      style={{
        position: 'fixed',
        left: tooltipPosition.x,
        top: tooltipPosition.y,
        transform: getTransform(),
        transformOrigin: getTransformOrigin(),
        zIndex: 9999,
        pointerEvents: 'none'
      }}
      className={`max-w-xs px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 ${contentClassName}`}
    >
      {content}
      
      {/* Arrow */}
      <div 
        className="absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rotate-45"
        style={{
          ...(actualPosition === 'top' && {
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            borderRight: '1px solid',
            borderBottom: '1px solid'
          }),
          ...(actualPosition === 'bottom' && {
            top: '-4px',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            borderLeft: '1px solid',
            borderTop: '1px solid'
          }),
          ...(actualPosition === 'left' && {
            right: '-4px',
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            borderRight: '1px solid',
            borderTop: '1px solid'
          }),
          ...(actualPosition === 'right' && {
            left: '-4px',
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            borderLeft: '1px solid',
            borderBottom: '1px solid'
          })
        }}
      />
    </motion.div>
  )

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {typeof document !== 'undefined' && (
        <AnimatePresence>
          {createPortal(tooltip, document.body)}
        </AnimatePresence>
      )}
    </>
  )
}