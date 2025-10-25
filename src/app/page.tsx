'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calculator, Euro, Info } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Brutto-Netto Rechner</h1>
          </div>
          <p className="text-gray-600">🇩🇪 Almanya 2025 – Güncel Brutto-Netto Hesaplama</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Gehaltsdaten
              </CardTitle>
              <CardDescription>
                Geben Sie Ihre Bruttogehalt und persönlichen Daten ein
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="brutto">Bruttogehalt (monatlich)</Label>
                <Input
                  id="brutto"
                  type="number"
                  placeholder="z.B. 4000"
                  value={formData.bruttoGehalt}
                  onChange={(e) => handleInputChange('bruttoGehalt', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="bundesland">Bundesland</Label>
                <Select value={formData.bundesland} onValueChange={(value) => handleInputChange('bundesland', value)}>
                  <SelectTrigger>
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

              <div>
                <Label htmlFor="steuerklasse">Steuerklasse</Label>
                <Select value={formData.steuerklasse} onValueChange={(value) => handleInputChange('steuerklasse', value)}>
                  <SelectTrigger>
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

              <div>
                <Label htmlFor="kinder">Kinderfreibetrag (Anzahl)</Label>
                <Input
                  id="kinder"
                  type="number"
                  min="0"
                  value={formData.kinderfreibetrag}
                  onChange={(e) => handleInputChange('kinderfreibetrag', parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="wochenstunden">Wochenstunden</Label>
                <Input
                  id="wochenstunden"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.wochenstunden}
                  onChange={(e) => handleInputChange('wochenstunden', parseInt(e.target.value) || 40)}
                />
              </div>

              <div className="space-y-3">
                <Label>Sozialversicherungen</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kirchensteuer"
                    checked={formData.kirchensteuerpflicht}
                    onCheckedChange={(checked) => handleInputChange('kirchensteuerpflicht', checked)}
                  />
                  <Label htmlFor="kirchensteuer">Kirchensteuerpflicht</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="krankenversicherung"
                    checked={formData.krankenversicherung}
                    onCheckedChange={(checked) => handleInputChange('krankenversicherung', checked)}
                  />
                  <Label htmlFor="krankenversicherung">Krankenversicherung (8,55% Arbeitnehmeranteil)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rentenversicherung"
                    checked={formData.rentenversicherung}
                    onCheckedChange={(checked) => handleInputChange('rentenversicherung', checked)}
                  />
                  <Label htmlFor="rentenversicherung">Rentenversicherung</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="arbeitslosenversicherung"
                    checked={formData.arbeitslosenversicherung}
                    onCheckedChange={(checked) => handleInputChange('arbeitslosenversicherung', checked)}
                  />
                  <Label htmlFor="arbeitslosenversicherung">Arbeitslosenversicherung</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pflegeversicherung"
                    checked={formData.pflegeversicherung}
                    onCheckedChange={(checked) => handleInputChange('pflegeversicherung', checked)}
                  />
                  <Label htmlFor="pflegeversicherung">Pflegeversicherung (1,875% kinderlos)</Label>
                </div>
              </div>

              <Button 
                onClick={calculateNetto} 
                className="w-full" 
                disabled={loading || !formData.bruttoGehalt || !formData.bundesland}
              >
                {loading ? 'Berechne...' : 'Netto berechnen'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Berechnungsergebnis
              </CardTitle>
              <CardDescription>
                Ihre detaillierte Gehaltsaufschlüsselung
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Bruttogehalt (monatlich)</span>
                      <span className="font-semibold">{result.grossSalary.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t">
                      <span className="text-lg font-bold text-blue-600">Nettogehalt (monatlich)</span>
                      <span className="text-xl font-bold text-blue-600">{result.netSalary.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t">
                      <span className="text-sm text-gray-600">Bruttogehalt (jährlich)</span>
                      <span className="font-semibold">{result.yearly.grossSalary.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-bold text-green-600">Nettogehalt (jährlich)</span>
                      <span className="text-xl font-bold text-green-600">{result.yearly.netSalary.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t">
                      <span className="text-sm text-gray-600">Stundenlohn (brutto)</span>
                      <span className="font-semibold">{result.hourly.gross.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-bold text-purple-600">Stundenlohn (netto)</span>
                      <span className="text-xl font-bold text-purple-600">{result.hourly.net.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Bei {result.hourly.weeklyHours} Stunden/Woche
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">Steuerabzüge (monatlich)</h4>
                    <div className="flex justify-between text-sm">
                      <span>Lohnsteuer</span>
                      <span>-{result.incomeTax.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    {result.churchTax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Kirchensteuer</span>
                        <span>-{result.churchTax.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                    )}
                    {result.solidarityTax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Solidaritätszuschlag</span>
                        <span>-{result.solidarityTax.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                      <span>Jährlich Lohnsteuer</span>
                      <span>-{result.yearly.incomeTax.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">Sozialversicherungen (monatlich)</h4>
                    <div className="flex justify-between text-sm">
                      <span>Rentenversicherung</span>
                      <span>-{result.socialInsurance.pension.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Krankenversicherung</span>
                      <span>-{result.socialInsurance.health.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pflegeversicherung</span>
                      <span>-{result.socialInsurance.care.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Arbeitslosenversicherung</span>
                      <span>-{result.socialInsurance.unemployment.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                      <span>Gesamt Sozialabgaben</span>
                      <span>-{result.socialInsurance.total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Jährlich Sozialabgaben</span>
                      <span>-{result.yearly.socialInsurance.total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Gesamtabzüge (monatlich)</span>
                      <span className="font-semibold">-{result.totalDeductions.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Gesamtabzüge (jährlich)</span>
                      <span className="font-semibold">-{result.yearly.totalDeductions.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Effektive Steuerbelastung</span>
                      <span className="font-semibold">{((result.totalDeductions / result.grossSalary) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Geben Sie Ihre Gehaltsdaten ein und klicken Sie auf "Netto berechnen"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">📊 Steuerinformationen 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Vergünstigungen (Steuerklassen)</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Klasse 1: Grundfreibetrag €11.604/Jahr</li>
                  <li>• Klasse 2: Zusätzliche Entlastung €1.308/Jahr</li>
                  <li>• Klasse 3: Doppelter Grundfreibetrag für Verheiratete</li>
                  <li>• Klasse 4: Einzelveranlagung für Verheiratete</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Sozialversicherungsraten 2025</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Rentenversicherung: 18,6% (9,3% Arbeitnehmer)</li>
                  <li>• Krankenversicherung: 8,55% Arbeitnehmeranteil</li>
                  <li>• Pflegeversicherung: 1,875% (kinderlos)</li>
                  <li>• Arbeitslosenversicherung: 2,6% (1,3% Arbeitnehmer)</li>
                  <li>• Solidaritätszuschlag: 0% (aufgehoben)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}