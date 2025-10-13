"use client"

import { motion } from "framer-motion"
import { 
  Github, 
  Globe, 
  Heart, 
  Zap, 
  Shield, 
  Code, 
  ExternalLink,
  Activity
} from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  const features = [
    {
      icon: <Zap className="h-4 w-4" />,
      title: "Real-time Testing",
      description: "Live performance monitoring"
    },
    {
      icon: <Shield className="h-4 w-4" />,
      title: "Enterprise Ready",
      description: "Professional-grade diagnostics"
    },
    {
      icon: <Code className="h-4 w-4" />,
      title: "Open Source",
      description: "Built with modern web technologies"
    },
    {
      icon: <Activity className="h-4 w-4" />,
      title: "Advanced Analytics",
      description: "Comprehensive reporting & insights"
    }
  ]

  const technologies = [
    "Next.js 15",
    "TypeScript",
    "Tailwind CSS",
    "Framer Motion",
    "Chart.js",
    "React 18"
  ]

  return (
    <motion.footer 
      className="border-t bg-muted/30 mt-16"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Activity className="h-6 w-6 text-primary" />
              </motion.div>
              <span className="text-lg font-bold">Performance Suite</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Professional network diagnostics and API testing platform. 
              Built for developers, SREs, and performance engineers.
            </p>
            <div className="flex items-center space-x-4">
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-background border hover:border-primary/50 transition-colors"
              >
                <Github className="h-4 w-4" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-background border hover:border-primary/50 transition-colors"
              >
                <Globe className="h-4 w-4" />
              </motion.a>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="font-semibold mb-4">Platform Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-background/50 transition-colors group"
                >
                  <div className="p-1 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">{feature.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Technologies */}
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold mb-4">Built With</h3>
            <div className="space-y-2">
              {technologies.map((tech, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 2 }}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>{tech}</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          variants={itemVariants}
          className="border-t pt-8 mt-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
        >
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>© {currentYear} Performance Benchmark Suite</span>
            <div className="w-px h-4 bg-border" />
            <span>v1.0.0</span>
            <div className="w-px h-4 bg-border" />
            <motion.span 
              className="flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
            >
              <span>Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="h-3 w-3 text-red-500" />
              </motion.div>
              <span>for developers</span>
            </motion.span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-muted-foreground">
            <motion.a 
              href="#privacy" 
              whileHover={{ y: -1 }}
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </motion.a>
            <motion.a 
              href="#terms"
              whileHover={{ y: -1 }}
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </motion.a>
            <motion.a 
              href="#docs"
              whileHover={{ y: -1 }}
              className="hover:text-foreground transition-colors"
            >
              Documentation
            </motion.a>
            <motion.a 
              href="#support"
              whileHover={{ y: -1 }}
              className="hover:text-foreground transition-colors"
            >
              Support
            </motion.a>
          </div>
        </motion.div>

        {/* Status Indicator */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-center mt-8 pt-4 border-t"
        >
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <span>All systems operational</span>
            <div className="w-px h-3 bg-border mx-2" />
            <span>Uptime: 99.9%</span>
            <div className="w-px h-3 bg-border mx-2" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}