import type { WaccResult } from './types'

export interface WaccInputs {
  // Beta
  betaApproach: 'regression' | 'bottom-up-single' | 'bottom-up-multi' | 'direct'
  regressionBeta: number
  directInputBeta: number
  unleveredBeta: number
  debtToEquityRatio: number
  taxRateForBeta: number

  // Multi-business
  businesses?: { revenue: number; evSales: number; unleveredBeta: number }[]

  // ERP
  erpApproach: 'direct' | 'implied' | 'operating-regions'
  directErp: number
  operatingRegions?: { region: string; revenue: number; erp: number }[]

  // Risk-free rate
  riskFreeRate: number

  // Debt
  bookValueOfDebt: number
  interestExpense: number
  averageMaturity: number
  costOfDebtApproach: 'direct' | 'rating' | 'synthetic'
  directCostOfDebt: number
  rating: string
  syntheticCompanyType: number
  operatingIncome: number

  // Operating leases
  hasLeases: boolean
  leaseCommitments: number[]
  leaseBeyondYear5: number
  preTaxCostOfDebt: number

  // Tax
  taxRateApproach: 'direct' | 'marginal'
  taxRate: number
  marginalTaxRate: number

  // Convertible debt
  bookValueOfConvertible: number
  interestOnConvertible: number
  convertibleMaturity: number
  marketValueOfConvertible: number

  // Preferred stock
  preferredShares: number
  preferredPrice: number
  preferredDividend: number

  // Market data
  sharesOutstanding: number
  marketPricePerShare: number
}

const RATING_SPREADS: Record<string, number> = {
  'Aaa/AAA': 0.004, 'Aa1/AA+': 0.005, 'Aa2/AA': 0.006, 'Aa3/AA-': 0.007,
  'A1/A+': 0.008, 'A2/A': 0.010, 'A3/A-': 0.012,
  'Baa1/BBB+': 0.015, 'Baa2/BBB': 0.020, 'Baa3/BBB-': 0.025,
  'Ba1/BB+': 0.035, 'Ba2/BB': 0.045, 'Ba3/BB-': 0.055,
  'B1/B+': 0.065, 'B2/B': 0.075, 'B3/B-': 0.085,
  'Caa1/CCC+': 0.10, 'Caa2/CCC': 0.12, 'Caa3/CCC-': 0.15,
  'Ca/CC': 0.17, 'C': 0.20, 'D': 0.25,
}

const SYNTHETIC_RATING_THRESHOLDS = [
  { min: 12.5, rating: 'Aaa/AAA', spread: 0.004 },
  { min: 9.5, rating: 'Aa/AA', spread: 0.006 },
  { min: 7.5, rating: 'Aa/AA', spread: 0.008 },
  { min: 6, rating: 'A/A', spread: 0.010 },
  { min: 4.5, rating: 'A-', spread: 0.012 },
  { min: 3.5, rating: 'BBB+', spread: 0.015 },
  { min: 3, rating: 'BBB', spread: 0.020 },
  { min: 2.5, rating: 'BBB-', spread: 0.025 },
  { min: 2, rating: 'BB+', spread: 0.035 },
  { min: 1.75, rating: 'BB', spread: 0.045 },
  { min: 1.5, rating: 'BB-', spread: 0.055 },
  { min: 1.25, rating: 'B+', spread: 0.065 },
  { min: 1, rating: 'B', spread: 0.075 },
  { min: 0.8, rating: 'B-', spread: 0.085 },
  { min: 0.65, rating: 'CCC', spread: 0.10 },
  { min: 0, rating: 'CC/D', spread: 0.20 },
]

function computeDebtValueOfLeases(
  commitments: number[],
  beyondYear5: number,
  preTaxCostOfDebt: number,
): { pvByYear: { year: number; commitment: number; presentValue: number }[]; total: number } {
  const pvByYear: { year: number; commitment: number; presentValue: number }[] = []
  let total = 0

  for (let i = 0; i < commitments.length; i++) {
    const pv = commitments[i] / Math.pow(1 + preTaxCostOfDebt, i + 1)
    pvByYear.push({ year: i + 1, commitment: commitments[i], presentValue: pv })
    total += pv
  }

  // Beyond year 5 - convert to annuity
  if (beyondYear5 > 0 && commitments.length >= 5) {
    const avgCommitment = commitments.reduce((s, c) => s + c, 0) / commitments.length
    const yearsEmbedded = beyondYear5 / avgCommitment
    const annualBeyond = beyondYear5 / yearsEmbedded
    for (let i = 0; i < Math.ceil(yearsEmbedded); i++) {
      const annuityPayment = i < Math.floor(yearsEmbedded) ? annualBeyond : annualBeyond * (yearsEmbedded - Math.floor(yearsEmbedded))
      const pv = annuityPayment / Math.pow(1 + preTaxCostOfDebt, commitments.length + i + 1)
      pvByYear.push({ year: commitments.length + i + 1, commitment: annuityPayment, presentValue: pv })
      total += pv
    }
  }

  return { pvByYear, total }
}

export function computeWacc(inputs: WaccInputs): WaccResult {
  // 1. Compute debt value of leases
  let debtValueOfLeases = 0
  if (inputs.hasLeases && inputs.leaseCommitments.length > 0) {
    const leaseResult = computeDebtValueOfLeases(
      inputs.leaseCommitments,
      inputs.leaseBeyondYear5,
      inputs.preTaxCostOfDebt,
    )
    debtValueOfLeases = leaseResult.total
  }

  // 2. Market value of straight debt
  const mvStraightDebt = inputs.averageMaturity > 0 && inputs.interestExpense > 0
    ? inputs.interestExpense * (1 - Math.pow(1 + inputs.directCostOfDebt, -inputs.averageMaturity)) / inputs.directCostOfDebt + inputs.bookValueOfDebt / Math.pow(1 + inputs.directCostOfDebt, inputs.averageMaturity)
    : inputs.bookValueOfDebt

  // 3. Compute unlevered beta for bottom-up multi
  let unleveredBeta: number
  if (inputs.betaApproach === 'bottom-up-multi' && inputs.businesses && inputs.businesses.length > 0) {
    const totalValue = inputs.businesses.reduce((s, b) => s + b.revenue * b.evSales, 0)
    unleveredBeta = totalValue > 0
      ? inputs.businesses.reduce((s, b) => s + (b.revenue * b.evSales / totalValue) * b.unleveredBeta, 0)
      : 1
  } else if (inputs.betaApproach === 'direct') {
    // Unlever the direct input
    unleveredBeta = inputs.directInputBeta / (1 + (1 - inputs.taxRateForBeta) * inputs.debtToEquityRatio)
  } else if (inputs.betaApproach === 'regression') {
    unleveredBeta = inputs.regressionBeta / (1 + (1 - inputs.taxRateForBeta) * inputs.debtToEquityRatio)
  } else {
    unleveredBeta = inputs.unleveredBeta
  }

  // 4. Equity and debt for leverage calculation
  const marketValueOfEquity = inputs.sharesOutstanding * inputs.marketPricePerShare
  const totalDebt = mvStraightDebt + debtValueOfLeases + inputs.bookValueOfConvertible + inputs.preferredShares * inputs.preferredPrice
  const totalCapital = marketValueOfEquity + totalDebt
  const debtToEquity = marketValueOfEquity > 0 ? totalDebt / marketValueOfEquity : 0

  // 5. Levered beta
  const taxRate = inputs.taxRateApproach === 'direct' ? inputs.taxRate : inputs.marginalTaxRate
  const leveredBeta = unleveredBeta * (1 + (1 - taxRate) * debtToEquity)

  // 6. ERP
  let erp: number
  if (inputs.erpApproach === 'direct') {
    erp = inputs.directErp
  } else if (inputs.erpApproach === 'operating-regions' && inputs.operatingRegions && inputs.operatingRegions.length > 0) {
    const totalRev = inputs.operatingRegions.reduce((s, r) => s + r.revenue, 0)
    erp = totalRev > 0
      ? inputs.operatingRegions.reduce((s, r) => s + (r.revenue / totalRev) * r.erp, 0)
      : inputs.directErp
  } else {
    erp = inputs.directErp
  }

  // 7. Cost of equity
  const costOfEquity = inputs.riskFreeRate + leveredBeta * erp

  // 8. Pre-tax cost of debt
  let preTaxCostOfDebt: number
  if (inputs.costOfDebtApproach === 'direct') {
    preTaxCostOfDebt = inputs.directCostOfDebt
  } else if (inputs.costOfDebtApproach === 'rating') {
    const spread = RATING_SPREADS[inputs.rating] ?? 0.02
    preTaxCostOfDebt = inputs.riskFreeRate + spread
  } else {
    // Synthetic rating
    const interestCoverage = inputs.interestExpense > 0
      ? inputs.operatingIncome / inputs.interestExpense
      : inputs.operatingIncome > 0 ? 999 : 0
    const ratingInfo = SYNTHETIC_RATING_THRESHOLDS.find(r => interestCoverage >= r.min)
    preTaxCostOfDebt = inputs.riskFreeRate + (ratingInfo?.spread ?? 0.02)
  }

  const afterTaxCostOfDebt = preTaxCostOfDebt * (1 - taxRate)

  // 9. Weights
  const equityWeight = totalCapital > 0 ? marketValueOfEquity / totalCapital : 1
  const debtWeight = totalCapital > 0 ? totalDebt / totalCapital : 0

  // 10. WACC
  const wacc = equityWeight * costOfEquity + debtWeight * afterTaxCostOfDebt

  return {
    unleveredBeta,
    leveredBeta,
    costOfEquity,
    preTaxCostOfDebt,
    afterTaxCostOfDebt,
    marketValueOfEquity,
    marketValueOfDebt: totalDebt,
    totalCapital,
    equityWeight,
    debtWeight,
    wacc,
    debtValueOfLeases,
  }
}

export { computeDebtValueOfLeases }
