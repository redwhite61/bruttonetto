'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calculator, Euro, Info, TrendingUp, Clock, Calendar } from 'lucide-react'
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
          <p className="text-gray-600 max-w-2xl mx-auto">🇩🇪 Almanya 2025 – Güncel Brutto-Netto Hesaplama</p>
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
                    {appConfig.taxClasses.map((klasse) => (
                      <SelectItem key={klasse.value} value={klasse.value}>
                        <div className="flex flex-col">
                          <span>{klasse.label}</span>
                          <span className="text-xs text-gray-500">{klasse.description}</span>
                        </div>
                      </SelectItem>
                    ))}
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
            <CardContent className="pt-6">
              {result ? (
                <div className="space-y-5">
                  {/* Main Result */}
                  <div className="bg-[#0071C5] p-6 rounded-lg text-white">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-white/80">Bruttogehalt (monatlich)</span>
                      <span>{result.grossSalary.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-t border-white/20">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Nettogehalt (monatlich)</span>
                      </div>
                      <span className="text-2xl">{result.netSalary.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                  </div>

                  {/* Yearly & Hourly Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Jährlich (Netto)</span>
                      </div>
                      <div className="text-gray-900">{result.yearly.netSalary.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Stundenlohn (Netto)</span>
                      </div>
                      <div className="text-gray-900">{result.hourly.net.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {result.hourly.weeklyHours}h/Woche
                      </div>
                    </div>
                  </div>

                  {/* Tax Deductions */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200">
                    <h4 className="text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
                      Steuerabzüge (monatlich)
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>Lohnsteuer</span>
                        <span className="text-gray-900">-{result.incomeTax.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                      {result.churchTax > 0 && (
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Kirchensteuer</span>
                          <span className="text-gray-900">-{result.churchTax.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                        </div>
                      )}
                      {result.solidarityTax > 0 && (
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Solidaritätszuschlag</span>
                          <span className="text-gray-900">-{result.solidarityTax.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-gray-900 pt-2 border-t border-gray-200">
                        <span>Jährlich Lohnsteuer</span>
                        <span>-{result.yearly.incomeTax.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Social Insurance */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200">
                    <h4 className="text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
                      Sozialversicherungen (monatlich)
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>Rentenversicherung</span>
                        <span className="text-gray-900">-{result.socialInsurance.pension.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>Krankenversicherung</span>
                        <span className="text-gray-900">-{result.socialInsurance.health.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>Pflegeversicherung</span>
                        <span className="text-gray-900">-{result.socialInsurance.care.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>Arbeitslosenversicherung</span>
                        <span className="text-gray-900">-{result.socialInsurance.unemployment.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-900 pt-2 border-t border-gray-200">
                        <span>Gesamt Sozialabgaben</span>
                        <span>-{result.socialInsurance.total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-900">
                        <span>Jährlich Sozialabgaben</span>
                        <span>-{result.yearly.socialInsurance.total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Summary */}
                  <div className="bg-gray-800 p-5 rounded-lg text-white">
                    <div className="flex justify-between mb-2">
                      <span>Gesamtabzüge (monatlich)</span>
                      <span>-{result.totalDeductions.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between mb-3">
                      <span>Gesamtabzüge (jährlich)</span>
                      <span>-{result.yearly.totalDeductions.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-600">
                      <span>Effektive Steuerbelastung</span>
                      <span className="text-[#FFB800]">{((result.totalDeductions / result.grossSalary) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-16">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calculator className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Geben Sie Ihre Gehaltsdaten ein</p>
                  <p className="text-sm text-gray-500 mt-2">und klicken Sie auf "Netto berechnen"</p>
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