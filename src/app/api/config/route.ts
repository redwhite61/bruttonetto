import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AppConfig, CONFIG_KEYS, ConfigKey, buildAppConfig, extractConfigEntries } from '@/lib/default-config'
import { isAdminRequestAuthorized } from '@/lib/admin-auth'

function normalizeEntries(entries: { key: string; value: unknown }[]) {
  const record: Record<string, unknown> = {}
  entries.forEach((entry) => {
    record[entry.key] = entry.value
  })
  return record
}

export async function GET(_request: NextRequest) {
  if (!isAdminRequestAuthorized(_request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const entries = await db.config.findMany({
      where: {
        key: {
          in: CONFIG_KEYS as unknown as string[],
        },
      },
      orderBy: {
        key: 'asc',
      },
    })

    const entryMap = normalizeEntries(entries)
    const config: AppConfig = buildAppConfig(entryMap)

    return NextResponse.json({
      config,
      entries: extractConfigEntries(entryMap),
    })
  } catch (error) {
    console.error('Config GET error', error)
    return NextResponse.json({ error: 'Unable to load configuration' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const payload = await request.json()
    const { key, value } = payload as { key?: string; value?: unknown }

    if (!key || (CONFIG_KEYS as readonly string[]).indexOf(key) === -1) {
      return NextResponse.json({ error: 'Invalid configuration key' }, { status: 400 })
    }

    const configKey = key as ConfigKey

    await db.config.upsert({
      where: { key: configKey },
      update: { value },
      create: { key: configKey, value },
    })

    return NextResponse.json({ key: configKey, value })
  } catch (error) {
    console.error('Config PUT error', error)
    return NextResponse.json({ error: 'Unable to update configuration' }, { status: 500 })
  }
}
