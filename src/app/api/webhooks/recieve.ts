import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const secret = headers().get('x-webhook-secret')
  const body = await req.json()

  if (!secret || secret !== process.env.EXTERNAL_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
  }

  console.log('Webhook received:', body)
  return NextResponse.json({ message: 'Webhook processed', ok: true })
}
