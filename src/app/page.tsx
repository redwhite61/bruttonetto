'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calculator, Euro, Info } from 'lucide-react'
import { AppConfig, defaultAppConfig } from '@/lib/default-config'

interface CalculationResult {
  grossSalary: number
  incomeTax: number
  churchTax: number
  solidarityTax: number
  socialInsurance: {
    pension: number
    health: number
    care: number
    unemployment: number
    total: number
  }
  netSalary: number
  totalDeductions: number
  hourly: {
    gross: number
    net: number
    weeklyHours: number
  }
  yearly: {
    grossSalary: number
    incomeTax: number
    churchTax: number
    solidarityTax: number
    socialInsurance: {
      pension: number
      health: number
      care: number
      unemployment: number
      total: number
    }
    netSalary: number
    totalDeductions: number
  }
}

export default function BruttoNettoRechner() {
  const [appConfig, setAppConfig] = useState<AppConfig>(defaultAppConfig)
  const [configError, setConfigError] = useState<string | null>(null)
  const [configLoading, setConfigLoading] = useState(true)

  const [formData, setFormData] = useState({
    bruttoGehalt: '',
    bundesland: '',
    steuerklasse: '1',
    kirchensteuerpflicht: false,
    kinderfreibetrag: 0,
    krankenversicherung: true,
    rentenversicherung: true,
    arbeitslosenversicherung: true,
    pflegeversicherung: true,
    wochenstunden: 40
  })

  const [result, setResult] = useState<CalculationResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setConfigLoading(true)
        const response = await fetch('/api/config')
        if (!response.ok) {
          throw new Error('Konfiguration konnte nicht geladen werden')
        }
        const data = await response.json()
        if (data?.config) {
          setAppConfig(data.config as AppConfig)
          setConfigError(null)
        }
      } catch (error) {
        console.error('Konfigurations-Load-Fehler', error)
        setConfigError('Konfiguration konnte nicht geladen werden. Varsayılan değerler kullanılıyor.')
      } finally {
        setConfigLoading(false)
      }
    }

    loadConfig()
  }, [])

  const formatRate = (value: number) =>
    `${value.toLocaleString('de-DE', {
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 3,
    })} %`

  const socialInsurance = appConfig.socialInsurance
  const formatCurrency = (value: number) =>
    value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
  const shareOfGross = (amount: number, gross: number) => {
    if (gross <= 0) {
      return 0
    }

    return Math.min(100, Math.max(0, (amount / gross) * 100))
  }

  const buildBreakdownRows = (calculation: CalculationResult) => {
    const rows: Array<{ key: string; label: string; amount: number; color: string }> = [
      {
        key: 'netto',
        label: 'Nettoeinkommen',
        amount: calculation.netSalary,
        color: 'bg-emerald-500',
      },
      {
        key: 'incomeTax',
        label: 'Lohnsteuer',
        amount: calculation.incomeTax,
        color: 'bg-sky-500',
      },
      {
        key: 'pension',
        label: 'Rentenversicherung',
        amount: calculation.socialInsurance.pension,
        color: 'bg-indigo-400',
      },
      {
        key: 'health',
        label: 'Krankenversicherung',
        amount: calculation.socialInsurance.health,
        color: 'bg-purple-400',
      },
      {
        key: 'care',
        label: 'Pflegeversicherung',
        amount: calculation.socialInsurance.care,
        color: 'bg-amber-400',
      },
      {
        key: 'unemployment',
        label: 'Arbeitslosenversicherung',
        amount: calculation.socialInsurance.unemployment,
        color: 'bg-rose-400',
      },
    ]

    if (calculation.churchTax > 0) {
      rows.splice(3, 0, {
        key: 'churchTax',
        label: 'Kirchensteuer',
        amount: calculation.churchTax,
        color: 'bg-cyan-400',
      })
    }

    if (calculation.solidarityTax > 0) {
      rows.splice(4, 0, {
        key: 'solidarityTax',
        label: 'Solidaritätszuschlag',
        amount: calculation.solidarityTax,
        color: 'bg-teal-400',
      })
    }

    rows.push({
      key: 'totalDeductions',
      label: 'Gesamtabzüge',
      amount: calculation.totalDeductions,
      color: 'bg-orange-400',
    })

    return rows
  }

  const breakdownRows = result ? buildBreakdownRows(result) : []
  const netShare = result ? shareOfGross(result.netSalary, result.grossSalary) : 0
  const donutStyle = {
    background: `conic-gradient(#34d399 ${netShare}%, rgba(255,255,255,0.08) ${netShare}% 100%)`,
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateNetto = async () => {
    if (!formData.bruttoGehalt || !formData.bundesland) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const calculationResult = await response.json()
        setResult(calculationResult)
      }
    } catch (error) {
      console.error('Calculation error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="p-2.5 bg-[#0071C5] rounded-lg">
              <Calculator className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Brutto-Netto Rechner</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">🇩🇪 Deutschland 2025 – Aktuelle Brutto-Netto-Berechnung</p>
          <p className="text-gray-500 mt-1">Präzise Gehaltsberechnung mit aktuellen Steuersätzen</p>
          {configError && (
            <p className="mt-3 text-sm text-red-500">{configError}</p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Input Card */}
          <Card className="shadow-sm border border-gray-200 bg-white">
            <CardHeader className="bg-[rgb(0,13,197)] text-white rounded-t-lg px-5 py-3 -mt-6 mx-0">
              <CardTitle className="flex items-center gap-2 font-semibold">
                <Euro className="h-5 w-5" />
                Gehaltsdaten
              </CardTitle>
              <CardDescription className="text-white/90 italic">
                Geben Sie Ihre Bruttogehalt und persönlichen Daten ein
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="brutto" className="text-gray-700">Bruttogehalt (monatlich)</Label>
                <div className="relative">
                  <Input
                    id="brutto"
                    type="number"
                    placeholder="z.B. 4000"
                    value={formData.bruttoGehalt}
                    onChange={(e) => handleInputChange('bruttoGehalt', e.target.value)}
                    className="pl-10 border-gray-300 focus:border-[#0071C5] focus:ring-[#0071C5]"
                  />
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bundesland" className="text-gray-700">Bundesland</Label>
                <Select value={formData.bundesland} onValueChange={(value) => handleInputChange('bundesland', value)}>
                  <SelectTrigger
                    className="border-gray-300 focus:border-[#0071C5] focus:ring-[#0071C5]"
                    disabled={configLoading || appConfig.states.length === 0}
                  >
                    <SelectValue placeholder={configLoading ? 'Laden...' : 'Bundesland wählen'} />
                  </SelectTrigger>
                  <SelectContent>
                    {appConfig.states.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="steuerklasse" className="text-gray-700">Steuerklasse</Label>
                <Select value={formData.steuerklasse} onValueChange={(value) => handleInputChange('steuerklasse', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-[#0071C5] focus:ring-[#0071C5]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {appConfig.taxClasses.map((klasse) => {
                      const details: string[] = [klasse.description]
                      if (klasse.allowanceAmount) {
                        details.push(
                          `Zusatzfreibetrag ${klasse.allowanceAmount.toLocaleString('de-DE', {
                            style: 'currency',
                            currency: 'EUR',
                          })}`,
                        )
                      }
                      if (klasse.extraDeductionPercent) {
                        details.push(`Extra-Abzug ${klasse.extraDeductionPercent.toLocaleString('de-DE')} %`)
                      }

                      return (
                        <SelectItem key={klasse.value} value={klasse.value}>
                          <div className="flex flex-col">
                            <span>{klasse.label}</span>
                            <span className="text-xs text-gray-500">{details.join(' • ')}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kinder" className="text-gray-700">Kinderfreibetrag</Label>
                  <Input
                    id="kinder"
                    type="number"
                    min="0"
                    value={formData.kinderfreibetrag}
                    onChange={(e) => handleInputChange('kinderfreibetrag', parseInt(e.target.value) || 0)}
                    className="border-gray-300 focus:border-[#0071C5] focus:ring-[#0071C5]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wochenstunden" className="text-gray-700">Wochenstunden</Label>
                  <Input
                    id="wochenstunden"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.wochenstunden}
                    onChange={(e) => handleInputChange('wochenstunden', parseInt(e.target.value) || 40)}
                    className="border-gray-300 focus:border-[#0071C5] focus:ring-[#0071C5]"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-gray-700">Sozialversicherungen</Label>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="kirchensteuer"
                      checked={formData.kirchensteuerpflicht}
                      onCheckedChange={(checked) => handleInputChange('kirchensteuerpflicht', checked)}
                      className="border-gray-400"
                    />
                    <Label htmlFor="kirchensteuer" className="text-gray-700 cursor-pointer">Kirchensteuerpflicht</Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="krankenversicherung"
                      checked={formData.krankenversicherung}
                      onCheckedChange={(checked) => handleInputChange('krankenversicherung', checked)}
                      className="border-gray-400"
                    />
                    <Label htmlFor="krankenversicherung" className="text-gray-700 cursor-pointer">
                      {`${socialInsurance.health.label} (${formatRate(socialInsurance.health.employeeRate)})`}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="rentenversicherung"
                      checked={formData.rentenversicherung}
                      onCheckedChange={(checked) => handleInputChange('rentenversicherung', checked)}
                      className="border-gray-400"
                    />
                    <Label htmlFor="rentenversicherung" className="text-gray-700 cursor-pointer">
                      {`${socialInsurance.pension.label} (${formatRate(socialInsurance.pension.employeeRate)})`}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="arbeitslosenversicherung"
                      checked={formData.arbeitslosenversicherung}
                      onCheckedChange={(checked) => handleInputChange('arbeitslosenversicherung', checked)}
                      className="border-gray-400"
                    />
                    <Label htmlFor="arbeitslosenversicherung" className="text-gray-700 cursor-pointer">
                      {`${socialInsurance.unemployment.label} (${formatRate(socialInsurance.unemployment.employeeRate)})`}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="pflegeversicherung"
                      checked={formData.pflegeversicherung}
                      onCheckedChange={(checked) => handleInputChange('pflegeversicherung', checked)}
                      className="border-gray-400"
                    />
                    <Label htmlFor="pflegeversicherung" className="text-gray-700 cursor-pointer">
                      {`${socialInsurance.care.label} (${formatRate(socialInsurance.care.employeeRate)})`}
                    </Label>
                  </div>
                </div>
              </div>

              <Button
                onClick={calculateNetto}
                className="w-full bg-[#0071C5] hover:bg-[#005a9e] text-white shadow-sm"
                disabled={loading || !formData.bruttoGehalt || !formData.bundesland}
              >
                <Calculator className="mr-2 h-4 w-4" />
                {loading ? 'Berechne...' : 'Netto berechnen'}
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="shadow-sm border border-gray-200 bg-white">
            <CardHeader className="bg-gray-800 text-white rounded-t-lg px-5 py-3 -mt-6 mx-0">
              <CardTitle className="flex items-center gap-2 font-semibold">
                <Info className="h-5 w-5" />
                Berechnungsergebnis
              </CardTitle>
              <CardDescription className="text-gray-300 italic">
                Ihre detaillierte Gehaltsaufschlüsselung
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {result ? (
                <div className="rounded-b-lg bg-[#0f172a]">
                  <div className="p-6 space-y-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-6">
                        <div className="relative h-28 w-28 shrink-0">
                          <div className="absolute inset-0 rounded-full" style={donutStyle} />
                          <div className="absolute inset-0 rounded-full border border-white/10" />
                          <div className="absolute inset-[0.65rem] flex flex-col items-center justify-center rounded-full bg-[#0f172a] text-center">
                            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/50">Netto</span>
                            <span className="mt-1 text-lg font-semibold text-white">{netShare.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Bruttoeinkommen</p>
                          <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(result.grossSalary)}</p>
                          <p className="mt-1 text-sm text-white/60">monatlich</p>
                        </div>
                      </div>
                      <div className="grid w-full max-w-xs gap-4 sm:text-right">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Nettogehalt</p>
                          <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(result.netSalary)}</p>
                          <p className="text-xs text-white/50">monatlich</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Gesamtabzüge</p>
                          <p className="mt-2 text-xl font-semibold text-white">-{formatCurrency(result.totalDeductions)}</p>
                          <p className="text-xs text-white/50">Effektive Belastung {((result.totalDeductions / result.grossSalary) * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {breakdownRows.map((row) => {
                        const share = shareOfGross(Math.abs(row.amount), result.grossSalary)
                        const isNet = row.key === 'netto'
                        const amountLabel = isNet
                          ? formatCurrency(row.amount)
                          : `-${formatCurrency(row.amount)}`

                        return (
                          <div key={row.key} className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-white">
                              <span className="font-medium">{row.label}</span>
                              <span className="font-semibold">{amountLabel}</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                              <div
                                className={`h-full rounded-full ${row.color}`}
                                style={{ width: `${share}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Jährlich</p>
                        <div className="mt-3 space-y-2 text-sm text-white/80">
                          <div className="flex items-center justify-between">
                            <span>Netto</span>
                            <span className="font-semibold text-white">{formatCurrency(result.yearly.netSalary)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Brutto</span>
                            <span className="font-semibold text-white">{formatCurrency(result.yearly.grossSalary)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Abzüge</span>
                            <span className="font-semibold text-white">-{formatCurrency(result.yearly.totalDeductions)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Stundenlohn</p>
                        <div className="mt-3 space-y-2 text-sm text-white/80">
                          <div className="flex items-center justify-between">
                            <span>Netto</span>
                            <span className="font-semibold text-white">{formatCurrency(result.hourly.net)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Brutto</span>
                            <span className="font-semibold text-white">{formatCurrency(result.hourly.gross)}</span>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-white/50 sm:text-right">{result.hourly.weeklyHours}h/Woche</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-gray-500">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <Calculator className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Geben Sie Ihre Gehaltsdaten ein</p>
                  <p className="mt-2 text-sm text-gray-500">und klicken Sie auf "Netto berechnen"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-8 shadow-sm border border-gray-200 bg-white">
          <CardHeader className="bg-[#0071C5] text-white rounded-t-lg px-5 py-3 -mt-6 mx-0">
            <CardTitle className="flex items-center gap-2 font-semibold">
              <span>📊</span>
              Steuerinformationen 2025
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8 text-sm">
              {appConfig.infoSections.map((section) => (
                <div key={section.id} className="bg-white p-5 rounded-lg border border-gray-200">
                  <h4 className="text-gray-900 mb-3 pb-2 border-b border-gray-200">{section.title}</h4>
                  <ul className="space-y-2 text-gray-700">
                    {section.items.map((item, index) => (
                      <li key={`${section.id}-${index}`} className="flex items-start gap-2">
                        <span className="text-gray-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}