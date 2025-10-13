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
  // Getting Started
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
    question: "How do I get started with my first test?",
    answer: "Simply enter your API endpoint URL in the configuration panel, select 'Latency Test' for beginners, keep the default settings, and click 'Run Benchmark'. Try our demo endpoint: https://httpbin.org/delay/1",
    category: "getting-started"
  },
  {
    question: "What are good APIs to test for practice?",
    answer: "Try these public APIs: httpbin.org/delay/1 (simulates 1s delay), api.github.com/zen (GitHub's zen quotes), jsonplaceholder.typicode.com/posts/1 (fake REST API), or httpbin.org/status/200 (simple status response).",
    category: "getting-started"
  },
  {
    question: "How long should I run tests?",
    answer: "For latency tests: 10-50 runs. For load/stress tests: 30-300 seconds depending on your needs. Start small and increase duration for more comprehensive results.",
    category: "getting-started"
  },

  // Features
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
    question: "What's the difference between concurrent and sequential testing?",
    answer: "Sequential (latency) tests send one request at a time to measure individual response times. Concurrent tests send multiple simultaneous requests to test how your API handles load.",
    category: "features"
  },
  {
    question: "How accurate are the measurements?",
    answer: "Measurements include full round-trip time from browser to server. Results may vary due to network conditions, but trends and relative performance are reliable for comparison.",
    category: "features"
  },
  {
    question: "Can I test APIs with authentication?",
    answer: "Currently, the tool tests publicly accessible endpoints. For authenticated APIs, ensure your endpoint accepts requests without auth headers, or test public endpoints of your service.",
    category: "features"
  },
  {
    question: "What request methods are supported?",
    answer: "Currently supports GET requests. This covers most API testing scenarios including REST endpoints, status checks, and data retrieval endpoints.",
    category: "features"
  },
  {
    question: "What's the difference between API tests and network tests?",
    answer: "API tests measure specific endpoint performance, while network tests assess your internet connection quality, speed, buffer bloat, DNS resolution, and overall connectivity health.",
    category: "features"
  },
  {
    question: "How does the speed test work?",
    answer: "The speed test downloads test files from reliable servers to measure your actual download speed, estimates upload speed, and measures latency. Results may vary based on server load and distance.",
    category: "features"
  },

  // Troubleshooting
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
    question: "The test is taking too long or timing out",
    answer: "Increase the timeout value in settings (default is 10 seconds). If your API is very slow, consider testing with fewer concurrent requests or shorter duration.",
    category: "troubleshooting"
  },
  {
    question: "Why do I see 'Failed' requests?",
    answer: "Failed requests occur due to timeouts, network errors, or server errors (4xx/5xx status codes). Check your API's health and network connectivity.",
    category: "troubleshooting"
  },
  {
    question: "Charts aren't loading or displaying",
    answer: "Ensure JavaScript is enabled and you have a modern browser. Try refreshing the page or clearing browser cache if charts appear broken.",
    category: "troubleshooting"
  },
  {
    question: "Results seem too fast or too slow",
    answer: "Very fast results (<10ms) might indicate cached responses. Very slow results might indicate network issues or server problems. Compare with other tools to verify.",
    category: "troubleshooting"
  },
  {
    question: "What is buffer bloat and why should I care?",
    answer: "Buffer bloat occurs when network buffers are too large, causing increased latency under load. It affects real-time applications like video calls and gaming. Our test measures latency increase under network load.",
    category: "troubleshooting"
  },
  {
    question: "Why is my real-time monitor showing offline?",
    answer: "The monitor tests multiple endpoints to determine connectivity. Temporary offline status might indicate network issues, DNS problems, or blocked connections. Check your internet connection and firewall settings.",
    category: "troubleshooting"
  },

  // Advanced
  {
    question: "How do I interpret the charts?",
    answer: "The trend chart shows individual request times, the histogram shows distribution patterns, and the comparison chart helps you compare different tests or endpoints over time.",
    category: "advanced"
  },
  {
    question: "Can I export and share results?",
    answer: "Yes! Click the Export button to download your results as JSON. You can share these files with your team or import them into other analysis tools.",
    category: "advanced"
  },
  {
    question: "What's the best way to benchmark API performance?",
    answer: "Run baseline latency tests first, then gradually increase load. Test at different times, from different locations if possible, and always test the same endpoints for consistent comparison.",
    category: "advanced"
  },
  {
    question: "How do I set up performance monitoring?",
    answer: "Use this tool for periodic testing, export results, and track trends over time. Set performance budgets (e.g., 95th percentile < 500ms) and test before deployments.",
    category: "advanced"
  },
  {
    question: "Can I integrate this with CI/CD pipelines?",
    answer: "While this is a web-based tool, you can use the same concepts with command-line tools like curl, wrk, or apache bench in your CI/CD for automated performance testing.",
    category: "advanced"
  },
  {
    question: "What performance metrics should I focus on?",
    answer: "For user-facing APIs: focus on 95th percentile and median. For internal APIs: average and max. For SLAs: 99th percentile. Always monitor error rates alongside response times.",
    category: "advanced"
  },
  {
    question: "How can I use network tests for troubleshooting?",
    answer: "Use speed tests to verify ISP performance, buffer bloat tests for gaming/video call issues, DNS tests for slow website loading, and real-time monitoring to track connection stability over time.",
    category: "advanced"
  },
  {
    question: "What's a good network quality score?",
    answer: "90-100: Excellent for all activities. 70-89: Good for most uses. 50-69: Fair, may have issues with real-time apps. Below 50: Poor, significant problems expected. Score considers speed, latency, jitter, and stability.",
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
                transition={{ delay: index * 0.02 }}
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
                      transition={{ duration: 0.1 }}
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
                      transition={{ duration: 0.15, ease: "easeInOut" }}
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