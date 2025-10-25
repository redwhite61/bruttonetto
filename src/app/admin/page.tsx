'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
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
  states:
    'Bundesländer mit Kirchensteuersätzen. Fügen Sie neue Bundesländer hinzu oder passen Sie die Sätze an.',
  taxClasses:
    'Bezeichnungen und Beschreibungen der Steuerklassen. Diese Einträge steuern die Dropdown-Auswahl.',
  socialInsurance:
    'Arbeitnehmeranteile der Sozialversicherungen. Bearbeiten Sie Bezeichnungen und Prozentsätze.',
  infoSections:
    'Infokarten der Landingpage. Verwalten Sie Überschriften und Listeninhalte.',
  taxSettings: 'Grundlegende Steuerparameter für die Berechnung.',
}

const TITLE_MAP: Record<ConfigKey, string> = {
  states: 'Bundesländer',
  taxClasses: 'Steuerklassen',
  socialInsurance: 'Sozialversicherungen',
  infoSections: 'Infokarten',
  taxSettings: 'Steuerparameter',
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
        [key]: { success: 'Erfolgreich gespeichert' },
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
      return <p className="text-xs text-slate-500">Es gibt ungespeicherte Änderungen</p>
    }
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Admin-Konfigurationsbereich</h1>
          <p className="text-sm text-slate-600">
            Aktualisieren Sie Steuersätze, Abzüge und Infotexte zentral in diesem Bereich.
          </p>
        </header>

        <Separator />

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Konfiguration wird geladen ...
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            <AccordionItem
              value="states"
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <AccordionTrigger className="bg-white px-5 py-4 text-base font-semibold text-slate-900">
                <div className="text-left">
                  <div>{TITLE_MAP.states}</div>
                  <p className="text-xs font-normal text-slate-500">{CONFIG_DESCRIPTIONS.states}</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-6">
                <div className="space-y-5 pt-4">
                  <div className="space-y-4">
                    {config.states.map((state, index) => (
                      <div
                        key={`${state.value}-${index}`}
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor={`state-label-${index}`}>Angezeigter Name</Label>
                            <Input
                              id={`state-label-${index}`}
                              value={state.label}
                              onChange={(event) => updateStateEntry(index, 'label', event.target.value)}
                              placeholder="z. B. Bayern"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`state-value-${index}`}>Systemschlüssel</Label>
                            <Input
                              id={`state-value-${index}`}
                              value={state.value}
                              onChange={(event) => updateStateEntry(index, 'value', event.target.value)}
                              placeholder="z. B. bayern"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`state-rate-${index}`}>Kirchensteuer (%)</Label>
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
                            <Trash2 className="mr-2 h-4 w-4" /> Löschen
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>{renderStatus('states')}</div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" onClick={addStateEntry}>
                        <Plus className="mr-2 h-4 w-4" /> Bundesland hinzufügen
                      </Button>
                      <Button
                        onClick={() => handleSave('states')}
                        disabled={savingKey === 'states'}
                        className="bg-[#0071C5] hover:bg-[#005a9e]"
                      >
                        {savingKey === 'states' ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird gespeichert ...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Speichern
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="taxClasses"
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <AccordionTrigger className="bg-white px-5 py-4 text-base font-semibold text-slate-900">
                <div className="text-left">
                  <div>{TITLE_MAP.taxClasses}</div>
                  <p className="text-xs font-normal text-slate-500">{CONFIG_DESCRIPTIONS.taxClasses}</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-6">
                <div className="space-y-5 pt-4">
                  <div className="space-y-4">
                    {config.taxClasses.map((taxClass, index) => (
                      <div
                        key={`${taxClass.value}-${index}`}
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor={`taxclass-label-${index}`}>Angezeigter Name</Label>
                            <Input
                              id={`taxclass-label-${index}`}
                              value={taxClass.label}
                              onChange={(event) => updateTaxClassEntry(index, 'label', event.target.value)}
                              placeholder="z. B. Steuerklasse 1"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`taxclass-value-${index}`}>Systemschlüssel</Label>
                            <Input
                              id={`taxclass-value-${index}`}
                              value={taxClass.value}
                              onChange={(event) => updateTaxClassEntry(index, 'value', event.target.value)}
                              placeholder="z. B. 1"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-3">
                            <Label htmlFor={`taxclass-description-${index}`}>Beschreibung</Label>
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
                            <Trash2 className="mr-2 h-4 w-4" /> Löschen
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>{renderStatus('taxClasses')}</div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" onClick={addTaxClassEntry}>
                        <Plus className="mr-2 h-4 w-4" /> Steuerklasse hinzufügen
                      </Button>
                      <Button
                        onClick={() => handleSave('taxClasses')}
                        disabled={savingKey === 'taxClasses'}
                        className="bg-[#0071C5] hover:bg-[#005a9e]"
                      >
                        {savingKey === 'taxClasses' ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird gespeichert ...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Speichern
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="socialInsurance"
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <AccordionTrigger className="bg-white px-5 py-4 text-base font-semibold text-slate-900">
                <div className="text-left">
                  <div>{TITLE_MAP.socialInsurance}</div>
                  <p className="text-xs font-normal text-slate-500">{CONFIG_DESCRIPTIONS.socialInsurance}</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-6">
                <div className="space-y-5 pt-4">
                  <p className="text-sm text-slate-500">
                    Hinweis: Kirchensteuer-Sätze werden im Abschnitt „Bundesländer“ pro Bundesland gepflegt.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(config.socialInsurance).map(([key, insurance]) => (
                      <div key={key} className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="space-y-2">
                          <Label htmlFor={`insurance-label-${key}`}>Bezeichnung</Label>
                          <Input
                            id={`insurance-label-${key}`}
                            value={insurance.label}
                            onChange={(event) =>
                              handleSocialInsuranceChange(
                                key as keyof AppConfig['socialInsurance'],
                                'label',
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`insurance-rate-${key}`}>Arbeitnehmeranteil (%)</Label>
                          <Input
                            id={`insurance-rate-${key}`}
                            type="number"
                            inputMode="decimal"
                            step="0.1"
                            value={insurance.employeeRate}
                            onChange={(event) =>
                              handleSocialInsuranceChange(
                                key as keyof AppConfig['socialInsurance'],
                                'employeeRate',
                                event.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
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
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird gespeichert ...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Speichern
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="infoSections"
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <AccordionTrigger className="bg-white px-5 py-4 text-base font-semibold text-slate-900">
                <div className="text-left">
                  <div>{TITLE_MAP.infoSections}</div>
                  <p className="text-xs font-normal text-slate-500">{CONFIG_DESCRIPTIONS.infoSections}</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-6">
                <div className="space-y-5 pt-4">
                  <div className="space-y-5">
                    {config.infoSections.map((section, sectionIndex) => (
                      <div key={section.id} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`info-title-${section.id}`}>Titel</Label>
                            <Input
                              id={`info-title-${section.id}`}
                              value={section.title}
                              onChange={(event) => updateInfoSection(sectionIndex, { title: event.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`info-id-${section.id}`}>Technischer Schlüssel</Label>
                            <Input
                              id={`info-id-${section.id}`}
                              value={section.id}
                              onChange={(event) => updateInfoSection(sectionIndex, { id: event.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label>Listenpunkte</Label>
                          <div className="space-y-2">
                            {section.items.map((item, itemIndex) => (
                              <div key={`${section.id}-item-${itemIndex}`} className="flex items-start gap-2">
                                <Input
                                  value={item}
                                  onChange={(event) =>
                                    updateInfoSectionItem(sectionIndex, itemIndex, event.target.value)
                                  }
                                  placeholder="Text des Listenpunkts"
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
                          </div>
                          <Button type="button" variant="outline" onClick={() => addInfoSectionItem(sectionIndex)}>
                            <Plus className="mr-2 h-4 w-4" /> Listenpunkt hinzufügen
                          </Button>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => removeInfoSection(sectionIndex)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Karte löschen
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>{renderStatus('infoSections')}</div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" onClick={addInfoSection}>
                        <Plus className="mr-2 h-4 w-4" /> Infokarte hinzufügen
                      </Button>
                      <Button
                        onClick={() => handleSave('infoSections')}
                        disabled={savingKey === 'infoSections'}
                        className="bg-[#0071C5] hover:bg-[#005a9e]"
                      >
                        {savingKey === 'infoSections' ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird gespeichert ...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Speichern
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="taxSettings"
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <AccordionTrigger className="bg-white px-5 py-4 text-base font-semibold text-slate-900">
                <div className="text-left">
                  <div>{TITLE_MAP.taxSettings}</div>
                  <p className="text-xs font-normal text-slate-500">{CONFIG_DESCRIPTIONS.taxSettings}</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-6">
                <div className="space-y-5 pt-4">
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
                      <Label htmlFor="tax-single">Entlastungsbetrag Alleinerziehende (€)</Label>
                      <Input
                        id="tax-single"
                        type="number"
                        inputMode="decimal"
                        value={config.taxSettings.singleParentAllowance}
                        onChange={(event) => handleTaxSettingChange('singleParentAllowance', event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-married">Faktor Verheiratete</Label>
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
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird gespeichert ...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Speichern
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}


        <Card className="border border-dashed border-slate-300 bg-white/70">
          <CardHeader>
            <CardTitle className="text-base">Hinweis zur Datenpflege</CardTitle>
            <CardDescription className="text-xs">
              Nach dem Speichern stehen alle Änderungen sofort über die API zur Verfügung. Schützen Sie diesen Bereich in produktiven Umgebungen mit einer Anmeldung.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 space-y-2">
            <p>
              Alle Felder besitzen Validierungen; tragen Sie Prozentwerte bitte als Zahlen ein. Leere Werte können die Berechnung beeinflussen.
            </p>
            <p>
              Um auf Standardwerte zurückzugehen, löschen Sie die Inhalte im jeweiligen Abschnitt und speichern Sie erneut.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
