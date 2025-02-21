import { db } from '@/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { eventType, url, secret } = await req.json()

    if (!eventType || !url || !secret) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const webhook = await db.webhook.create({
      data: { eventType, url, secret },
    })

    return NextResponse.json({ webhook, ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Something went wrong', ok: false }, { status: 500 })
  }
}
