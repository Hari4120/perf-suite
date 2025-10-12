# 🚀 Performance Benchmark Suite

A professional-grade API performance benchmarking and analysis tool built with Next.js 15, TypeScript, and Chart.js.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Hari4120/perf-suite)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Hari4120/perf-suite)

## ✨ Features

### 🎯 Multiple Benchmark Types
- **Latency Testing** - Sequential requests to measure baseline response times
- **Throughput Testing** - Concurrent requests to measure maximum capacity
- **Load Testing** - Realistic load simulation for normal operating conditions
- **Stress Testing** - Push APIs to their limits to identify breaking points

### 📊 Advanced Analytics
- **Real-time Charts** - Live performance monitoring during tests
- **Statistical Analysis** - Min, max, average, median, 95th/99th percentiles
- **Distribution Histograms** - Visualize response time patterns
- **Comparison Views** - Compare multiple benchmark results
- **Performance Trends** - Track changes over time

### 🛠️ Professional Features
- **Dark/Light Mode** - Seamless theme switching
- **Export Functionality** - Download results as JSON
- **Data Persistence** - Local storage for session continuity
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **TypeScript** - Full type safety and excellent DX
- **Modern UI** - Clean, professional interface

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Hari4120/perf-suite.git
cd perf-suite
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 4. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000) to start benchmarking!

## 📖 Usage Guide

### Basic Latency Test
1. Enter your API endpoint URL
2. Select "Latency Test" as the benchmark type
3. Configure the number of runs (1-100)
4. Set timeout value (default: 10 seconds)
5. Click "Run Benchmark"

### Advanced Load Testing
1. Choose "Load Test" or "Stress Test"
2. Configure concurrent requests (1-100)
3. Set test duration (5-300 seconds)
4. Adjust timeout as needed
5. Monitor real-time results

### Analyzing Results
- **Statistics Cards** - View key metrics at a glance
- **Response Time Trend** - Line chart showing per-request latency
- **Distribution Histogram** - See response time patterns
- **Comparison Chart** - Compare multiple test results
- **Results History** - Review past benchmarks

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React
- **Theme**: next-themes
- **Language**: TypeScript

### Project Structure
```
perf-bench-suite/
├── src/
│   ├── app/
│   │   ├── api/benchmark/route.ts    # Serverless API endpoint
│   │   ├── globals.css               # Global styles & theme variables
│   │   ├── layout.tsx                # Root layout with theme provider
│   │   └── page.tsx                  # Main dashboard
│   ├── components/
│   │   ├── charts/                   # Chart components
│   │   │   ├── LatencyChart.tsx
│   │   │   ├── HistogramChart.tsx
│   │   │   ├── ComparisonChart.tsx
│   │   │   └── RealTimeChart.tsx
│   │   ├── ui/                       # UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Input.tsx
│   │   ├── ThemeToggle.tsx           # Dark/light mode toggle
│   │   └── theme-provider.tsx        # Theme context provider
│   ├── lib/
│   │   └── utils.ts                  # Utility functions
│   └── types/
│       └── benchmark.ts              # TypeScript definitions
├── package.json
└── README.md
```

## 🎨 Customization

### Adding New Chart Types
1. Create a new component in `src/components/charts/`
2. Import Chart.js modules as needed
3. Add responsive design and theme support
4. Export and use in dashboard

### Custom Benchmark Types
1. Extend the `BenchmarkType` type in `src/types/benchmark.ts`
2. Add logic to the API route in `src/app/api/benchmark/route.ts`
3. Update the UI to include the new option

### Theming
Customize the design system by modifying CSS variables in `src/app/globals.css`:
- Colors: Primary, secondary, accent, destructive
- Spacing: Radius, borders, shadows
- Typography: Font families, sizes

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Deploy with zero configuration

### Netlify
1. Push your code to GitHub
2. Connect repository in [Netlify](https://app.netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `out` (for static export)

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📊 Benchmark Types Explained

### Latency Testing
Measures response times with sequential requests to understand baseline performance. Ideal for:
- API health checks
- SLA validation
- Performance regression testing

### Throughput Testing
Tests concurrent request handling to measure maximum capacity. Perfect for:
- Scalability assessment
- Resource utilization analysis
- Performance optimization

### Load Testing
Simulates realistic traffic patterns for normal operating conditions. Great for:
- Production readiness validation
- Capacity planning
- Performance monitoring

### Stress Testing
Pushes APIs beyond normal capacity to identify breaking points. Essential for:
- Failure mode analysis
- System resilience testing
- Infrastructure limits discovery

## 🔧 Configuration Options

### Request Configuration
- **URL**: Target endpoint for benchmarking
- **Timeout**: Maximum wait time per request (1-60 seconds)
- **Runs**: Number of sequential requests (latency tests only)
- **Concurrency**: Parallel request count (load/stress tests)
- **Duration**: Test duration in seconds (load/stress tests)

### Output Metrics
- **Min/Max/Average**: Basic response time statistics
- **Median**: Middle value for better central tendency
- **95th/99th Percentile**: Understanding tail latency
- **Failed Requests**: Error rate monitoring
- **Request Count**: Total successful requests

## 🐛 Troubleshooting

### Common Issues

**CORS Errors**
- Ensure your API supports CORS or test localhost endpoints
- Use browser dev tools to check for CORS headers

**High Response Times**
- Check network connectivity
- Verify API server performance
- Consider geographic latency

**Failed Requests**
- Increase timeout values
- Check API authentication requirements
- Verify endpoint URL format

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Chart.js](https://www.chartjs.org/) - Simple yet flexible JavaScript charting
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful & consistent icons

---

<div align="center">

**[🚀 Deploy Now](https://vercel.com/new/clone?repository-url=https://github.com/Hari4120/perf-suite)** | **[📖 Documentation](https://github.com/Hari4120/perf-suite/wiki)** | **[🐛 Report Bug](https://github.com/Hari4120/perf-suite/issues)**

Made with ❤️ for developers who care about performance

</div>
