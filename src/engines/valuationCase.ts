import type { CountryExposure, WeightedCountryRisk } from './countryRisk'
import { calculateWeightedCountryRisk } from './countryRisk'
import type { DcfResult, WaccResult } from './types'
import type { FcffSimpleInputs } from './fcffSimpleDcf'
import { computeFcffSimpleDcf } from './fcffSimpleDcf'

export interface ValuationCompanySnapshot {
  ticker: string
  name: string
  country: string
  currency: string
  sector: string
  industry: string
  price: number
}

export interface ValuationCase {
  id: string
  updatedAt: string
  company: ValuationCompanySnapshot | null
  narrative: {
    story: string
    moat: string
    risks: string
  }
  countryExposures: CountryExposure[]
  countryRisk: WeightedCountryRisk | null
  wacc: {
    result: WaccResult | null
    inputs: unknown | null
  }
  dcf: {
    result: DcfResult | null
    inputs: FcffSimpleInputs | null
  }
}

export interface AssumptionAuditItem {
  severity: 'critical' | 'warning' | 'info'
  title: string
  detail: string
}

export interface InvestmentDecision {
  fairValue: number | null
  marketPrice: number | null
  upsideDownside: number | null
  marginOfSafety: number | null
  recommendation: 'Strong Buy' | 'Buy' | 'Watchlist' | 'Hold' | 'Avoid' | 'Incomplete'
  rationale: string
}

export function createEmptyValuationCase(): ValuationCase {
  return {
    id: `case-${Date.now()}`,
    updatedAt: new Date().toISOString(),
    company: null,
    narrative: {
      story: '',
      moat: '',
      risks: '',
    },
    countryExposures: [{ country: 'United States', weight: 100 }],
    countryRisk: null,
    wacc: { result: null, inputs: null },
    dcf: { result: null, inputs: null },
  }
}

export function runAssumptionAudit(caseData: ValuationCase): AssumptionAuditItem[] {
  const items: AssumptionAuditItem[] = []
  const { wacc, dcf, countryRisk } = caseData

  if (!caseData.company) {
    items.push({
      severity: 'info',
      title: 'Start with a ticker',
      detail: 'Auto-fill a company first so the case has market data, country risk, and shares outstanding.',
    })
  }

  if (!wacc.result) {
    items.push({
      severity: 'warning',
      title: 'WACC is not saved to the case',
      detail: 'Run the WACC calculator and save the result before relying on the DCF discount rate.',
    })
  } else {
    if (wacc.result.wacc <= 0) {
      items.push({ severity: 'critical', title: 'WACC is non-positive', detail: 'A non-positive discount rate invalidates the valuation.' })
    }
    if (wacc.result.costOfEquity < 0.03) {
      items.push({ severity: 'warning', title: 'Cost of equity looks low', detail: 'Check beta, risk-free rate, and ERP assumptions.' })
    }
  }

  if (!dcf.result || !dcf.inputs) {
    items.push({
      severity: 'warning',
      title: 'DCF result is not saved',
      detail: 'Run FCFF Simple DCF to complete the case valuation.',
    })
    return items
  }

  const terminal = dcf.result.terminalYear
  if (terminal.costOfCapital <= terminal.revenueGrowth) {
    items.push({
      severity: 'critical',
      title: 'Terminal growth exceeds or equals terminal cost of capital',
      detail: 'Terminal value is not meaningful when stable growth is greater than or equal to the stable discount rate.',
    })
  }

  const totalValue = dcf.result.pvCashFlows + dcf.result.pvTerminalValue
  const terminalShare = totalValue !== 0 ? dcf.result.pvTerminalValue / totalValue : 0
  if (terminalShare > 0.8) {
    items.push({
      severity: 'warning',
      title: 'Terminal value dominates the valuation',
      detail: `${(terminalShare * 100).toFixed(1)}% of operating asset value comes from terminal value. Recheck growth, margin, reinvestment, and stable ROC.`,
    })
  }

  if (dcf.result.diagnostics.roicYear10 < dcf.result.diagnostics.costOfCapitalYear10 && dcf.result.diagnostics.terminalGrowthRate > 0.02) {
    items.push({
      severity: 'warning',
      title: 'Stable ROC is below cost of capital',
      detail: 'A firm earning less than its cost of capital should not normally sustain meaningful positive growth in perpetuity.',
    })
  }

  if (caseData.company?.price && dcf.result.valuePerShare > 0) {
    const gap = dcf.result.valuePerShare / caseData.company.price - 1
    if (Math.abs(gap) > 0.5) {
      items.push({
        severity: 'info',
        title: 'Large value-to-price gap',
        detail: `Intrinsic value differs from market price by ${(gap * 100).toFixed(1)}%. This may be real, but it deserves a narrative explanation.`,
      })
    }
  }

  if (countryRisk && dcf.inputs.costOfCapital < countryRisk.totalEquityRiskPremium) {
    items.push({
      severity: 'warning',
      title: 'DCF cost of capital is below country ERP',
      detail: 'A firm-level cost of capital below the weighted country ERP is unusual. Reconcile this with the WACC case.',
    })
  }

  return items
}

export function getInvestmentDecision(caseData: ValuationCase): InvestmentDecision {
  const fairValue = caseData.dcf.result?.valuePerShare ?? null
  const marketPrice = caseData.company?.price && caseData.company.price > 0 ? caseData.company.price : null

  if (!fairValue || !marketPrice) {
    return {
      fairValue,
      marketPrice,
      upsideDownside: null,
      marginOfSafety: null,
      recommendation: 'Incomplete',
      rationale: 'Run a DCF and auto-fill a current market price before making a valuation call.',
    }
  }

  const upsideDownside = fairValue / marketPrice - 1
  const marginOfSafety = fairValue > 0 ? Math.max(0, (fairValue - marketPrice) / fairValue) : 0

  if (upsideDownside >= 0.35 && marginOfSafety >= 0.25) {
    return {
      fairValue,
      marketPrice,
      upsideDownside,
      marginOfSafety,
      recommendation: 'Strong Buy',
      rationale: 'Fair value is materially above price with a strong margin of safety.',
    }
  }

  if (upsideDownside >= 0.15 && marginOfSafety >= 0.12) {
    return {
      fairValue,
      marketPrice,
      upsideDownside,
      marginOfSafety,
      recommendation: 'Buy',
      rationale: 'Fair value is above price with a usable margin of safety.',
    }
  }

  if (upsideDownside >= 0) {
    return {
      fairValue,
      marketPrice,
      upsideDownside,
      marginOfSafety,
      recommendation: 'Watchlist',
      rationale: 'The stock is below fair value, but the margin of safety is thin.',
    }
  }

  if (upsideDownside >= -0.15) {
    return {
      fairValue,
      marketPrice,
      upsideDownside,
      marginOfSafety,
      recommendation: 'Hold',
      rationale: 'Market price is close to fair value. The valuation does not offer a clear bargain.',
    }
  }

  return {
    fairValue,
    marketPrice,
    upsideDownside,
    marginOfSafety,
    recommendation: 'Avoid',
    rationale: 'Market price is meaningfully above estimated fair value.',
  }
}

export function buildSensitivityTable(inputs: FcffSimpleInputs | null) {
  if (!inputs) return []

  const baseGrowth = inputs.overrideGrowthPerpetuity
    ? inputs.growthInPerpetuity
    : (inputs.overrideRiskFreeAfter10 ? inputs.riskFreeRateAfter10 : inputs.riskFreeRate)
  const costs = [inputs.costOfCapital - 0.01, inputs.costOfCapital, inputs.costOfCapital + 0.01]
  const growths = [baseGrowth - 0.005, baseGrowth, baseGrowth + 0.005]

  return costs.map((costOfCapital) => ({
    costOfCapital,
    values: growths.map((growth) => {
      if (costOfCapital <= growth) return null
      try {
        return computeFcffSimpleDcf({
          ...inputs,
          costOfCapital,
          overrideStableCostOfCapital: true,
          stableCostOfCapital: costOfCapital,
          overrideGrowthPerpetuity: true,
          growthInPerpetuity: growth,
        }).valuePerShare
      } catch {
        return null
      }
    }),
  }))
}

export function summarizeCountryRisk(exposures: CountryExposure[]) {
  return calculateWeightedCountryRisk(exposures)
}
