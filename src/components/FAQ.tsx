"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, HelpCircle } from "lucide-react"
import { AnimatedCard, AnimatedCardContent } from "@/components/ui/AnimatedCard"
import { cn } from "@/lib/utils"

interface FAQItem {
  question: string
  answer: string
  category: "getting-started" | "features" | "troubleshooting" | "advanced"
}

const faqData: FAQItem[] = [
  {
    question: "What is the Performance Benchmark Suite?",
    answer: "A professional-grade tool for testing API performance with multiple benchmark types including latency, throughput, load, and stress testing. It provides real-time analytics and beautiful visualizations to help you understand your API's performance characteristics.",
    category: "getting-started"
  },
  {
    question: "Which test type should I use?",
    answer: "Use Latency Testing for baseline performance, Throughput Testing for concurrent capacity, Load Testing for realistic conditions, and Stress Testing to find breaking points. Start with latency tests if you're unsure.",
    category: "getting-started"
  },
  {
    question: "What do the statistics mean?",
    answer: "Average shows typical response time, Median is the middle value (less affected by outliers), 95th percentile means 95% of requests were faster than this value, and it's crucial for SLA monitoring.",
    category: "features"
  },
  {
    question: "Can I test private APIs?",
    answer: "Yes! You can test any accessible API endpoint. Make sure your API supports CORS for web-based testing, or use tools like ngrok to expose local development servers.",
    category: "features"
  },
  {
    question: "Why am I getting CORS errors?",
    answer: "CORS (Cross-Origin Resource Sharing) errors occur when testing APIs that don't allow browser requests from other domains. Use APIs with CORS headers or test public endpoints like httpbin.org for demos.",
    category: "troubleshooting"
  },
  {
    question: "Why are my results inconsistent?",
    answer: "Network conditions, server load, and geographic distance affect results. Run multiple tests and focus on trends rather than single measurements. Consider testing at different times of day.",
    category: "troubleshooting"
  },
  {
    question: "How do I interpret the charts?",
    answer: "The trend chart shows individual request times, the histogram shows distribution patterns, and the comparison chart helps you compare different tests or endpoints over time.",
    category: "advanced"
  },
  {
    question: "Can I export and share results?",
    answer: "Yes! Click the Export button to download your results as JSON. You can share these files with your team or import them into other analysis tools.",
    category: "advanced"
  }
]

const categories = {
  "getting-started": { label: "Getting Started", icon: "🚀", color: "text-blue-600" },
  "features": { label: "Features", icon: "✨", color: "text-green-600" },
  "troubleshooting": { label: "Troubleshooting", icon: "🔧", color: "text-orange-600" },
  "advanced": { label: "Advanced", icon: "⚡", color: "text-purple-600" }
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<string>("getting-started")
  const [openQuestions, setOpenQuestions] = useState<Set<number>>(new Set([0]))

  const toggleQuestion = (index: number) => {
    const newOpen = new Set(openQuestions)
    if (newOpen.has(index)) {
      newOpen.delete(index)
    } else {
      newOpen.add(index)
    }
    setOpenQuestions(newOpen)
  }

  const filteredFAQs = faqData.filter(faq => faq.category === activeCategory)

  return (
    <AnimatedCard delay={0.7} className="overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <HelpCircle className="h-7 w-7 text-primary" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about performance testing</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(categories).map(([key, category]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(key)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeCategory === key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
              <span className="text-xs opacity-70">
                ({faqData.filter(faq => faq.category === key).length})
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatedCardContent className="p-0">
        <div className="space-y-1">
          <AnimatePresence mode="wait">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={`${activeCategory}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="border-b last:border-b-0"
              >
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full p-6 text-left hover:bg-muted/50 transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <span className={cn("text-lg", categories[activeCategory as keyof typeof categories].color)}>
                        {categories[activeCategory as keyof typeof categories].icon}
                      </span>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {faq.question}
                      </h3>
                    </div>
                    <motion.div
                      animate={{ rotate: openQuestions.has(index) ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence>
                  {openQuestions.has(index) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pl-12">
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-t"
        >
          <div className="text-center">
            <h3 className="font-semibold mb-2">Still have questions?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try our demo endpoints or check out the examples to get started quickly.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <code className="px-2 py-1 bg-muted rounded">https://httpbin.org/delay/1</code>
              <code className="px-2 py-1 bg-muted rounded">https://api.github.com/zen</code>
              <code className="px-2 py-1 bg-muted rounded">https://jsonplaceholder.typicode.com/posts/1</code>
            </div>
          </div>
        </motion.div>
      </AnimatedCardContent>
    </AnimatedCard>
  )
}