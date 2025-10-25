import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, getAdminSessionValue, getConfiguredAdminPin } from '@/lib/admin-auth'
import { timingSafeEqual } from 'crypto'

export async function POST(request: NextRequest) {
  const configuredPin = getConfiguredAdminPin()

  if (!configuredPin) {
    return NextResponse.json({ error: 'Admin-PIN ist nicht konfiguriert.' }, { status: 500 })
  }

  let providedPin = ''

  try {
    const body = await request.json()
    providedPin = typeof body.pin === 'string' ? body.pin.trim() : ''
  } catch (error) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const expectedBuffer = Buffer.from(configuredPin, 'utf8')
  const providedBuffer = Buffer.from(providedPin, 'utf8')

  if (expectedBuffer.length !== providedBuffer.length) {
    return NextResponse.json({ error: 'PIN ist ungültig.' }, { status: 401 })
  }

  const matches = timingSafeEqual(expectedBuffer, providedBuffer)

  if (!matches) {
    return NextResponse.json({ error: 'PIN ist ungültig.' }, { status: 401 })
  }

  const sessionValue = getAdminSessionValue()

  if (!sessionValue) {
    return NextResponse.json({ error: 'PIN-Session konnte nicht erstellt werden.' }, { status: 500 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: sessionValue,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 Stunden
  })

  return response
}
