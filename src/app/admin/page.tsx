'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { CONFIG_KEYS, ConfigKey, defaultAppConfig } from '@/lib/default-config'
import { Loader2, Save } from 'lucide-react'

interface ConfigPayload {
  config: unknown
  entries: Record<string, unknown>
}

type EntryState = {
  value: string
  error?: string
  updated?: boolean
}

const CONFIG_DESCRIPTIONS: Record<ConfigKey, string> = {
  states: 'Liste der Bundesländer mit Kirchensteuer-Sätzen. Erwartet ein Array von { value, label, churchTaxRate } Objekten.',
  taxClasses: 'Steuerklassen für Auswahl und Infotexte. Array aus { value, label, description } Objekten.',
  socialInsurance: 'Sozialversicherungsbeiträge inkl. Solidaritätszuschlag. Objekt mit Schlüsseln pension, health, care, unemployment, solidarity.',
  infoSections: 'Informationskarten auf der Landingpage. Array aus Sektionen { id, title, items }.',
  taxSettings: 'Grundfreibeträge und Multiplikatoren für die Steuerberechnung. Objekt mit basicAllowance, singleParentAllowance, marriedAllowanceMultiplier.',
}

const TITLE_MAP: Record<ConfigKey, string> = {
  states: 'Bundesländer',
  taxClasses: 'Steuerklassen',
  socialInsurance: 'Sozialversicherungen',
  infoSections: 'Bilgi Kartları',
  taxSettings: 'Vergi Parametreleri',
}

export default function AdminConfigPage() {
  const [entries, setEntries] = useState<Record<ConfigKey, EntryState>>(() => {
    const initialState = {} as Record<ConfigKey, EntryState>
    CONFIG_KEYS.forEach((key) => {
      initialState[key] = {
        value: JSON.stringify(defaultAppConfig[key], null, 2),
      }
    })
    return initialState
  })
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<ConfigKey | null>(null)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/config')
        if (!response.ok) {
          throw new Error('Konfiguration konnte nicht geladen werden')
        }
        const data: ConfigPayload = await response.json()
        CONFIG_KEYS.forEach((key) => {
          const rawEntry = data.entries?.[key] ?? defaultAppConfig[key]
          setEntries((prev) => ({
            ...prev,
            [key]: {
              value: JSON.stringify(rawEntry, null, 2),
            },
          }))
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const handleInputChange = (key: ConfigKey, value: string) => {
    setEntries((prev) => ({
      ...prev,
      [key]: {
        value,
      },
    }))
  }

  const handleSave = async (key: ConfigKey) => {
    try {
      setSavingKey(key)
      const payload = JSON.parse(entries[key].value)
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value: payload }),
      })

      if (!response.ok) {
        throw new Error('Speichern fehlgeschlagen')
      }

      setEntries((prev) => ({
        ...prev,
        [key]: {
          value: prev[key].value,
          updated: true,
        },
      }))
    } catch (error) {
      setEntries((prev) => ({
        ...prev,
        [key]: {
          value: prev[key].value,
          error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        },
      }))
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Admin Konfigürasyon Paneli</h1>
          <p className="text-sm text-slate-600">
            Vergi oranlarını, kesinti yüzdelerini ve bilgi kartı metinlerini bu panelden güncelleyebilirsiniz.
          </p>
        </header>

        <Separator />

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Konfigürasyon yükleniyor...
          </div>
        ) : (
          <div className="grid gap-6">
            {CONFIG_KEYS.map((key) => {
              const entry = entries[key]
              return (
                <Card key={key} className="shadow-sm border border-slate-200">
                  <CardHeader className="bg-white rounded-t-lg">
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      {TITLE_MAP[key]}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      {CONFIG_DESCRIPTIONS[key]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <Textarea
                      className="font-mono text-sm"
                      rows={key === 'infoSections' ? 12 : 10}
                      value={entry.value}
                      onChange={(event) => handleInputChange(key, event.target.value)}
                    />
                    {entry.error ? (
                      <p className="text-xs text-red-600">{entry.error}</p>
                    ) : entry.updated ? (
                      <p className="text-xs text-emerald-600">Güncellendi!</p>
                    ) : null}
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSave(key)}
                        disabled={savingKey === key}
                        className="bg-[#0071C5] hover:bg-[#005a9e]"
                      >
                        {savingKey === key ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Kaydet
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <Card className="border border-dashed border-slate-300 bg-white/70">
          <CardHeader>
            <CardTitle className="text-base">Yapı hakkında kısa not</CardTitle>
            <CardDescription className="text-xs">
              JSON formatı bozulursa varsayılan değerler kullanılmaya devam eder. Boş bırakırsanız panel otomatik olarak başlangıç değerlerini kullanır.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 space-y-2">
            <p>
              Güncellediğiniz veriler anında API üzerinden kullanıma girer. Landing page ve hesaplama servisi bu değerleri okuyarak güncellenir.
            </p>
            <p>
              Henüz kimlik doğrulama eklenmedi; canlı ortamda koruma eklemeyi unutmayın.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
