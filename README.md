# 🚀 Performance Benchmark Suite v2.0

A **professional-grade, enterprise-ready** API performance benchmarking and network diagnostics platform built with cutting-edge technologies for 2025.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Hari4120/perf-suite)
[![CI/CD Pipeline](https://github.com/Hari4120/perf-suite/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/Hari4120/perf-suite/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ What's New in v2.0

### 🏗️ Enterprise Architecture
- **PostgreSQL + Prisma ORM** - Production-ready database with type-safe queries
- **NextAuth.js v5** - Modern authentication ready for multi-user support
- **API Rate Limiting** - Built-in protection with configurable limits
- **Zod Validation** - Runtime type checking and input validation
- **Docker Support** - Containerized deployment with docker-compose

### 🔒 Security First
- Rate limiting middleware (configurable per endpoint)
- Input validation with detailed error messages
- Security headers (CSP, X-Frame-Options, CORS)
- Environment-based configuration
- HTTPS-ready with secure defaults

### 🧪 Quality Assurance
- **Jest** - Unit testing with React Testing Library
- **Playwright** - E2E testing across all major browsers
- **CI/CD Pipeline** - Automated testing and deployment via GitHub Actions
- **Code Coverage** - Automated coverage reporting

### 📊 Advanced Features
- Real-time WebSocket support (ready for streaming)
- Advanced data visualization with Recharts
- State management with Zustand
- React Query for efficient data fetching
- PWA capabilities with offline support

---

## 🎯 Features Overview

### 📈 Comprehensive Benchmarking
- **Latency Testing** - Sequential requests for baseline performance
- **Throughput Testing** - Concurrent load capacity measurement
- **Load Testing** - Realistic traffic simulation
- **Stress Testing** - Breaking point identification

### 🌐 Network Diagnostics
- **Internet Speed Test** - Download/upload speed measurement
- **Buffer Bloat Detection** - Network buffering analysis
- **DNS Resolution Testing** - Domain lookup performance
- **Network Quality Score** - Comprehensive connection assessment

### 🤖 Intelligent Analysis
- **AI-Powered Recommendations** - Smart optimization suggestions
- **Anomaly Detection** - Automatic performance issue identification
- **Performance Trends** - Historical analysis and comparison
- **Real-time Monitoring** - Live performance tracking

### 💎 Professional UI/UX
- **Dark/Light Mode** - Seamless theme switching
- **Responsive Design** - Perfect on all devices
- **Smooth Animations** - Framer Motion powered
- **Accessibility** - WCAG 2.1 AA compliant
- **Interactive Charts** - Real-time data visualization

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.18.0 or higher
- PostgreSQL 14+ (optional, for persistent storage)
- Docker & Docker Compose (optional, for containerized setup)

### 1. Clone & Install

```bash
git clone https://github.com/Hari4120/perf-suite.git
cd perf-suite
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/perf_bench"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup (Optional)

```bash
# Start PostgreSQL with Docker
npm run docker:up

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (optional)
npm run prisma:studio
```

### 4. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start benchmarking!

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Start all services (app + PostgreSQL + Redis)
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Production Build

```bash
# Build production image
docker build -t perf-bench-suite .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  perf-bench-suite
```

---

## 📚 Available Scripts

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run dev:https    # Start with HTTPS (requires setup)
```

### Building & Starting
```bash
npm run build        # Build for production
npm start            # Start production server
npm run typecheck    # TypeScript type checking
```

### Testing
```bash
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:e2e     # Run E2E tests with Playwright
npm run test:e2e:ui  # Run E2E tests with UI
```

### Database (Prisma)
```bash
npm run prisma:generate # Generate Prisma Client
npm run prisma:migrate  # Run database migrations
npm run prisma:studio   # Open Prisma Studio GUI
npm run prisma:push     # Push schema without migrations
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
```

### Docker
```bash
npm run docker:up    # Start Docker services
npm run docker:down  # Stop Docker services
npm run docker:logs  # View container logs
```

---

## 🏗️ Project Structure

```
perf-bench-suite/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline configuration
├── e2e/
│   └── homepage.spec.ts        # E2E tests
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── benchmark/
│   │   │   │   └── route.ts    # Benchmark API with validation
│   │   │   └── network-test/
│   │   │       └── route.ts    # Network testing API
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main dashboard
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── charts/             # Chart components
│   │   ├── ui/                 # UI primitives
│   │   ├── NetworkTests.tsx    # Network testing UI
│   │   ├── AIRecommendations.tsx
│   │   ├── AnomalyDetector.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── utils.ts            # Utility functions
│   │   ├── validation.ts       # Zod schemas
│   │   ├── middleware.ts       # API middleware
│   │   ├── networkTests.ts     # Network test logic
│   │   └── __tests__/          # Unit tests
│   └── types/
│       └── benchmark.ts        # TypeScript types
├── docker-compose.yml          # Docker services config
├── Dockerfile                  # Production Docker image
├── jest.config.js              # Jest configuration
├── playwright.config.ts        # Playwright configuration
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS config
└── package.json                # Dependencies & scripts
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | No | - |
| `NEXTAUTH_URL` | Application URL | No | http://localhost:3000 |
| `NEXTAUTH_SECRET` | Auth secret key | No | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | http://localhost:3000 |
| `API_RATE_LIMIT_WINDOW_MS` | Rate limit window | No | 60000 |
| `API_RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | 100 |

### API Rate Limiting

Customize rate limiting in your API routes:

```typescript
import { rateLimit } from '@/lib/middleware'

// Apply rate limiting
const rateLimitCheck = rateLimit({
  windowMs: 60000,      // 1 minute
  maxRequests: 20       // 20 requests per minute
})(req)
```

### Input Validation

All API inputs are validated using Zod schemas:

```typescript
import { benchmarkConfigSchema } from '@/lib/validation'

const result = benchmarkConfigSchema.safeParse(body)
if (!result.success) {
  // Handle validation errors
}
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run specific test
npx playwright test e2e/homepage.spec.ts
```

---

## 📊 Usage Examples

### Basic Latency Test

1. Enter API endpoint: `https://api.example.com/health`
2. Select "Latency Test"
3. Configure runs (1-100)
4. Click "Run Benchmark"
5. View real-time results and statistics

### Network Speed Test

1. Scroll to "Network & Internet Tests"
2. Click "Internet Speed Test"
3. Wait for automatic testing
4. Review download/upload speeds and latency

### Comparing Performance

1. Run multiple benchmarks on the same endpoint
2. Scroll to "Performance Comparison" chart
3. Analyze trends and identify regressions
4. Export results as JSON for external analysis

---

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Hari4120/perf-suite)

1. Click the deploy button
2. Connect your GitHub repository
3. Configure environment variables
4. Deploy instantly

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Production

```bash
# Build and run with docker-compose
docker-compose up -d

# Scale the application
docker-compose up -d --scale app=3
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Write tests for new functionality
5. Ensure all tests pass: `npm test && npm run test:e2e`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure CI/CD pipeline passes

---

## 📈 Roadmap

### v2.1 (Q1 2025)
- [ ] Real-time WebSocket streaming for live test updates
- [ ] User authentication with GitHub/Google OAuth
- [ ] Team collaboration features
- [ ] Advanced AI performance predictions
- [ ] Custom alert configurations

### v2.2 (Q2 2025)
- [ ] API key management
- [ ] Scheduled benchmark runs
- [ ] Slack/Discord integrations
- [ ] PDF report generation
- [ ] Performance budget alerts

### v3.0 (Q3 2025)
- [ ] Distributed load testing
- [ ] Global CDN performance testing
- [ ] Mobile app (React Native)
- [ ] Advanced ML-powered anomaly detection
- [ ] Multi-region deployment support

---

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

**Database Connection Issues**
```bash
# Check PostgreSQL is running
docker ps

# Restart database
npm run docker:down
npm run docker:up
```

**Test Failures**
```bash
# Update test snapshots
npm test -- -u

# Clear Jest cache
npm test -- --clearCache
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Chart.js](https://www.chartjs.org/) - Simple yet flexible charting
- [Zod](https://zod.dev/) - TypeScript-first schema validation

---

## 📞 Support

- 📧 Email: support@perfbenchsuite.com
- 🐛 Issues: [GitHub Issues](https://github.com/Hari4120/perf-suite/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Hari4120/perf-suite/discussions)
- 📖 Documentation: [Wiki](https://github.com/Hari4120/perf-suite/wiki)

---

<div align="center">

**[🚀 Deploy Now](https://vercel.com/new/clone?repository-url=https://github.com/Hari4120/perf-suite)** | **[📖 Documentation](https://github.com/Hari4120/perf-suite/wiki)** | **[🐛 Report Bug](https://github.com/Hari4120/perf-suite/issues)** | **[💡 Request Feature](https://github.com/Hari4120/perf-suite/issues/new)**

Made with ❤️ by developers who care about performance

**⭐ Star us on GitHub — it helps!**

</div>
