"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  HelpCircle, 
  X, 
  BookOpen, 
  Lightbulb, 
  Target, 
  TrendingUp,
  Zap,
  BarChart3,
  Clock,
  Shield,
  ChevronRight
} from "lucide-react"
import { AnimatedButton } from "@/components/ui/AnimatedButton"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardContent } from "@/components/ui/AnimatedCard"

interface HelpSystemProps {
  context?: 'benchmark' | 'network' | 'monitor' | 'general'
}

const helpContent = {
  benchmark: {
    title: "Benchmark Testing Help",
    icon: <Target className="h-5 w-5" />,
    sections: [
      {
        title: "Latency Testing",
        icon: <Clock className="h-4 w-4" />,
        content: "Measures response time with sequential requests. Ideal for baseline performance and SLA validation.",
        tips: [
          "Start with 10-20 runs for quick assessment",
          "Use higher run counts (50+) for statistical significance",
          "Monitor for consistency - high variance indicates instability"
        ]
      },
      {
        title: "Throughput Testing", 
        icon: <TrendingUp className="h-4 w-4" />,
        content: "Tests concurrent request handling to measure maximum capacity.",
        tips: [
          "Begin with low concurrency (5-10) and increase gradually",
          "Watch for performance degradation points",
          "Consider server resources when setting concurrent limits"
        ]
      },
      {
        title: "Load Testing",
        icon: <BarChart3 className="h-4 w-4" />,
        content: "Simulates realistic traffic patterns under normal operating conditions.",
        tips: [
          "Mirror expected production traffic patterns",
          "Run tests for sufficient duration (30+ seconds)",
          "Monitor both response time and error rates"
        ]
      },
      {
        title: "Stress Testing",
        icon: <Zap className="h-4 w-4" />,
        content: "Pushes systems beyond normal limits to identify breaking points.",
        tips: [
          "Start conservatively and increase load gradually",
          "Monitor system resources (CPU, memory, network)",
          "Have recovery plans ready for potential failures"
        ]
      }
    ]
  },
  network: {
    title: "Network Testing Help",
    icon: <Shield className="h-5 w-5" />,
    sections: [
      {
        title: "Speed Testing",
        icon: <TrendingUp className="h-4 w-4" />,
        content: "Measures download/upload speeds and provides quality scoring.",
        tips: [
          "Close other applications using network during tests",
          "Run multiple tests for more accurate averages",
          "Consider time of day impacts on network performance"
        ]
      },
      {
        title: "Buffer Bloat",
        icon: <Clock className="h-4 w-4" />,
        content: "Detects excessive buffering that causes latency spikes under load.",
        tips: [
          "Lower buffer bloat values indicate better network quality",
          "High values (>100ms) suggest network congestion issues",
          "QoS settings can help reduce buffer bloat"
        ]
      },
      {
        title: "DNS Resolution",
        icon: <Target className="h-4 w-4" />,
        content: "Measures DNS lookup performance which affects all web requests.",
        tips: [
          "Fast DNS (<50ms) improves overall browsing experience",
          "Consider using alternative DNS servers (1.1.1.1, 8.8.8.8)",
          "DNS caching can improve subsequent lookup times"
        ]
      }
    ]
  },
  monitor: {
    title: "Real-Time Monitoring Help",
    icon: <BarChart3 className="h-5 w-5" />,
    sections: [
      {
        title: "Continuous Monitoring",
        icon: <Clock className="h-4 w-4" />,
        content: "Provides ongoing network performance visibility.",
        tips: [
          "Monitor during different times to identify patterns",
          "Look for consistent performance or concerning trends",
          "Use data to identify optimal usage periods"
        ]
      },
      {
        title: "Quality Metrics",
        icon: <Target className="h-4 w-4" />,
        content: "Combines multiple factors into overall connection quality scores.",
        tips: [
          "Excellent (90+): Professional-grade connection",
          "Good (70-89): Suitable for most applications",
          "Fair (50-69): Basic usage, may have limitations",
          "Poor (<50): Significant connectivity issues"
        ]
      }
    ]
  },
  general: {
    title: "General Help & Best Practices",
    icon: <BookOpen className="h-5 w-5" />,
    sections: [
      {
        title: "Interpreting Results",
        icon: <BarChart3 className="h-4 w-4" />,
        content: "Understanding performance metrics and their implications.",
        tips: [
          "Lower latency values indicate faster response times",
          "Look for consistency - high standard deviation suggests instability",
          "Compare percentiles (95th, 99th) for tail latency analysis",
          "Monitor failed request rates for reliability assessment"
        ]
      },
      {
        title: "Testing Best Practices",
        icon: <Lightbulb className="h-4 w-4" />,
        content: "Guidelines for effective performance testing.",
        tips: [
          "Test from multiple locations and networks",
          "Run tests multiple times for statistical validity",
          "Document test conditions and configurations",
          "Establish baselines before making changes"
        ]
      },
      {
        title: "Troubleshooting",
        icon: <Shield className="h-4 w-4" />,
        content: "Common issues and solutions for performance problems.",
        tips: [
          "High latency: Check network path and server load",
          "Timeouts: Verify endpoint availability and adjust timeout settings",
          "Inconsistent results: Test at different times and conditions",
          "CORS errors: Ensure proper API configuration for cross-origin requests"
        ]
      }
    ]
  }
}

export default function HelpSystem({ context = 'general' }: HelpSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<number | null>(null)
  
  const currentContent = helpContent[context]

  return (
    <>
      {/* Help Trigger Button */}
      <AnimatedButton
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border-2"
      >
        <HelpCircle className="h-5 w-5 mr-2" />
        Help
      </AnimatedButton>

      {/* Help Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-lg border shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-muted/30">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {currentContent.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{currentContent.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Interactive guidance and best practices
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

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                <div className="space-y-4">
                  {currentContent.sections.map((section, index) => (
                    <AnimatedCard key={index} delay={index * 0.1}>
                      <div 
                        className="cursor-pointer"
                        onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                      >
                        <AnimatedCardHeader className="pb-3">
                          <AnimatedCardTitle className="flex items-center justify-between text-lg">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-primary/10 rounded-md">
                                {section.icon}
                              </div>
                              <span>{section.title}</span>
                            </div>
                            <motion.div
                              animate={{ rotate: expandedSection === index ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </motion.div>
                          </AnimatedCardTitle>
                        </AnimatedCardHeader>
                      </div>
                      
                      <AnimatePresence>
                        {expandedSection === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <AnimatedCardContent className="pt-0">
                              <p className="text-muted-foreground mb-4">
                                {section.content}
                              </p>
                              
                              <div className="space-y-3">
                                <h4 className="font-medium flex items-center space-x-2">
                                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                                  <span>Pro Tips</span>
                                </h4>
                                <ul className="space-y-2">
                                  {section.tips.map((tip, tipIndex) => (
                                    <motion.li
                                      key={tipIndex}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: tipIndex * 0.05 }}
                                      className="flex items-start space-x-3 text-sm text-muted-foreground"
                                    >
                                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                      <span>{tip}</span>
                                    </motion.li>
                                  ))}
                                </ul>
                              </div>
                            </AnimatedCardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </AnimatedCard>
                  ))}
                </div>

                {/* Quick Access Footer */}
                <div className="mt-8 pt-6 border-t">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(helpContent).map(([key, content]) => (
                      <AnimatedButton
                        key={key}
                        variant={context === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => window.location.hash = key}
                        className="text-xs"
                      >
                        {content.icon}
                        <span className="ml-1">{content.title.split(' ')[0]}</span>
                      </AnimatedButton>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}