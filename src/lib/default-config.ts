export interface AppConfigState {
  value: string
  label: string
  churchTaxRate: number
}

export interface AppConfigTaxClass {
  value: string
  label: string
  description: string
  extraDeductionPercent: number
  allowanceAmount: number
}

export interface AppConfigInfoSection {
  id: string
  title: string
  items: string[]
}

export interface AppConfigSocialInsuranceEntry {
  label: string
  employeeRate: number
}

export interface AppConfigTaxSettings {
  basicAllowance: number
  singleParentAllowance: number
  marriedAllowanceMultiplier: number
}

export interface AppConfig {
  states: AppConfigState[]
  taxClasses: AppConfigTaxClass[]
  socialInsurance: {
    pension: AppConfigSocialInsuranceEntry
    health: AppConfigSocialInsuranceEntry
    care: AppConfigSocialInsuranceEntry
    unemployment: AppConfigSocialInsuranceEntry
    solidarity: AppConfigSocialInsuranceEntry
  }
  infoSections: AppConfigInfoSection[]
  taxSettings: AppConfigTaxSettings
}

export const CONFIG_KEYS = [
  'states',
  'taxClasses',
  'socialInsurance',
  'infoSections',
  'taxSettings',
] as const

export type ConfigKey = typeof CONFIG_KEYS[number]

export const defaultAppConfig: AppConfig = {
  states: [
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
    { value: 'thueringen', label: 'Thüringen', churchTaxRate: 9 },
  ],
  taxClasses: [
    {
      value: '1',
      label: 'Steuerklasse 1',
      description: 'Grundfreibetrag 11.604 € / Jahr',
      extraDeductionPercent: 0,
      allowanceAmount: 0,
    },
    {
      value: '2',
      label: 'Steuerklasse 2',
      description: 'Zusätzliche Entlastung 1.308 € / Jahr',
      extraDeductionPercent: 0,
      allowanceAmount: 0,
    },
    {
      value: '3',
      label: 'Steuerklasse 3',
      description: 'Doppelter Grundfreibetrag für Verheiratete',
      extraDeductionPercent: 0,
      allowanceAmount: 0,
    },
    {
      value: '4',
      label: 'Steuerklasse 4',
      description: 'Einzelveranlagung für Verheiratete',
      extraDeductionPercent: 0,
      allowanceAmount: 0,
    },
    {
      value: '5',
      label: 'Steuerklasse 5',
      description: 'Niedrigeres Einkommen in der Ehe',
      extraDeductionPercent: 0,
      allowanceAmount: 0,
    },
    {
      value: '6',
      label: 'Steuerklasse 6',
      description: 'Zweitjob oder Nebentätigkeit',
      extraDeductionPercent: 0,
      allowanceAmount: 0,
    },
  ],
  socialInsurance: {
    pension: { label: 'Rentenversicherung', employeeRate: 9.3 },
    health: { label: 'Krankenversicherung', employeeRate: 8.55 },
    care: { label: 'Pflegeversicherung', employeeRate: 1.875 },
    unemployment: { label: 'Arbeitslosenversicherung', employeeRate: 1.3 },
    solidarity: { label: 'Solidaritätszuschlag', employeeRate: 0 },
  },
  infoSections: [
    {
      id: 'allowances',
      title: 'Vergünstigungen (Steuerklassen)',
      items: [
        'Klasse 1: Grundfreibetrag 11.604 € / Jahr',
        'Klasse 2: Zusätzliche Entlastung 1.308 € / Jahr',
        'Klasse 3: Doppelter Grundfreibetrag für Verheiratete',
        'Klasse 4: Einzelveranlagung für Verheiratete',
      ],
    },
    {
      id: 'rates',
      title: 'Sozialversicherungsraten 2025',
      items: [
        'Rentenversicherung: 18,6 % gesamt (9,3 % Arbeitnehmer)',
        'Krankenversicherung: 8,55 % Arbeitnehmeranteil',
        'Pflegeversicherung: 1,875 % (kinderlos)',
        'Arbeitslosenversicherung: 2,6 % gesamt (1,3 % Arbeitnehmer)',
        'Solidaritätszuschlag: 0 % (aufgehoben)',
      ],
    },
  ],
  taxSettings: {
    basicAllowance: 11604,
    singleParentAllowance: 1308,
    marriedAllowanceMultiplier: 2,
  },
}

type ConfigOverrides = Partial<Record<ConfigKey, unknown>>

export function buildAppConfig(overrides?: ConfigOverrides): AppConfig {
  const base: AppConfig = JSON.parse(JSON.stringify(defaultAppConfig))

  if (!overrides) {
    return base
  }

  CONFIG_KEYS.forEach((key) => {
    const value = overrides[key]
    if (typeof value === 'undefined' || value === null) {
      return
    }

    switch (key) {
      case 'states':
        if (Array.isArray(value)) {
          const parsed = value.filter((item): item is AppConfigState =>
            typeof item === 'object' &&
            item !== null &&
            typeof (item as AppConfigState).value === 'string' &&
            typeof (item as AppConfigState).label === 'string' &&
            typeof (item as AppConfigState).churchTaxRate === 'number'
          )
          if (parsed.length > 0) {
            base.states = parsed
          }
        }
        break
      case 'taxClasses':
        if (Array.isArray(value)) {
          const parsed = value
            .map((item) => {
              if (typeof item !== 'object' || item === null) {
                return null
              }

              const candidate = item as Partial<AppConfigTaxClass>
              if (
                typeof candidate.value !== 'string' ||
                typeof candidate.label !== 'string' ||
                typeof candidate.description !== 'string'
              ) {
                return null
              }

              return {
                value: candidate.value,
                label: candidate.label,
                description: candidate.description,
                extraDeductionPercent:
                  typeof candidate.extraDeductionPercent === 'number'
                    ? candidate.extraDeductionPercent
                    : 0,
                allowanceAmount:
                  typeof candidate.allowanceAmount === 'number'
                    ? candidate.allowanceAmount
                    : 0,
              }
            })
            .filter((item): item is AppConfigTaxClass => item !== null)

          if (parsed.length > 0) {
            base.taxClasses = parsed
          }
        }
        break
      case 'socialInsurance':
        if (typeof value === 'object' && value !== null) {
          const candidate = value as AppConfig['socialInsurance']
          const keys: (keyof AppConfig['socialInsurance'])[] = ['pension', 'health', 'care', 'unemployment', 'solidarity']
          if (
            keys.every((entryKey) => {
              const entry = candidate[entryKey]
              return (
                entry &&
                typeof entry.label === 'string' &&
                typeof entry.employeeRate === 'number'
              )
            })
          ) {
            base.socialInsurance = candidate
          }
        }
        break
      case 'infoSections':
        if (Array.isArray(value)) {
          const parsed = value.filter((item): item is AppConfigInfoSection =>
            typeof item === 'object' &&
            item !== null &&
            typeof (item as AppConfigInfoSection).id === 'string' &&
            typeof (item as AppConfigInfoSection).title === 'string' &&
            Array.isArray((item as AppConfigInfoSection).items)
          )
          if (parsed.length > 0) {
            base.infoSections = parsed.map((section) => ({
              ...section,
              items: section.items.filter((item): item is string => typeof item === 'string'),
            }))
          }
        }
        break
      case 'taxSettings':
        if (typeof value === 'object' && value !== null) {
          const candidate = value as AppConfigTaxSettings
          if (
            typeof candidate.basicAllowance === 'number' &&
            typeof candidate.singleParentAllowance === 'number' &&
            typeof candidate.marriedAllowanceMultiplier === 'number'
          ) {
            base.taxSettings = candidate
          }
        }
        break
    }
  })

  return base
}

type ConfigEntries = Partial<Record<ConfigKey, unknown>>

export function extractConfigEntries(entries: ConfigEntries): ConfigEntries {
  const allowedEntries: ConfigEntries = {}
  CONFIG_KEYS.forEach((key) => {
    if (entries[key] !== undefined) {
      allowedEntries[key] = entries[key]
    }
  })
  return allowedEntries
}
