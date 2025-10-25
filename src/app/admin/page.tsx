'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  AppConfig,
  AppConfigInfoSection,
  AppConfigState,
  AppConfigTaxClass,
  ConfigKey,
  defaultAppConfig,
} from '@/lib/default-config'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'

interface ConfigPayload {
  config: AppConfig
  entries: Partial<AppConfig>
}

const CONFIG_DESCRIPTIONS: Record<ConfigKey, string> = {
  states: 'Bundesländer ve kilise vergisi oranları. Listeye yeni eyalet ekleyebilir veya oranları güncelleyebilirsiniz.',
  taxClasses: 'Steuerklassen adları ve açıklamaları. Dropdown seçenekleri burada yönetilir.',
  socialInsurance: 'Çalışan payı sosyal sigorta oranları. Etiket ve yüzde değerlerini düzenleyin.',
  infoSections: 'Landing sayfasında görünen bilgi kartları. Başlıkları ve madde içeriklerini yönetin.',
  taxSettings: 'Hesaplama motorunun kullandığı temel vergi parametreleri.',
}

const TITLE_MAP: Record<ConfigKey, string> = {
  states: 'Bundesländer',
  taxClasses: 'Steuerklassen',
  socialInsurance: 'Sozialversicherungen',
  infoSections: 'Bilgi Kartları',
  taxSettings: 'Vergi Parametreleri',
}

type SectionStatus = {
  error?: string
  success?: string
}

export default function AdminConfigPage() {
  const [config, setConfig] = useState<AppConfig>(defaultAppConfig)
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<ConfigKey | null>(null)
  const [dirtyKeys, setDirtyKeys] = useState<ConfigKey[]>([])
  const [status, setStatus] = useState<Record<ConfigKey, SectionStatus>>({
    states: {},
    taxClasses: {},
    socialInsurance: {},
    infoSections: {},
    taxSettings: {},
  })

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/config')
        if (!response.ok) {
          throw new Error('Konfiguration konnte nicht geladen werden')
        }
        const data: ConfigPayload = await response.json()
        const incoming = data.config ?? defaultAppConfig
        setConfig({
          ...defaultAppConfig,
          ...incoming,
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const markDirty = (key: ConfigKey) => {
    setDirtyKeys((prev) => (prev.includes(key) ? prev : [...prev, key]))
    setStatus((prev) => ({
      ...prev,
      [key]: {},
    }))
  }

  const handleSave = async (key: ConfigKey) => {
    try {
      setSavingKey(key)
      setStatus((prev) => ({
        ...prev,
        [key]: {},
      }))

      const payload = config[key]
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

      setDirtyKeys((prev) => prev.filter((dirtyKey) => dirtyKey !== key))
      setStatus((prev) => ({
        ...prev,
        [key]: { success: 'Güncellendi' },
      }))
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        [key]: {
          error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        },
      }))
    } finally {
      setSavingKey(null)
    }
  }

  const updateStateEntry = (index: number, field: keyof AppConfigState, value: string) => {
    setConfig((prev) => {
      const updated = [...prev.states]
      if (field === 'churchTaxRate') {
        updated[index] = {
          ...updated[index],
          churchTaxRate: Number(value),
        }
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value,
        }
      }
      return {
        ...prev,
        states: updated,
      }
    })
    markDirty('states')
  }

  const addStateEntry = () => {
    setConfig((prev) => ({
      ...prev,
      states: [
        ...prev.states,
        { value: '', label: '', churchTaxRate: 0 },
      ],
    }))
    markDirty('states')
  }

  const removeStateEntry = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      states: prev.states.filter((_, idx) => idx !== index),
    }))
    markDirty('states')
  }

  const updateTaxClassEntry = (index: number, field: keyof AppConfigTaxClass, value: string) => {
    setConfig((prev) => {
      const updated = [...prev.taxClasses]
      updated[index] = {
        ...updated[index],
        [field]: value,
      }
      return {
        ...prev,
        taxClasses: updated,
      }
    })
    markDirty('taxClasses')
  }

  const addTaxClassEntry = () => {
    setConfig((prev) => ({
      ...prev,
      taxClasses: [
        ...prev.taxClasses,
        { value: '', label: '', description: '' },
      ],
    }))
    markDirty('taxClasses')
  }

  const removeTaxClassEntry = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      taxClasses: prev.taxClasses.filter((_, idx) => idx !== index),
    }))
    markDirty('taxClasses')
  }

  const updateInfoSection = (index: number, value: Partial<AppConfigInfoSection>) => {
    setConfig((prev) => {
      const updated = [...prev.infoSections]
      updated[index] = {
        ...updated[index],
        ...value,
      }
      return {
        ...prev,
        infoSections: updated,
      }
    })
    markDirty('infoSections')
  }

  const updateInfoSectionItem = (sectionIndex: number, itemIndex: number, value: string) => {
    setConfig((prev) => {
      const updatedSections = [...prev.infoSections]
      const items = [...updatedSections[sectionIndex].items]
      items[itemIndex] = value
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        items,
      }
      return {
        ...prev,
        infoSections: updatedSections,
      }
    })
    markDirty('infoSections')
  }

  const addInfoSectionItem = (sectionIndex: number) => {
    setConfig((prev) => {
      const updatedSections = [...prev.infoSections]
      const items = [...updatedSections[sectionIndex].items, '']
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        items,
      }
      return {
        ...prev,
        infoSections: updatedSections,
      }
    })
    markDirty('infoSections')
  }

  const removeInfoSectionItem = (sectionIndex: number, itemIndex: number) => {
    setConfig((prev) => {
      const updatedSections = [...prev.infoSections]
      const items = updatedSections[sectionIndex].items.filter((_, idx) => idx !== itemIndex)
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        items,
      }
      return {
        ...prev,
        infoSections: updatedSections,
      }
    })
    markDirty('infoSections')
  }

  const addInfoSection = () => {
    setConfig((prev) => ({
      ...prev,
      infoSections: [
        ...prev.infoSections,
        { id: `section-${prev.infoSections.length + 1}`, title: '', items: [''] },
      ],
    }))
    markDirty('infoSections')
  }

  const removeInfoSection = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      infoSections: prev.infoSections.filter((_, idx) => idx !== index),
    }))
    markDirty('infoSections')
  }

  const handleTaxSettingChange = (field: keyof AppConfig['taxSettings'], value: string) => {
    setConfig((prev) => ({
      ...prev,
      taxSettings: {
        ...prev.taxSettings,
        [field]: Number(value),
      },
    }))
    markDirty('taxSettings')
  }

  const handleSocialInsuranceChange = (
    field: keyof AppConfig['socialInsurance'],
    subField: 'label' | 'employeeRate',
    value: string,
  ) => {
    setConfig((prev) => ({
      ...prev,
      socialInsurance: {
        ...prev.socialInsurance,
        [field]: {
          ...prev.socialInsurance[field],
          [subField]: subField === 'employeeRate' ? Number(value) : value,
        },
      },
    }))
    markDirty('socialInsurance')
  }

  const renderStatus = (key: ConfigKey) => {
    const entryStatus = status[key]
    if (entryStatus?.error) {
      return <p className="text-xs text-red-600">{entryStatus.error}</p>
    }
    if (entryStatus?.success) {
      return <p className="text-xs text-emerald-600">{entryStatus.success}</p>
    }
    if (dirtyKeys.includes(key)) {
      return <p className="text-xs text-slate-500">Kaydedilmemiş değişiklikler var</p>
    }
    return null
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
            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="bg-white rounded-t-lg">
                <CardTitle className="text-lg font-semibold text-slate-900">{TITLE_MAP.states}</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {CONFIG_DESCRIPTIONS.states}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                <div className="space-y-4">
                  {config.states.map((state, index) => (
                    <div
                      key={`${state.value}-${index}`}
                      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor={`state-label-${index}`}>Görünen ad</Label>
                          <Input
                            id={`state-label-${index}`}
                            value={state.label}
                            onChange={(event) => updateStateEntry(index, 'label', event.target.value)}
                            placeholder="Örn. Bayern"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`state-value-${index}`}>Sistem anahtarı</Label>
                          <Input
                            id={`state-value-${index}`}
                            value={state.value}
                            onChange={(event) => updateStateEntry(index, 'value', event.target.value)}
                            placeholder="Örn. bayern"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`state-rate-${index}`}>Kilise vergisi (%)</Label>
                          <Input
                            id={`state-rate-${index}`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="0.1"
                            value={state.churchTaxRate}
                            onChange={(event) => updateStateEntry(index, 'churchTaxRate', event.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => removeStateEntry(index)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Sil
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>{renderStatus('states')}</div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={addStateEntry}>
                      <Plus className="mr-2 h-4 w-4" /> Eyalet ekle
                    </Button>
                    <Button
                      onClick={() => handleSave('states')}
                      disabled={savingKey === 'states'}
                      className="bg-[#0071C5] hover:bg-[#005a9e]"
                    >
                      {savingKey === 'states' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Kaydet
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="bg-white rounded-t-lg">
                <CardTitle className="text-lg font-semibold text-slate-900">{TITLE_MAP.taxClasses}</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {CONFIG_DESCRIPTIONS.taxClasses}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                <div className="space-y-4">
                  {config.taxClasses.map((taxClass, index) => (
                    <div
                      key={`${taxClass.value}-${index}`}
                      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor={`taxclass-label-${index}`}>Görünen ad</Label>
                          <Input
                            id={`taxclass-label-${index}`}
                            value={taxClass.label}
                            onChange={(event) => updateTaxClassEntry(index, 'label', event.target.value)}
                            placeholder="Örn. Steuerklasse 1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`taxclass-value-${index}`}>Sistem anahtarı</Label>
                          <Input
                            id={`taxclass-value-${index}`}
                            value={taxClass.value}
                            onChange={(event) => updateTaxClassEntry(index, 'value', event.target.value)}
                            placeholder="Örn. 1"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-3">
                          <Label htmlFor={`taxclass-description-${index}`}>Açıklama</Label>
                          <Textarea
                            id={`taxclass-description-${index}`}
                            value={taxClass.description}
                            onChange={(event) => updateTaxClassEntry(index, 'description', event.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => removeTaxClassEntry(index)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Sil
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>{renderStatus('taxClasses')}</div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={addTaxClassEntry}>
                      <Plus className="mr-2 h-4 w-4" /> Steuerklasse ekle
                    </Button>
                    <Button
                      onClick={() => handleSave('taxClasses')}
                      disabled={savingKey === 'taxClasses'}
                      className="bg-[#0071C5] hover:bg-[#005a9e]"
                    >
                      {savingKey === 'taxClasses' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Kaydet
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="bg-white rounded-t-lg">
                <CardTitle className="text-lg font-semibold text-slate-900">{TITLE_MAP.socialInsurance}</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {CONFIG_DESCRIPTIONS.socialInsurance}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {(Object.keys(config.socialInsurance) as (keyof AppConfig['socialInsurance'])[]).map((key) => {
                    const entry = config.socialInsurance[key]
                    return (
                      <div key={key} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="space-y-2">
                          <Label htmlFor={`social-label-${key}`}>Etiket</Label>
                          <Input
                            id={`social-label-${key}`}
                            value={entry.label}
                            onChange={(event) => handleSocialInsuranceChange(key, 'label', event.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`social-rate-${key}`}>Çalışan payı (%)</Label>
                          <Input
                            id={`social-rate-${key}`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="0.1"
                            value={entry.employeeRate}
                            onChange={(event) => handleSocialInsuranceChange(key, 'employeeRate', event.target.value)}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>{renderStatus('socialInsurance')}</div>
                  <Button
                    onClick={() => handleSave('socialInsurance')}
                    disabled={savingKey === 'socialInsurance'}
                    className="bg-[#0071C5] hover:bg-[#005a9e]"
                  >
                    {savingKey === 'socialInsurance' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Kaydet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="bg-white rounded-t-lg">
                <CardTitle className="text-lg font-semibold text-slate-900">{TITLE_MAP.infoSections}</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {CONFIG_DESCRIPTIONS.infoSections}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                <div className="space-y-4">
                  {config.infoSections.map((section, sectionIndex) => (
                    <div key={`${section.id}-${sectionIndex}`} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`info-title-${sectionIndex}`}>Başlık</Label>
                          <Input
                            id={`info-title-${sectionIndex}`}
                            value={section.title}
                            onChange={(event) => updateInfoSection(sectionIndex, { title: event.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`info-id-${sectionIndex}`}>ID</Label>
                          <Input
                            id={`info-id-${sectionIndex}`}
                            value={section.id}
                            onChange={(event) => updateInfoSection(sectionIndex, { id: event.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Madde listesi</Label>
                        <div className="space-y-3">
                          {section.items.map((item, itemIndex) => (
                            <div key={`${sectionIndex}-${itemIndex}`} className="flex items-start gap-2">
                              <Input
                                value={item}
                                onChange={(event) => updateInfoSectionItem(sectionIndex, itemIndex, event.target.value)}
                                placeholder="Bilgi maddesi"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => removeInfoSectionItem(sectionIndex, itemIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button type="button" variant="outline" onClick={() => addInfoSectionItem(sectionIndex)}>
                            <Plus className="mr-2 h-4 w-4" /> Madde ekle
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => removeInfoSection(sectionIndex)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Kartı sil
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>{renderStatus('infoSections')}</div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={addInfoSection}>
                      <Plus className="mr-2 h-4 w-4" /> Bilgi kartı ekle
                    </Button>
                    <Button
                      onClick={() => handleSave('infoSections')}
                      disabled={savingKey === 'infoSections'}
                      className="bg-[#0071C5] hover:bg-[#005a9e]"
                    >
                      {savingKey === 'infoSections' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Kaydet
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="bg-white rounded-t-lg">
                <CardTitle className="text-lg font-semibold text-slate-900">{TITLE_MAP.taxSettings}</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {CONFIG_DESCRIPTIONS.taxSettings}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="tax-basic">Grundfreibetrag (€)</Label>
                    <Input
                      id="tax-basic"
                      type="number"
                      inputMode="decimal"
                      value={config.taxSettings.basicAllowance}
                      onChange={(event) => handleTaxSettingChange('basicAllowance', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-single">Alleinerziehenden ek muafiyet (€)</Label>
                    <Input
                      id="tax-single"
                      type="number"
                      inputMode="decimal"
                      value={config.taxSettings.singleParentAllowance}
                      onChange={(event) => handleTaxSettingChange('singleParentAllowance', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-married">Eş çarpanı</Label>
                    <Input
                      id="tax-married"
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      value={config.taxSettings.marriedAllowanceMultiplier}
                      onChange={(event) => handleTaxSettingChange('marriedAllowanceMultiplier', event.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>{renderStatus('taxSettings')}</div>
                  <Button
                    onClick={() => handleSave('taxSettings')}
                    disabled={savingKey === 'taxSettings'}
                    className="bg-[#0071C5] hover:bg-[#005a9e]"
                  >
                    {savingKey === 'taxSettings' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Kaydet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border border-dashed border-slate-300 bg-white/70">
          <CardHeader>
            <CardTitle className="text-base">Yapı hakkında kısa not</CardTitle>
            <CardDescription className="text-xs">
              Değişiklikler kaydedildikten sonra API üzerinden anında kullanılabilir. Canlı ortamda bu sayfayı mutlaka kimlik doğrulama ile koruyun.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 space-y-2">
            <p>
              Tüm alanlar sayısal doğrulama ile gelir; lütfen oranları yüzde şeklinde girin. Boş bıraktığınız değerler hesaplamayı etkileyebilir.
            </p>
            <p>
              Varsayılan değerlere dönmek için ilgili karttaki alanları temizleyip kaydedebilirsiniz.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
