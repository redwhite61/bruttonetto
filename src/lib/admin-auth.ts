import { NextRequest } from 'next/server'
import { createHash, timingSafeEqual } from 'crypto'

export const ADMIN_SESSION_COOKIE = 'admin-session'

export function getConfiguredAdminPin(): string | null {
  const pin = process.env.ADMIN_ACCESS_PIN
  if (!pin || pin.trim().length === 0) {
    return null
  }
  return pin.trim()
}

export function getAdminSessionValue(): string | null {
  const pin = getConfiguredAdminPin()
  if (!pin) {
    return null
  }
  return createHash('sha256').update(pin).digest('hex')
}

export function isAdminRequestAuthorized(request: NextRequest): boolean {
  const expectedValue = getAdminSessionValue()
  if (!expectedValue) {
    return false
  }

  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!cookieValue) {
    return false
  }

  const expectedBuffer = Buffer.from(expectedValue, 'utf8')
  const receivedBuffer = Buffer.from(cookieValue, 'utf8')

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false
  }

  try {
    return timingSafeEqual(expectedBuffer, receivedBuffer)
  } catch (error) {
    console.error('Admin auth comparison error', error)
    return false
  }
}
