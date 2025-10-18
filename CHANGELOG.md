# Changelog

All notable changes to the Performance Benchmark Suite will be documented in this file.

## [2.1.0] - 2025-01-18

### Major Cleanup & Optimization

#### Removed Bloat
- Removed all unused chart components (ComparisonChart, HistogramChart, LazyCharts, RealTimeChart)
- Removed authentication scaffolding (NextAuth, Prisma, database schemas)
- Removed testing infrastructure (Jest, Playwright, test files)
- Removed Docker/CI/CD infrastructure (not needed for Vercel deployment)
- Removed 15+ unused npm dependencies
- Removed unnecessary UI components (AnimatedCard, Button, Tooltip, LoadingStates)

#### Network Testing Improvements
- Fixed upload speed measurement to use client-side timing for accuracy
- Implemented multiple upload tests (1MB, 2MB, 3MB) with median calculation
- Fixed CORS issues by using only Cloudflare endpoints
- Reduced upload size to stay under Vercel's 4.5MB limit
- Added live progress display with animated icons and real-time speeds
- Improved latency testing with 15 samples using lightweight endpoints

#### UI Enhancements
- Removed meaningless stats (median, 95th percentile) for API tests
- Removed response time and distribution charts
- Added live test progress with animated progress bar
- Display real-time download/upload speeds during testing
- Show live quality score during test
- Optimized page layout to use full window height with flex layout

#### Code Cleanup
- Simplified validation schemas to only what's needed
- Removed authentication-related code
- Cleaned up package.json scripts to essentials
- Removed "Professional" branding from all metadata

### Current Features
- API latency, throughput, load, and stress testing
- Internet speed test (download, upload, latency, jitter, quality score)
- Live progress display during testing
- CSV export for API test results
- Dark/light theme support
- Minimal, clean UI focused on functionality

## [2.0.0] - 2025-01-18

### Initial modernization with Next.js 15, React 19, and Tailwind CSS v4
- Complete UI overhaul with modern design
- Network testing functionality
- Theme support
