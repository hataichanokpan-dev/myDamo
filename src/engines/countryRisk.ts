import countryRiskLatest, { type CountryRiskRecord } from '../data/countryRiskLatest'

export interface CountryExposure {
  country: string
  weight: number
}

export interface WeightedCountryRisk {
  totalEquityRiskPremium: number
  countryRiskPremium: number
  taxRate: number | null
  records: Array<{
    country: string
    weight: number
    risk: CountryRiskRecord
  }>
  missingCountries: string[]
}

const COUNTRY_ALIASES: Record<string, string> = {
  usa: 'United States',
  us: 'United States',
  'united states of america': 'United States',
  uk: 'United Kingdom',
  uae: 'United Arab Emirates',
  korea: 'South Korea',
  'korea, south': 'South Korea',
  russia: 'Russian Federation',
  vietnam: 'Vietnam',
  'viet nam': 'Vietnam',
}

function normalizeCountryName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function findCountryRisk(country: string): CountryRiskRecord | null {
  if (!country) return null

  const normalized = normalizeCountryName(country)
  const alias = COUNTRY_ALIASES[normalized]
  const lookupName = alias ? normalizeCountryName(alias) : normalized

  return countryRiskLatest.countries.find((record) => (
    normalizeCountryName(record.country) === lookupName
  )) ?? null
}

export function inferCountryFromTicker(ticker: string): string | null {
  const symbol = ticker.trim().toUpperCase()
  const suffix = symbol.includes('.') ? symbol.split('.').pop() : ''
  const suffixMap: Record<string, string> = {
    BK: 'Thailand',
    SI: 'Singapore',
    HK: 'Hong Kong',
    SS: 'China',
    SZ: 'China',
    TW: 'Taiwan',
    T: 'Japan',
    KS: 'South Korea',
    KQ: 'South Korea',
    AX: 'Australia',
    L: 'United Kingdom',
    TO: 'Canada',
    V: 'Canada',
  }
  return suffix ? suffixMap[suffix] ?? null : null
}

export function listCountryRiskRecords() {
  return [...countryRiskLatest.countries].sort((a, b) => a.country.localeCompare(b.country))
}

export function calculateWeightedCountryRisk(exposures: CountryExposure[]): WeightedCountryRisk {
  const valid = exposures.filter((item) => item.country && item.weight > 0)
  const totalWeight = valid.reduce((sum, item) => sum + item.weight, 0)
  const normalized = totalWeight > 0
    ? valid.map((item) => ({ ...item, weight: item.weight / totalWeight }))
    : valid

  const records: WeightedCountryRisk['records'] = []
  const missingCountries: string[] = []

  for (const exposure of normalized) {
    const risk = findCountryRisk(exposure.country)
    if (risk) {
      records.push({ country: risk.country, weight: exposure.weight, risk })
    } else {
      missingCountries.push(exposure.country)
    }
  }

  const totalEquityRiskPremium = records.reduce((sum, item) => (
    sum + item.weight * item.risk.totalEquityRiskPremium
  ), 0)
  const countryRiskPremium = records.reduce((sum, item) => (
    sum + item.weight * item.risk.countryRiskPremium
  ), 0)
  const taxWeight = records.reduce((sum, item) => (
    item.risk.taxRate == null ? sum : sum + item.weight
  ), 0)
  const taxRate = taxWeight > 0
    ? records.reduce((sum, item) => (
      item.risk.taxRate == null ? sum : sum + item.weight * item.risk.taxRate
    ), 0) / taxWeight
    : null

  return {
    totalEquityRiskPremium,
    countryRiskPremium,
    taxRate,
    records,
    missingCountries,
  }
}

export function getCountryRiskDatasetMeta() {
  return {
    version: countryRiskLatest.version,
    sourceFile: countryRiskLatest.sourceFile,
    updateDate: countryRiskLatest.updateDate,
    matureMarketPremium: countryRiskLatest.matureMarketPremium,
    usErp: countryRiskLatest.usErp,
    relativeEquityVolatility: countryRiskLatest.relativeEquityVolatility,
  }
}
