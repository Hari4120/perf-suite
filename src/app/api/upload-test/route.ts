import { NextResponse } from 'next/server'

// Real upload speed testing endpoint
export async function POST(req: Request) {
  try {
    // Read the uploaded data - the client measures the upload time
    const formData = await req.formData()
    const file = formData.get('data') as Blob

    if (!file) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 })
    }

    // Just acknowledge receipt - client handles timing
    return NextResponse.json({
      success: true,
      size: file.size,
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
