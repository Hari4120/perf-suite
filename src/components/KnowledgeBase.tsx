"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Book, 
  ChevronRight, 
  ChevronDown, 
  Lightbulb, 
  Target, 
  TrendingUp,
  Wifi,
  Clock,
  Gauge,
  AlertCircle,
  CheckCircle2,
  Info,
  Zap,
  Globe,
  Server
} from "lucide-react"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardDescription, AnimatedCardContent } from "@/components/ui/AnimatedCard"
import { cn } from "@/lib/utils"

interface KnowledgeSection {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  content: KnowledgeItem[]
}

interface KnowledgeItem {
  title: string
  description: string
  technical: string
  bestPractice: string
  troubleshooting?: string
  benchmarks?: {
    excellent: string
    good: string
    poor: string
  }
}

const knowledgeSections: KnowledgeSection[] = [
  {
    id: "network-fundamentals",
    title: "Network Performance Fundamentals",
    icon: <Wifi className="h-5 w-5" />,
    description: "Core concepts of network performance measurement and optimization",
    content: [
      {
        title: "Latency (Response Time)",
        description: "The time it takes for data to travel from source to destination",
        technical: "Measured in milliseconds (ms). Includes propagation delay, transmission delay, processing delay, and queueing delay. Round-trip time (RTT) is the most common measurement.",
        bestPractice: "• Target <50ms for excellent user experience\n• Monitor 95th percentile, not just averages\n• Test from multiple geographic locations\n• Consider CDN placement for global applications",
        troubleshooting: "High latency causes: Geographic distance, network congestion, DNS resolution delays, server processing time, firewall inspection",
        benchmarks: {
          excellent: "< 50ms (Excellent user experience)",
          good: "50-150ms (Good for most applications)", 
          poor: "> 200ms (Noticeable delays, poor UX)"
        }
      },
      {
        title: "Throughput & Bandwidth",
        description: "The amount of data transmitted over a network in a given time period",
        technical: "Measured in Mbps or Gbps. Throughput is actual data transfer rate, while bandwidth is theoretical maximum capacity. Affected by network congestion, protocol overhead, and TCP window scaling.",
        bestPractice: "• Test with various payload sizes\n• Consider burst vs sustained throughput\n• Account for protocol overhead (TCP headers)\n• Monitor utilization vs capacity ratios",
        benchmarks: {
          excellent: "> 100 Mbps (High-speed broadband)",
          good: "25-100 Mbps (Standard broadband)",
          poor: "< 10 Mbps (Basic connectivity)"
        }
      },
      {
        title: "Jitter & Packet Loss",
        description: "Variation in packet arrival times and percentage of lost packets",
        technical: "Jitter measured in ms standard deviation. Packet loss as percentage. Both critical for real-time applications like VoIP and video conferencing.",
        bestPractice: "• Keep jitter <10ms for voice applications\n• Maintain packet loss <0.1% for critical apps\n• Use QoS policies for prioritization\n• Monitor during peak usage periods",
        benchmarks: {
          excellent: "Jitter <5ms, Loss <0.01%",
          good: "Jitter 5-20ms, Loss 0.01-0.1%",
          poor: "Jitter >50ms, Loss >1%"
        }
      }
    ]
  },
  {
    id: "dns-performance",
    title: "DNS Resolution & Performance",
    icon: <Globe className="h-5 w-5" />,
    description: "Domain Name System optimization and troubleshooting",
    content: [
      {
        title: "DNS Lookup Time",
        description: "Time required to resolve domain names to IP addresses",
        technical: "Includes recursive queries, authoritative responses, and caching effects. Modern applications perform multiple DNS lookups per page load.",
        bestPractice: "• Use fast, reliable DNS providers (1.1.1.1, 8.8.8.8)\n• Implement DNS prefetching for known domains\n• Monitor DNS cache hit rates\n• Consider DNS over HTTPS (DoH) for security",
        troubleshooting: "Slow DNS causes: Distant DNS servers, DNS server overload, DNS poisoning/hijacking, misconfigured DNS records",
        benchmarks: {
          excellent: "< 20ms (Fast DNS resolution)",
          good: "20-100ms (Acceptable for most users)",
          poor: "> 200ms (Noticeably slow page loads)"
        }
      },
      {
        title: "DNS Propagation",
        description: "Time for DNS changes to spread across the internet",
        technical: "TTL (Time To Live) values control caching duration. Lower TTLs enable faster updates but increase DNS query load.",
        bestPractice: "• Set appropriate TTL values (300-3600s)\n• Plan DNS changes during low-traffic periods\n• Use multiple DNS providers for redundancy\n• Monitor propagation with tools like WhatsMyDNS"
      }
    ]
  },
  {
    id: "buffer-bloat",
    title: "Buffer Bloat Analysis",
    icon: <TrendingUp className="h-5 w-5" />,
    description: "Understanding and diagnosing network buffering issues",
    content: [
      {
        title: "What is Buffer Bloat?",
        description: "Excessive buffering in network devices causing increased latency under load",
        technical: "Occurs when network buffers are oversized, causing packets to queue for extended periods. Results in high latency during data transfers while maintaining throughput.",
        bestPractice: "• Test latency both idle and under load\n• Look for >100ms latency increases\n• Consider Smart Queue Management (SQM)\n• Upgrade router firmware regularly",
        troubleshooting: "Symptoms: Good speed test results but poor interactive performance, high latency during downloads, buffering in video calls",
        benchmarks: {
          excellent: "< 20ms latency increase under load",
          good: "20-50ms latency increase",
          poor: "> 100ms latency increase (significant buffer bloat)"
        }
      },
      {
        title: "Fixing Buffer Bloat",
        description: "Solutions and mitigation strategies for buffer bloat issues",
        technical: "Implement Active Queue Management (AQM) algorithms like FQ-CoDel, PIE, or CAKE. Configure bandwidth limiting to prevent buffer overflow.",
        bestPractice: "• Enable Smart Queue Management if available\n• Set bandwidth limits to 85-95% of connection speed\n• Use routers with modern AQM algorithms\n• Consider OpenWrt firmware for advanced control"
      }
    ]
  },
  {
    id: "network-troubleshooting",
    title: "Network Troubleshooting Guide",
    icon: <AlertCircle className="h-5 w-5" />,
    description: "Systematic approach to diagnosing network performance issues",
    content: [
      {
        title: "Performance Testing Methodology",
        description: "Best practices for accurate network performance measurement",
        technical: "Use multiple test servers, test at different times, account for network overhead, and establish baseline measurements before making changes.",
        bestPractice: "• Test from multiple geographic locations\n• Perform tests at different times of day\n• Use wired connections for baseline tests\n• Document environmental factors\n• Repeat tests for consistency",
        troubleshooting: "Common issues: WiFi interference, ISP throttling, congested network paths, outdated network drivers, background applications"
      },
      {
        title: "WiFi Optimization",
        description: "Improving wireless network performance and reliability",
        technical: "WiFi performance affected by channel congestion, signal strength, interference, and protocol limitations. Modern WiFi 6/6E provides better performance in dense environments.",
        bestPractice: "• Use 5GHz band when possible\n• Select optimal channels (1, 6, 11 for 2.4GHz)\n• Position router centrally, elevated\n• Update WiFi drivers and firmware\n• Consider mesh systems for large areas"
      },
      {
        title: "ISP and WAN Optimization",
        description: "Optimizing internet service provider connections",
        technical: "ISP performance varies by technology (fiber, cable, DSL), time of day, and network congestion. Understanding these factors helps set realistic expectations.",
        bestPractice: "• Monitor performance over time\n• Test against ISP's advertised speeds\n• Document outages and slowdowns\n• Consider business-grade connections for critical uses\n• Understand traffic shaping policies"
      }
    ]
  },
  {
    id: "enterprise-networking",
    title: "Enterprise Network Performance",
    icon: <Server className="h-5 w-5" />,
    description: "Advanced concepts for enterprise network management",
    content: [
      {
        title: "Quality of Service (QoS)",
        description: "Prioritizing network traffic for optimal performance",
        technical: "QoS mechanisms include traffic classification, marking (DSCP), queuing, and shaping. Implements priority levels for different application types.",
        bestPractice: "• Classify traffic by application type\n• Prioritize real-time traffic (voice, video)\n• Implement fair queuing for best-effort traffic\n• Monitor QoS effectiveness with metrics\n• Document QoS policies and changes"
      },
      {
        title: "Network Monitoring & SLAs",
        description: "Continuous monitoring and service level agreements",
        technical: "Implement synthetic monitoring, real user monitoring (RUM), and network device monitoring. Define SLAs based on business requirements.",
        bestPractice: "• Define clear SLA metrics and thresholds\n• Implement automated alerting\n• Use both synthetic and real-user monitoring\n• Create performance dashboards\n• Regular SLA reviews and adjustments"
      }
    ]
  },
  {
    id: "modern-protocols",
    title: "Modern Network Protocols",
    icon: <Zap className="h-5 w-5" />,
    description: "Understanding HTTP/3, QUIC, and emerging technologies",
    content: [
      {
        title: "HTTP/3 and QUIC",
        description: "Next-generation web protocols for improved performance",
        technical: "QUIC protocol reduces connection establishment time, improves multiplexing, and provides better handling of packet loss. HTTP/3 built on QUIC for enhanced web performance.",
        bestPractice: "• Enable HTTP/3 on web servers when available\n• Monitor adoption and performance improvements\n• Consider fallback strategies for compatibility\n• Test performance benefits in your environment"
      },
      {
        title: "IPv6 Deployment",
        description: "Internet Protocol version 6 adoption and benefits",
        technical: "IPv6 provides larger address space, improved routing efficiency, and better support for mobile devices. Dual-stack deployment common during transition.",
        bestPractice: "• Implement dual-stack IPv4/IPv6\n• Monitor IPv6 traffic growth\n• Test application compatibility\n• Plan for IPv4 exhaustion scenarios\n• Consider IPv6-only networks for new deployments"
      }
    ]
  }
]

export default function KnowledgeBase() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const getBenchmarkColor = (type: 'excellent' | 'good' | 'poor') => {
    switch (type) {
      case 'excellent': return 'text-green-600 bg-green-50 dark:bg-green-950'
      case 'good': return 'text-blue-600 bg-blue-50 dark:bg-blue-950'
      case 'poor': return 'text-red-600 bg-red-50 dark:bg-red-950'
    }
  }

  const getBenchmarkIcon = (type: 'excellent' | 'good' | 'poor') => {
    switch (type) {
      case 'excellent': return <CheckCircle2 className="h-4 w-4" />
      case 'good': return <Info className="h-4 w-4" />
      case 'poor': return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <AnimatedCard delay={0.05}>
      <AnimatedCardHeader>
        <AnimatedCardTitle className="flex items-center space-x-2">
          <Book className="h-6 w-6 text-primary" />
          <span>Network Performance Knowledge Base</span>
        </AnimatedCardTitle>
        <AnimatedCardDescription>
          Comprehensive technical documentation for network performance testing, analysis, and optimization
        </AnimatedCardDescription>
      </AnimatedCardHeader>
      
      <AnimatedCardContent className="space-y-4">
        <div className="grid gap-4">
          {knowledgeSections.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 text-left hover:bg-muted/50 transition-colors duration-150 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-primary">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedSections.has(section.id) ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {expandedSections.has(section.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="border-t bg-muted/20"
                  >
                    <div className="p-4 space-y-3">
                      {section.content.map((item, itemIndex) => {
                        const itemId = `${section.id}-${itemIndex}`
                        return (
                          <motion.div
                            key={itemId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: itemIndex * 0.05 }}
                            className="border rounded-lg overflow-hidden bg-background"
                          >
                            <button
                              onClick={() => toggleItem(itemId)}
                              className="w-full p-3 text-left hover:bg-muted/30 transition-colors duration-150 flex items-center justify-between"
                            >
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                              <motion.div
                                animate={{ rotate: expandedItems.has(itemId) ? 180 : 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </motion.div>
                            </button>
                            
                            <AnimatePresence>
                              {expandedItems.has(itemId) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2, ease: "easeInOut" }}
                                  className="border-t"
                                >
                                  <div className="p-4 space-y-4">
                                    {/* Technical Details */}
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <Gauge className="h-4 w-4 text-blue-600" />
                                        <h5 className="font-medium text-blue-600">Technical Details</h5>
                                      </div>
                                      <p className="text-sm text-muted-foreground pl-6">
                                        {item.technical}
                                      </p>
                                    </div>
                                    
                                    {/* Best Practices */}
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <Target className="h-4 w-4 text-green-600" />
                                        <h5 className="font-medium text-green-600">Best Practices</h5>
                                      </div>
                                      <div className="text-sm text-muted-foreground pl-6">
                                        {item.bestPractice.split('\n').map((practice, index) => (
                                          <div key={index} className="mb-1">
                                            {practice}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {/* Troubleshooting */}
                                    {item.troubleshooting && (
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <Lightbulb className="h-4 w-4 text-orange-600" />
                                          <h5 className="font-medium text-orange-600">Troubleshooting</h5>
                                        </div>
                                        <p className="text-sm text-muted-foreground pl-6">
                                          {item.troubleshooting}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {/* Performance Benchmarks */}
                                    {item.benchmarks && (
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <Clock className="h-4 w-4 text-purple-600" />
                                          <h5 className="font-medium text-purple-600">Performance Benchmarks</h5>
                                        </div>
                                        <div className="pl-6 space-y-2">
                                          {Object.entries(item.benchmarks).map(([type, value]) => (
                                            <div
                                              key={type}
                                              className={cn(
                                                "flex items-center space-x-2 p-2 rounded text-sm",
                                                getBenchmarkColor(type as 'excellent' | 'good' | 'poor')
                                              )}
                                            >
                                              {getBenchmarkIcon(type as 'excellent' | 'good' | 'poor')}
                                              <span className="font-medium capitalize">{type}:</span>
                                              <span>{value}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        
        {/* Quick Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border"
        >
          <h3 className="font-semibold text-lg mb-4 flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            <span>Quick Reference Guide</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Excellent Performance</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Latency: &lt; 50ms</li>
                <li>• Speed: &gt; 100 Mbps</li>
                <li>• DNS: &lt; 20ms</li>
                <li>• Jitter: &lt; 5ms</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">Good Performance</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Latency: 50-150ms</li>
                <li>• Speed: 25-100 Mbps</li>
                <li>• DNS: 20-100ms</li>
                <li>• Jitter: 5-20ms</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Needs Improvement</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Latency: &gt; 200ms</li>
                <li>• Speed: &lt; 10 Mbps</li>
                <li>• DNS: &gt; 200ms</li>
                <li>• Jitter: &gt; 50ms</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatedCardContent>
    </AnimatedCard>
  )
}