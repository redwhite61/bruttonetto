'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calculator, Euro, Info, TrendingUp, Clock, Calendar } from 'lucide-react'

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

const BUNDESLAENDER = [
  { value: 'baden-wuerttemberg', label: 'Baden-Württemberg', churchTaxRate: 8 },
  { value: 'bayern', label: 'Bayern', churchTaxRate: 8 },
  { value: 'berlin', label: 'Berlin', churchTaxRate: 9 },
  { value: 'brandenburg', label: 'Brandenburg', churchTaxRate: 9 },
  { value: 'bremen', label: 'Bremen', churchTaxRate: 9 },
  { value: 'hamburg', label: 'Hamburg', churchTaxRate: 9 },
  { value: 'hessen', label: 'Hessen', churchTaxRate: 9 },
  { value: 'mecklenburg-vorpommern', label: 'Mecklenburg-Vorpommern', churchTaxRate: 9 },
  { value: 'niedersachsen', label: 'Niedersachsen', churchTaxRate: 9 },
  { value: 'nordrhein-westfalen', label: 'Nordrhein-Westfalen', churchTaxRate: 9 },
  { value: 'rheinland-pfalz', label: 'Rheinland-Pfalz', churchTaxRate: 9 },
  { value: 'saarland', label: 'Saarland', churchTaxRate: 9 },
  { value: 'sachsen', label: 'Sachsen', churchTaxRate: 9 },
  { value: 'sachsen-anhalt', label: 'Sachsen-Anhalt', churchTaxRate: 9 },
  { value: 'schleswig-holstein', label: 'Schleswig-Holstein', churchTaxRate: 9 },
  { value: 'thueringen', label: 'Thüringen', churchTaxRate: 9 }
]

const STEUERKLASSEN = [
  { value: '1', label: 'Steuerklasse 1 - Ledig/verwitwet' },
  { value: '2', label: 'Steuerklasse 2 - Alleinerziehend' },
  { value: '3', label: 'Steuerklasse 3 - Verheiratet (höheres Einkommen)' },
  { value: '4', label: 'Steuerklasse 4 - Verheiratet (gleiches Einkommen)' },
  { value: '5', label: 'Steuerklasse 5 - Verheiratet (niedrigeres Einkommen)' },
  { value: '6', label: 'Steuerklasse 6 - Zweitjob' }
]

export default function BruttoNettoRechner() {
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
                  <SelectTrigger className="border-gray-300 focus:border-[#0071C5] focus:ring-[#0071C5]">
                    <SelectValue placeholder="Bundesland wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUNDESLAENDER.map((state) => (
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
                    {STEUERKLASSEN.map((klasse) => (
                      <SelectItem key={klasse.value} value={klasse.value}>
                        {klasse.label}
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
                    <Label htmlFor="krankenversicherung" className="text-gray-700 cursor-pointer">Krankenversicherung (8,55%)</Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="rentenversicherung"
                      checked={formData.rentenversicherung}
                      onCheckedChange={(checked) => handleInputChange('rentenversicherung', checked)}
                      className="border-gray-400"
                    />
                    <Label htmlFor="rentenversicherung" className="text-gray-700 cursor-pointer">Rentenversicherung</Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="arbeitslosenversicherung"
                      checked={formData.arbeitslosenversicherung}
                      onCheckedChange={(checked) => handleInputChange('arbeitslosenversicherung', checked)}
                      className="border-gray-400"
                    />
                    <Label htmlFor="arbeitslosenversicherung" className="text-gray-700 cursor-pointer">Arbeitslosenversicherung</Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="pflegeversicherung"
                      checked={formData.pflegeversicherung}
                      onCheckedChange={(checked) => handleInputChange('pflegeversicherung', checked)}
                      className="border-gray-400"
                    />
                    <Label htmlFor="pflegeversicherung" className="text-gray-700 cursor-pointer">Pflegeversicherung (1,875%)</Label>
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
          <CardHeader className="bg-gray-100 border-b border-gray-200">
            <CardTitle className="text-gray-900 font-semibold not-italic">📊 Steuerinformationen 2025</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8 text-sm">
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <h4 className="text-gray-900 mb-3 pb-2 border-b border-gray-200">Vergünstigungen (Steuerklassen)</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-1">•</span>
                    <span>Klasse 1: Grundfreibetrag €11.604/Jahr</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-1">•</span>
                    <span>Klasse 2: Zusätzliche Entlastung €1.308/Jahr</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-1">•</span>
                    <span>Klasse 3: Doppelter Grundfreibetrag für Verheiratete</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-1">•</span>
                    <span>Klasse 4: Einzelveranlagung für Verheiratete</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <h4 className="text-gray-900 mb-3 pb-2 border-b border-gray-200">Sozialversicherungsraten 2025</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-1">•</span>
                    <span>Rentenversicherung: 18,6% (9,3% Arbeitnehmer)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-1">•</span>
                    <span>Krankenversicherung: 8,55% Arbeitnehmeranteil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-1">•</span>
                    <span>Pflegeversicherung: 1,875% (kinderlos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-1">•</span>
                    <span>Arbeitslosenversicherung: 2,6% (1,3% Arbeitnehmer)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-1">•</span>
                    <span>Solidaritätszuschlag: 0% (aufgehoben)</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}