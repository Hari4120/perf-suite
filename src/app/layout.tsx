import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Performance Benchmark Suite | Professional Network Diagnostics & API Testing",
  description: "Comprehensive performance testing platform with real-time monitoring, advanced analytics, and professional reporting. Test API latency, throughput, network quality, and generate detailed insights.",
  keywords: [
    "performance testing",
    "API benchmarking", 
    "network diagnostics",
    "latency testing",
    "throughput analysis",
    "real-time monitoring",
    "performance analytics",
    "speed test",
    "DNS testing",
    "buffer bloat"
  ],
  authors: [{ name: "Performance Suite Team" }],
  creator: "Performance Benchmark Suite",
  publisher: "Performance Suite",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://perf-suite.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Performance Benchmark Suite',
    description: 'Professional network diagnostics and API performance testing platform',
    siteName: 'Performance Benchmark Suite',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Performance Benchmark Suite - Professional Testing Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Performance Benchmark Suite',
    description: 'Professional network diagnostics and API performance testing platform',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
