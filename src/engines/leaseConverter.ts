import type { ImpliedRocResult, ImpliedErpResult, RdConversionResult, LeaseConversionResult, NormalizedEarningsResult } from './types'

// Implied ROC/ROE
export function computeImpliedRoc(
  ebitAfterTax: number,
  fcff: number,
  perpetualGrowthRate: number,
  costOfCapital: number,
): ImpliedRocResult {
  const reinvestmentRate = 1 - (fcff / ebitAfterTax)
  const impliedRoc = reinvestmentRate !== 0 ? perpetualGrowthRate / reinvestmentRate : 0
  const reinvestmentRateIfRocEqualsWacc = perpetualGrowthRate / costOfCapital

  return { reinvestmentRate, impliedRoc, reinvestmentRateIfRocEqualsWacc }
}

// Implied ERP
export function computeImpliedErp(
  indexLevel: number,
  dividendYield: number,
  growthRate5yr: number,
  riskFreeRate: number,
  longTermGrowthRate: number,
): ImpliedErpResult {
  // Start with an initial ERP guess and iterate
  let erp = 0.05
  const maxIter = 100
  const tolerance = 0.00001

  const expectedDividends: number[] = []
  for (let i = 1; i <= 5; i++) {
    expectedDividends.push(indexLevel * dividendYield * Math.pow(1 + growthRate5yr, i))
  }

  for (let iter = 0; iter < maxIter; iter++) {
    const discountRate = riskFreeRate + erp
    const terminalValue = expectedDividends[4] * (1 + longTermGrowthRate) / (discountRate - longTermGrowthRate)

    let intrinsicValue = 0
    const presentValues: number[] = []
    for (let i = 0; i < 5; i++) {
      const pv = expectedDividends[i] / Math.pow(1 + discountRate, i + 1)
      presentValues.push(pv)
      intrinsicValue += pv
    }
    const pvTerminal = terminalValue / Math.pow(1 + discountRate, 5)
    presentValues[4] += pvTerminal
    intrinsicValue += pvTerminal

    const diff = intrinsicValue - indexLevel
    if (Math.abs(diff) < tolerance) {
      return { expectedDividends, presentValues, intrinsicValue, impliedErp: erp }
    }

    // Newton-like adjustment
    erp = erp + diff / (indexLevel * 50)
    if (erp < 0) erp = 0.001
    if (erp > 0.20) erp = 0.20
  }

  return { expectedDividends, presentValues: [], intrinsicValue: 0, impliedErp: erp }
}

// R&D Converter
export interface RdInputs {
  currentYearRd: number
  amortizableLife: number
  historicalRd: { yearsAgo: number; rdExpense: number }[]
  taxRate: number
}

export function computeRdConversion(inputs: RdInputs): RdConversionResult {
  const { currentYearRd, amortizableLife, historicalRd, taxRate } = inputs
  const annualRd: { year: number; rdExpense: number; amortization: number; unamortizedValue: number }[] = []

  let totalUnamortized = 0
  let totalAmortization = 0

  // Process each year of R&D
  const allRd = [
    ...historicalRd.map(h => ({ year: -h.yearsAgo, rdExpense: h.rdExpense })),
    { year: 0, rdExpense: currentYearRd },
  ].sort((a, b) => a.year - b.year)

  for (const rd of allRd) {
    const yearsFromCurrent = -rd.year
    const yearsRemaining = Math.max(0, amortizableLife - yearsFromCurrent)
    const annualAmort = rd.rdExpense / amortizableLife
    const unamortized = rd.rdExpense * (yearsRemaining / amortizableLife)

    totalUnamortized += unamortized
    if (yearsFromCurrent < amortizableLife) {
      totalAmortization += annualAmort
    }

    annualRd.push({
      year: rd.year,
      rdExpense: rd.rdExpense,
      amortization: yearsFromCurrent < amortizableLife ? annualAmort : 0,
      unamortizedValue: unamortized,
    })
  }

  const adjustmentToOperatingIncome = currentYearRd - totalAmortization

  return {
    annualRd,
    totalUnamortizedRd: totalUnamortized,
    currentYearAmortization: totalAmortization,
    adjustmentToOperatingIncome,
    adjustmentToEquity: totalUnamortized,
  }
}

// Operating Lease Converter
export interface LeaseInputs {
  leaseCommitments: number[]
  leaseBeyondYear5: number
  preTaxCostOfDebt: number
}

export function computeLeaseConversion(inputs: LeaseInputs): LeaseConversionResult {
  const { leaseCommitments, leaseBeyondYear5, preTaxCostOfDebt } = inputs

  const leasePv: { year: number; commitment: number; presentValue: number }[] = []
  let debtValueOfLeases = 0

  for (let i = 0; i < leaseCommitments.length; i++) {
    const pv = leaseCommitments[i] / Math.pow(1 + preTaxCostOfDebt, i + 1)
    leasePv.push({ year: i + 1, commitment: leaseCommitments[i], presentValue: pv })
    debtValueOfLeases += pv
  }

  // Beyond year 5
  if (leaseBeyondYear5 > 0 && leaseCommitments.length >= 5) {
    const avgCommitment = leaseCommitments.reduce((s, c) => s + c, 0) / leaseCommitments.length
    const yearsEmbedded = Math.round(leaseBeyondYear5 / avgCommitment)
    const annualBeyond = leaseBeyondYear5 / yearsEmbedded
    for (let i = 0; i < yearsEmbedded; i++) {
      const pv = annualBeyond / Math.pow(1 + preTaxCostOfDebt, leaseCommitments.length + i + 1)
      leasePv.push({ year: leaseCommitments.length + i + 1, commitment: annualBeyond, presentValue: pv })
      debtValueOfLeases += pv
    }
  }

  const depreciationOnLeaseAsset = debtValueOfLeases / (leaseCommitments.length || 5)
  const currentLeaseExpense = leaseCommitments[0] || 0
  const adjustmentToOperatingIncome = currentLeaseExpense - depreciationOnLeaseAsset

  return {
    leasePv,
    debtValueOfLeases,
    depreciationOnLeaseAsset,
    adjustmentToOperatingIncome,
    adjustmentToDebt: debtValueOfLeases,
  }
}

// Normalized Earnings
export interface NormalizedEarningsInputs {
  approach: 1 | 2 | 3
  currentRevenue: number
  currentCapital: number
  historicalAverageEbit: number
  historicalAverageRoc: number
  sectorMargin: number
}

export function computeNormalizedEarnings(inputs: NormalizedEarningsInputs): NormalizedEarningsResult {
  const { approach, currentRevenue, currentCapital, historicalAverageEbit, historicalAverageRoc, sectorMargin } = inputs

  let normalizedEbit: number
  let approachName: string

  switch (approach) {
    case 1:
      normalizedEbit = historicalAverageEbit
      approachName = 'Historical Average EBIT'
      break
    case 2:
      normalizedEbit = historicalAverageRoc * currentCapital
      approachName = 'Historical Average ROC × Current Capital'
      break
    case 3:
      normalizedEbit = sectorMargin * currentRevenue
      approachName = 'Sector Margin × Current Revenue'
      break
    default:
      normalizedEbit = historicalAverageEbit
      approachName = 'Historical Average EBIT'
  }

  return {
    approach: approachName,
    normalizedEbit,
    historicalAverageEbit,
    historicalAverageRoc,
    sectorMargin,
  }
}
