import { NextResponse } from 'next/server'

// Real upload speed testing endpoint
export async function POST(req: Request) {
  try {
    const startTime = Date.now()

    // Read the uploaded data
    const formData = await req.formData()
    const file = formData.get('data') as Blob

    if (!file) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 })
    }

    // Get the size
    const size = file.size
    const duration = Date.now() - startTime

    // Calculate upload speed in Mbps
    const sizeMB = size / (1024 * 1024)
    const durationSeconds = duration / 1000
    const uploadSpeedMbps = (sizeMB * 8) / durationSeconds

    return NextResponse.json({
      success: true,
      size,
      duration,
      uploadSpeed: uploadSpeedMbps,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Upload test error:', error)
    return NextResponse.json(
      { error: 'Upload test failed' },
      { status: 500 }
    )
  }
}

// Simple GET to verify endpoint is working
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    endpoint: 'upload-test',
    message: 'POST data to test upload speed'
  })
}
