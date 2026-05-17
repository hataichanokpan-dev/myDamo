import type { DcfResult, YearlyData } from './types'

export interface FcffSimpleInputs {
  // Auto-fetchable
  revenue: number
  operatingIncome: number // EBIT
  interestExpense: number
  bookValueOfEquity: number
  bookValueOfDebt: number
  cashAndMarketableSecurities: number
  crossHoldings: number
  minorityInterests: number
  sharesOutstanding: number
  currentStockPrice: number
  effectiveTaxRate: number

  // Manual
  marginalTaxRate: number
  revenueGrowthYear1: number
  revenueGrowthYears2to5: number
  operatingMarginNextYear: number
  targetOperatingMargin: number
  yearOfConvergence: number
  salesToCapitalRatioYears1to5: number
  salesToCapitalRatioYears6to10: number
  riskFreeRate: number
  costOfCapital: number // from WACC sheet

  // Default assumptions overrides
  overrideStableCostOfCapital: boolean
  stableCostOfCapital: number
  overrideStableRoc: boolean
  stableRoc: number
  overrideFailure: boolean
  probabilityOfFailure: number
  distressProceedsPercent: number
  distressProceedsBasis: 'B' | 'V'
  overrideGrowthPerpetuity: boolean
  growthInPerpetuity: number
  overrideRiskFreeAfter10: boolean
  riskFreeRateAfter10: number
  overrideTaxAdjustment: boolean
  overrideNol: boolean
  nolCarryForward: number
  hasRd: boolean
  hasLease: boolean
  rdAdjustment: number
  leaseAdjustment: number
  hasOptions: boolean
  optionCount: number
  optionStrike: number
  optionMaturity: number
  optionVolatility: number
}

export function computeFcffSimpleDcf(inputs: FcffSimpleInputs): DcfResult {
  const {
    revenue, operatingIncome, effectiveTaxRate, marginalTaxRate,
    revenueGrowthYear1, revenueGrowthYears2to5,
    operatingMarginNextYear, targetOperatingMargin, yearOfConvergence,
    salesToCapitalRatioYears1to5, salesToCapitalRatioYears6to10,
    riskFreeRate, costOfCapital,
    overrideStableCostOfCapital, stableCostOfCapital,
    overrideStableRoc, stableRoc,
    overrideFailure, probabilityOfFailure, distressProceedsPercent,
    overrideGrowthPerpetuity, growthInPerpetuity,
    overrideRiskFreeAfter10, riskFreeRateAfter10,
    bookValueOfEquity, bookValueOfDebt, cashAndMarketableSecurities,
    crossHoldings, minorityInterests, sharesOutstanding,
    hasRd, hasLease, rdAdjustment, leaseAdjustment,
    hasOptions, optionCount, optionStrike, optionMaturity, optionVolatility,
    overrideNol, nolCarryForward,
  } = inputs

  const baseEbit = operatingIncome + (hasLease ? leaseAdjustment : 0) + (hasRd ? rdAdjustment : 0)

  // Terminal growth rate
  const terminalGrowthRate = overrideGrowthPerpetuity
    ? growthInPerpetuity
    : (overrideRiskFreeAfter10 ? riskFreeRateAfter10 : riskFreeRate)

  // Terminal cost of capital
  const terminalCostOfCapital = overrideStableCostOfCapital
    ? stableCostOfCapital
    : riskFreeRate + 0.045

  // Terminal ROC
  const terminalRoc = overrideStableRoc ? stableRoc : terminalCostOfCapital

  // Terminal reinvestment rate = g / ROC
  const terminalReinvestmentRate = terminalGrowthRate / terminalRoc

  // Terminal tax rate = marginal
  const terminalTaxRate = marginalTaxRate

  const years: YearlyData[] = []

  let prevRevenue = revenue
  let prevInvestedCapital = bookValueOfEquity + bookValueOfDebt - cashAndMarketableSecurities
  let cumulatedWacc = 1

  for (let yr = 1; yr <= 10; yr++) {
    // Revenue growth
    let revGrowth: number
    if (yr === 1) {
      revGrowth = revenueGrowthYear1
    } else if (yr <= 5) {
      revGrowth = revenueGrowthYears2to5
    } else {
      // Linear convergence from year 5 growth to terminal growth
      const year5Growth = revenueGrowthYears2to5
      revGrowth = year5Growth - ((year5Growth - terminalGrowthRate) / 5) * (yr - 5)
    }

    const rev = prevRevenue * (1 + revGrowth)

    // Operating margin
    let margin: number
    if (yr === 1) {
      margin = operatingMarginNextYear
    } else if (yr > yearOfConvergence) {
      margin = targetOperatingMargin
    } else {
      margin = targetOperatingMargin - ((targetOperatingMargin - operatingMarginNextYear) / yearOfConvergence) * (yearOfConvergence - yr)
    }

    const ebit = margin * rev

    // Tax rate
    let taxRate: number
    if (yr <= 5) {
      taxRate = effectiveTaxRate
    } else {
      taxRate = effectiveTaxRate + ((terminalTaxRate - effectiveTaxRate) / 5) * (yr - 5)
    }

    // EBIT(1-t) with NOL handling
    let ebitAfterTax: number
    if (ebit > 0) {
      ebitAfterTax = ebit * (1 - taxRate)
    } else {
      ebitAfterTax = ebit
    }

    // Reinvestment
    const salesToCap = yr <= 5 ? salesToCapitalRatioYears1to5 : salesToCapitalRatioYears6to10
    const reinvestment = (rev - prevRevenue) / salesToCap

    // FCFF
    const fcff = ebitAfterTax - reinvestment

    // Cost of capital (constant for simple model)
    const coc = costOfCapital

    // Cumulated WACC
    cumulatedWacc *= (1 + coc)

    // PV of FCFF
    const pvFcff = fcff / cumulatedWacc

    // Invested capital
    const investedCapital = prevInvestedCapital + reinvestment

    // Sales to capital ratio
    const stc = investedCapital !== 0 ? rev / investedCapital : 0

    // ROIC
    const roic = investedCapital !== 0 ? ebitAfterTax / investedCapital : 0

    years.push({
      year: yr,
      revenueGrowth: revGrowth,
      revenue: rev,
      operatingMargin: margin,
      ebit,
      taxRate,
      ebitAfterTax,
      reinvestment,
      fcff,
      costOfCapital: coc,
      cumulatedWacc,
      presentValueFcff: pvFcff,
      investedCapital,
      salesToCapital: stc,
      roic,
    })

    prevRevenue = rev
    prevInvestedCapital = investedCapital
  }

  // Terminal year
  const lastYear = years[9]
  const terminalRevenue = lastYear.revenue * (1 + terminalGrowthRate)
  const terminalEbit = targetOperatingMargin * terminalRevenue
  const terminalEbitAfterTax = terminalEbit * (1 - terminalTaxRate)
  const terminalReinvestment = terminalEbitAfterTax * terminalReinvestmentRate
  const terminalFcff = terminalEbitAfterTax - terminalReinvestment
  const terminalInvestedCapital = lastYear.investedCapital + terminalReinvestment
  const terminalRocActual = terminalInvestedCapital !== 0 ? terminalEbitAfterTax / terminalInvestedCapital : 0

  const terminalYear: YearlyData = {
    year: 11,
    revenueGrowth: terminalGrowthRate,
    revenue: terminalRevenue,
    operatingMargin: targetOperatingMargin,
    ebit: terminalEbit,
    taxRate: terminalTaxRate,
    ebitAfterTax: terminalEbitAfterTax,
    reinvestment: terminalReinvestment,
    fcff: terminalFcff,
    costOfCapital: terminalCostOfCapital,
    cumulatedWacc: cumulatedWacc * (1 + terminalCostOfCapital),
    presentValueFcff: 0,
    investedCapital: terminalInvestedCapital,
    salesToCapital: terminalGrowthRate / terminalReinvestmentRate,
    roic: terminalRocActual,
  }

  // Terminal Value
  const terminalValue = terminalFcff / (terminalCostOfCapital - terminalGrowthRate)
  const pvTerminalValue = terminalValue / cumulatedWacc

  // PV of cash flows
  const pvCashFlows = years.reduce((sum, y) => sum + y.presentValueFcff, 0)

  // Value of operating assets
  const valueOfOperatingAssets = pvCashFlows + pvTerminalValue

  // Distress adjustment
  let adjustmentForDistress = 0
  if (overrideFailure && probabilityOfFailure > 0) {
    const distressProceeds = inputs.distressProceedsBasis === 'B'
      ? (bookValueOfEquity + bookValueOfDebt - cashAndMarketableSecurities) * distressProceedsPercent
      : valueOfOperatingAssets * distressProceedsPercent
    adjustmentForDistress = valueOfOperatingAssets * (1 - probabilityOfFailure) + distressProceeds * probabilityOfFailure
  }

  const adjustedOpAssets = overrideFailure && probabilityOfFailure > 0
    ? adjustmentForDistress
    : valueOfOperatingAssets

  // Option value (simplified treasury stock approach)
  let optionValue = 0
  if (hasOptions && optionCount > 0) {
    optionValue = optionCount * (inputs.currentStockPrice - optionStrike)
    if (optionValue < 0) optionValue = 0
  }

  // Value of equity
  const valueOfEquity = adjustedOpAssets + cashAndMarketableSecurities + crossHoldings - bookValueOfDebt - minorityInterests - optionValue

  // Shares after dilution
  const dilutedShares = sharesOutstanding + (hasOptions && optionValue > 0 ? optionCount : 0)

  const valuePerShare = dilutedShares > 0 ? valueOfEquity / dilutedShares : 0

  return {
    years,
    terminalYear,
    terminalValue,
    pvTerminalValue,
    pvCashFlows,
    valueOfOperatingAssets,
    adjustmentForDistress: overrideFailure ? valueOfOperatingAssets - adjustedOpAssets : 0,
    valueOfEquity,
    valuePerShare,
    diagnostics: {
      revenueYear10: lastYear.revenue,
      ebitYear10: terminalEbit,
      roicYear10: terminalRocActual,
      costOfCapitalYear10: terminalCostOfCapital,
      terminalGrowthRate,
    },
  }
}
